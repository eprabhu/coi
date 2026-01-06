package com.polus.fibicomp.coi.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.polus.fibicomp.coi.clients.model.EntityDnBUpwardFamilyTreeResponse;
import com.polus.fibicomp.coi.dto.AwardDTO;
import com.polus.fibicomp.coi.dto.AwardPersonDTO;
import com.polus.fibicomp.coi.dto.DnBOrganizationDetails;
import com.polus.fibicomp.globalentity.dto.DnBEntityEnrichRequestDTO;

@FeignClient("FIBI-COI-CONNECT")
public interface FibiCoiConnectClient {

	@GetMapping("fibi-coi-connect/duns/{dunsNumber}/upwardFamilyTree")
	ResponseEntity<EntityDnBUpwardFamilyTreeResponse> getUpwardFamilyTree(@PathVariable("dunsNumber") String dunsNumber);

	@GetMapping("fibi-coi-connect/duns/{dunsNumber}/search")
	ResponseEntity<DnBOrganizationDetails> searchDuns(@PathVariable("dunsNumber") String dunsNumber);

	@PostMapping("fibi-coi-connect/enrich/entity/runEnrich")
	ResponseEntity<Object> performEnrich(@RequestBody DnBEntityEnrichRequestDTO request);

	@PutMapping("/fibi-coi-connect/updateAwardDisclosureValidationFlag")
    void updateAwardDisclosureValidationFlag(@RequestBody AwardDTO dto);

	@PutMapping("/fibi-coi-connect/updateAwardKPDisclosureRequirements")
    void updateAwardKPDisclosureRequirements(@RequestBody AwardPersonDTO dto);

	@GetMapping("/fibi-coi-connect/dunsRefresh/register/dunsMonitoring/{dunsNumber}")
	void registerDunsMonitoring(@PathVariable("dunsNumber") String dunsNumber);

}
