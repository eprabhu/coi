package com.polus.fibicomp.travelDisclosure.controller;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.authorization.document.UserDocumentAuthorization;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.customValidation.validationGroups.AssignAdminValidation;
import com.polus.fibicomp.customValidation.validationGroups.CertifyValidation;
import com.polus.fibicomp.customValidation.validationGroups.CreateValidation;
import com.polus.fibicomp.customValidation.validationGroups.UpdateValidation;
import com.polus.fibicomp.customValidation.validationGroups.WithdrawValidation;
import com.polus.fibicomp.travelDisclosure.dtos.CoiTravelDisclosureDto;
import com.polus.fibicomp.travelDisclosure.services.TravelDisclService;

import lombok.extern.slf4j.Slf4j;

@RequestMapping("/travel")
@RestController
@Slf4j
public class TravelDisclCtrl {

    @Autowired
    private TravelDisclService travelDisclService;

    @Autowired
    private UserDocumentAuthorization documentAuthorization;

    @PostMapping("/create")
    @Validated(CreateValidation.class)
    public ResponseEntity<Object> createCoiTravelDisclosure(@RequestBody @Valid CoiTravelDisclosureDto vo) {
        log.info("Request for createCoiTravelDisclosure");
        return travelDisclService.createCoiTravelDisclosure(vo);
    }

    @PutMapping("/update")
    @Validated(UpdateValidation.class)
	public ResponseEntity<Object> updateCoiTravelDisclosure(@RequestBody @Valid CoiTravelDisclosureDto vo) {
		log.info("Request for updateCoiTravelDisclosure");
		return travelDisclService.updateCoiTravelDisclosure(vo);
	}

    @GetMapping("/load/{travelDisclosureId}")
    public ResponseEntity<Object> loadTravelDisclosure(@PathVariable Integer travelDisclosureId) {
        log.info("Request for loadTravelDisclosure | disclosureId : {}", travelDisclosureId);
        if (!documentAuthorization.isAuthorized(Constants.TRAVEL_MODULE_CODE, travelDisclosureId.toString(), AuthenticatedUser.getLoginPersonId())) {
            return new ResponseEntity<>("Not Authorized to view this Disclosure", HttpStatus.FORBIDDEN);
        }
        return travelDisclService.loadTravelDisclosure(travelDisclosureId);
    }

    @PatchMapping("/assignAdmin")
    @Validated(AssignAdminValidation.class)
    public ResponseEntity<Object> assignTravelDisclosureAdmin(@RequestBody @Valid CoiTravelDisclosureDto dto) {
        log.info("Requesting for assignTravelDisclosureAdmin");
        return travelDisclService.assignAdmin(dto);
    }

    @GetMapping("/history/{travelDisclosureId}")
    public ResponseEntity<Object> fetchHistory(@PathVariable Integer travelDisclosureId) {
        log.info("Requesting for fetchHistory");
        return travelDisclService.fetchHistory(travelDisclosureId);
    }

    @PostMapping("/certify")
    @Validated(CertifyValidation.class)
    public ResponseEntity<Object> certifyTravelDisclosure(@RequestBody @Valid CoiTravelDisclosureDto dto) {
        log.info("Requesting for certifyTravelDisclosure");
        return travelDisclService.certifyTravelDisclosure(dto);
    }

    @PostMapping(value = "/withdraw")
    @Validated(WithdrawValidation.class)
    public ResponseEntity<Object> withdrawTravelDisclosure(@RequestBody @Valid CoiTravelDisclosureDto dto) {
        log.info("Requesting for withdrawing TravelDisclosure");
        return travelDisclService.withdrawTravelDisclosure(dto);
    }

    @PostMapping(value = "/return")
    @Validated(WithdrawValidation.class)
    public ResponseEntity<Object> returnTravelDisclosure(@RequestBody @Valid CoiTravelDisclosureDto dto) {
        log.info("Requesting for returning TravelDisclosure");
        return travelDisclService.returnTravelDisclosure(dto);
    }

    @PostMapping(value = "/approve")
    public ResponseEntity<Object> approveTravelDisclosure(@RequestBody @Valid CoiTravelDisclosureDto dto) {
        log.info("Requesting for approving TravelDisclosure");
        return travelDisclService.approveTravelDisclosure(dto);
    }

    @GetMapping("/relatedDisclosures/{personEntityNumber}")
    public ResponseEntity<Object> getRelatedDisclosures(@PathVariable("personEntityNumber") Integer personEntityNumber) {
        log.info("Requesting for getRelatedDisclosures");
        return travelDisclService.getRelatedDisclosures(personEntityNumber);
    }

    @GetMapping("/lookups")
    public ResponseEntity<Object> getLookups() {
        log.info("Requesting for getLookups");
        return travelDisclService.getLookups();
    }
}
