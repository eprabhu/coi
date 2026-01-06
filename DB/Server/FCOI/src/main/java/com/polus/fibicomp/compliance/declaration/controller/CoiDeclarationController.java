package com.polus.fibicomp.compliance.declaration.controller;

import java.util.Arrays;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.authorization.document.UserDocumentAuthorization;
import com.polus.fibicomp.coi.dto.HistoryDto;
import com.polus.fibicomp.compliance.declaration.dao.CoiDeclarationDao;
import com.polus.fibicomp.compliance.declaration.dto.DeclarationRequestDto;
import com.polus.fibicomp.compliance.declaration.dto.DeclarationResponse;
import com.polus.fibicomp.compliance.declaration.pojo.CoiDeclaration;
import com.polus.fibicomp.compliance.declaration.service.CoiDeclarationService;
import com.polus.fibicomp.constants.Constants;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/declaration")
@RequiredArgsConstructor
@Slf4j
public class CoiDeclarationController {

	private final CoiDeclarationService coiDeclarationService;

	private final CoiDeclarationDao coiDeclarationDao;

	private final UserDocumentAuthorization documentAuthorization;

	@PostMapping("/create")
	public ResponseEntity<Object> create(@RequestBody DeclarationRequestDto request) {
		String personId = AuthenticatedUser.getLoginPersonId();
		try {
			log.info("Received request to create new COI Declaration for personId: {} and type: {}", personId, request.getDeclarationTypeCode());
            if (!coiDeclarationService.canCreateDeclaration(personId, request.getDeclarationTypeCode())) {
                return new ResponseEntity<>("Person has no right/entry to create Declaration", HttpStatus.NO_CONTENT);
            }
			if (coiDeclarationService.existsDeclarationByParams(request)) {
				String message = String.format("Pending COI Declaration already exists for personId: %s", personId);
				log.info(message);
				return new ResponseEntity<>(message, HttpStatus.METHOD_NOT_ALLOWED);
			}

			return ResponseEntity.ok(coiDeclarationService.createDeclaration(request));

		} catch (Exception e) {
			log.error("Failed to create COI Declaration for personId: {}. Error: {}", personId, e.getMessage(), e);
			return new ResponseEntity<>("Failed to create declaration. Please try again later.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@GetMapping("/fetch/{id}")
	public ResponseEntity<Object> get(@PathVariable Integer id) {
		try {
			if (!documentAuthorization.isAuthorized(Constants.COI_DECLARATION_MODULE_CODE, id.toString(), AuthenticatedUser.getLoginPersonId())) {
				return new ResponseEntity<>("Not Authorized to view this Disclosure", HttpStatus.FORBIDDEN);
			}
			DeclarationResponse response = coiDeclarationService.getDeclaration(id);
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			log.error("Failed to fetch declaration with ID: {}. Error: {}", id, e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

	@PostMapping("/submit")
	public ResponseEntity<?> submitDeclaration(@RequestBody DeclarationRequestDto request) {
		DeclarationResponse response = coiDeclarationService.submitDeclaration(request);
        if (response.getDeclaration().getVersionStatus().equals(Constants.COI_ACTIVE_STATUS)) {
            coiDeclarationService.initiateSyncCoiDeclaration(response.getDeclaration().getDeclarationId());
        }
		return ResponseEntity.ok(response);
	}

	@PostMapping("/revise")
	public ResponseEntity<?> reviseDeclaration(@RequestBody DeclarationRequestDto request) {
		try {
            if (coiDeclarationService.existsDeclarationByParams(request)) {
				String message = "A declaration with pending status already exists for personId: " + AuthenticatedUser.getLoginPersonId() + ", declarationTypeCode: " + request.getDeclarationTypeCode();
				log.info(message);
				return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(message);
			}
            if (!coiDeclarationService.canCreateDeclaration(AuthenticatedUser.getLoginPersonId(), request.getDeclarationTypeCode())) {
                return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body("Person has no eligibility to revise Declaration");
            }

			DeclarationResponse response = coiDeclarationService.reviseDeclaration(request);
			return ResponseEntity.ok(response);

		} catch (Exception ex) {
			log.error("Unexpected error occurred during declaration revision for personId: {}", request.getPersonId(), ex);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
		}
	}

	@GetMapping("/getAvailableDeclarations/{personId}")
	public ResponseEntity<Object> getLatestDeclarations(@PathVariable String personId) {
		try {
			log.info("Received request to fetch latest COI declarations for personId: {}", personId);
			DeclarationResponse response = coiDeclarationService.findLatestDeclarationsByPersonId(personId);
			if (response == null || response.getDeclarations().isEmpty()) {
				log.info("No COI declarations found for personId: {}", personId);
				return ResponseEntity.noContent().build();
			}
			log.info("Returning {} COI declarations for personId: {}", response.getDeclarations().size(), personId);
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			log.error("Error fetching COI declarations for personId: {}", personId, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while fetching declarations. Please try again.");
		}
	}

	@GetMapping("/expire-check")
	public ResponseEntity<String> checkExpirations() {
		try {
			log.info("Started expiration check");
			coiDeclarationService.processExpiringDeclarations();
			log.info("Completed expiration check successfully");
			return ResponseEntity.ok("Expiration check executed.");
		} catch (Exception e) {
			log.error("Error while checking expirations: {}", e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to execute expiration check. Please try again later.");
		}
	}

	@GetMapping("/logs/{declarationId}")
	public ResponseEntity<Object> viewActionLogs(@PathVariable Integer declarationId) {
		try {
			log.info("Fetching action logs for declarationId: {}", declarationId);
			List<HistoryDto> logs = coiDeclarationService.getActionLogsByDeclarationId(declarationId);

			if (logs == null || logs.isEmpty()) {
				log.warn("No logs found for declarationId: {}", declarationId);
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No logs found for the given declaration ID.");
			}

			log.info("Retrieved {} logs for declarationId: {}", logs.size(), declarationId);
			return ResponseEntity.ok(logs);
		} catch (Exception e) {
			log.error("Error retrieving logs for declarationId {}: {}", declarationId, e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while fetching logs. Please try again later.");
		}
	}

	@PatchMapping("/assignAdmin")
	public ResponseEntity<Object> assignAdmin(@RequestBody DeclarationRequestDto declarationRequest) {
		log.info("Request for assignAdmin admin id : {}, admin group id: {}", declarationRequest.getAdminPersonId(), declarationRequest.getAdminGroupId());
        ResponseEntity<Object> response = coiDeclarationService.assignAdmin(declarationRequest);
//        coiDeclarationService.initiateSyncCoiDeclaration(declarationRequest.getDeclarationId());
        return response;
	}

	@PatchMapping("/completeAdminReview")
	public ResponseEntity<Object> completeDeclaration(@RequestBody DeclarationRequestDto declarationRequest) {
		log.info("Request for complete admin review | declaration id {} | is approved : {}", declarationRequest.getDeclarationId(), declarationRequest.getIsApproval());
        ResponseEntity<Object> response = coiDeclarationService.completeDeclarationReview(declarationRequest);
        coiDeclarationService.initiateSyncCoiDeclaration(declarationRequest.getDeclarationId());
        return response;
	}

	@PatchMapping("/withdraw")
	public ResponseEntity<Object> withdrawDeclaration(@RequestBody DeclarationRequestDto declarationRequest) {
		log.info("Request for withdrawDeclaration | declaration id {}", declarationRequest.getDeclarationId());
        ResponseEntity<Object> response = coiDeclarationService.withdrawDeclaration(declarationRequest);
//        coiDeclarationService.initiateSyncCoiDeclaration(declarationRequest.getDeclarationId());
        return response;
	}

	@PatchMapping("/return")
	public ResponseEntity<Object> returnDeclaration(@RequestBody DeclarationRequestDto declarationRequest) {
		log.info("Request for returnDeclaration | declaration id {}", declarationRequest.getDeclarationId());
        ResponseEntity<Object> response = coiDeclarationService.returnDeclaration(declarationRequest);
//        coiDeclarationService.initiateSyncCoiDeclaration(declarationRequest.getDeclarationId());
        return response;
	}

    @PatchMapping("/markAsVoid")
    public ResponseEntity<?> markAsVoid(@RequestBody DeclarationRequestDto declarationRequest) {
        log.info("Request for markAsVoid | declaration id {}", declarationRequest.getDeclarationId());
        return coiDeclarationService.markDeclarationAsVoid(declarationRequest);
    }
}
