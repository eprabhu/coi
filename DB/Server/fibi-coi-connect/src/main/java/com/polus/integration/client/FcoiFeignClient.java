package com.polus.integration.client;

import com.polus.integration.client.config.FeignConfig;
import com.polus.integration.entity.cleansematch.dto.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.polus.integration.award.vo.UserNotifyRequestVO;
import com.polus.integration.instituteProposal.vo.DisclosureSyncVO;
import com.polus.integration.proposal.vo.CreateProposalDisclosureVO;
import com.polus.integration.proposal.vo.MarkVoidVO;
import com.polus.integration.proposal.vo.ProposalUserNotifyReqVO;
import com.polus.integration.proposal.vo.ValidateDisclosureVO;
import com.polus.integration.vo.COIActionLogVO;

import java.util.List;
import java.util.Map;

@FeignClient(name = "FCOI", configuration = FeignConfig.class)
public interface FcoiFeignClient {

	@PostMapping("/coi/fcoiDisclosure/validate")
	public ResponseEntity<Object> validateDisclosure(@RequestBody ValidateDisclosureVO vo);

	@PostMapping("/coi/fcoiDisclosure")
	public ResponseEntity<Object> createDisclosure(@RequestBody CreateProposalDisclosureVO vo);

	@PutMapping("/coi/fcoiDisclosure/integration/syncNeeded")
	public ResponseEntity<Object> updateProjectDisclosureFlag(@RequestBody DisclosureSyncVO vo);
	
	@PostMapping("/coi/fcoiDisclosure/integration/makeVoid")
	public ResponseEntity<Object> makeDisclosureVoid(@RequestBody MarkVoidVO vo);
	
	@PostMapping(value = "/coi/entity/logAction")
	public ResponseEntity<Object> logAction(@RequestBody COIActionLogVO vo);

	@PostMapping(value = "/coi/entity/create/fromFeed")
	public ResponseEntity<Map<String, Integer>> createEntity(@RequestBody CoiEntityFeedRequestDto dto, @RequestHeader("Cookie") String cookie);

	@GetMapping(value = "/coi/entity/fetch/{entityId}")
	public ResponseEntity<EntityResponseDTO> fetchEntityDetails(@PathVariable(value = "entityId") Integer entityId);
	
	@PostMapping("/coi/fcoiDisclosure/integration/notifyUserForDisclosureCreation")
	public void notifyUserForDisclosureCreation(@RequestBody UserNotifyRequestVO vo);

	@PostMapping(value = "/coi/entity/saveExternalReference/fromFeed")
	public void saveExternalReference(@RequestBody ExternalReferenceRequestDTO dto, @RequestHeader("Cookie") String cookie);

	@PostMapping(value = "/coi/entity/validateDuplicate")
	public ResponseEntity<List<validateDuplicateResponseDTO>> validateDuplicate(@RequestBody ValidateDuplicateRequestDTO dto);

	@PostMapping(value = "/coi/entity/updateSponsorOrg/fromFeed")
	public ResponseEntity<Object> updateEntitySponsorOrgDetailsFromFeed(@RequestBody CoiEntityFeedRequestDto dto, @RequestHeader("Cookie") String cookie);

	@PostMapping(value = "/coi/entity/syncGraph")
	public void syncGraph(@RequestBody Integer entityId);

	@PostMapping(value = "/coi/entity/fromFeed/verifyEntity")
	public void verifyEntityFromFeed(@RequestBody CoiEntityRequestDTO dto, @RequestHeader("Cookie") String cookie);

	@PostMapping("/coi/fcoiDisclosure/integration/deleteUserInboxForDisclosureCreation")
	public void deleteUserInboxForDisclosureCreation(@RequestBody UserNotifyRequestVO vo);

	@PostMapping("/coi/fcoiDisclosure/integration/notifyUserForDisclSubmission")
	public void notifyUserForDisclSubmission(ProposalUserNotifyReqVO vo);

	@PostMapping("/coi/entity/create/dunsRefreshVersion/{entityId}/{entityNumber}")
	ResponseEntity<Map<String, Object>> createDunsRefreshVersion(@PathVariable("entityId") Integer entityId, @PathVariable("entityNumber") Integer entityNumber);

	@PostMapping(value = "/coi/entity/verify/{entityId}/fromDunsMonitoring")
	void verifyEntityFromDunsMonitoring(@PathVariable("entityId") Integer entityId);
}
