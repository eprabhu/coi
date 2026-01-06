package com.polus.fibicomp.coi.clients;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.polus.fibicomp.coi.clients.model.ApplicableFormRequest;
import com.polus.fibicomp.coi.clients.model.ApplicableFormResponse;
import com.polus.fibicomp.coi.clients.model.BlankFormRequest;
import com.polus.fibicomp.coi.clients.model.BlankFormResponse;
import com.polus.fibicomp.coi.clients.model.FormEvaluateValidationResponse;
import com.polus.fibicomp.coi.clients.model.FormRequest;
import com.polus.fibicomp.coi.clients.model.FormResponse;
import com.polus.fibicomp.coi.clients.model.FormValidationRequest;
import com.polus.fibicomp.config.FeignConfig;

/**
 * We can customize here if need
 * <a href="https://polussoftware0-my.sharepoint.com/:w:/g/personal/ajin_vs_polussolutions_com/EbsVHRTRLuZDv7iLDbM9Nc0BHYb5tc-juKji954sbX7JJQ?e=2Ivthl"> documentation</a>
 */
@FeignClient(name = "FIBI-FORM-BUILDER", configuration = FeignConfig.class)
public interface FormBuilderClient {

    @PostMapping("/formbuilder/getApplicableForms")
    ResponseEntity<List<ApplicableFormResponse>> getApplicableForms(@RequestBody ApplicableFormRequest request);

    @PostMapping("/formbuilder/getForm")
    ResponseEntity<FormResponse> getForm(@RequestBody FormRequest request);

    @PostMapping("/formbuilder/getBlankForm")
    ResponseEntity<BlankFormResponse> getBlankForm(@RequestBody BlankFormRequest request);

    @PostMapping("/formbuilder/copyForm")
    ResponseEntity<FormResponse> copyForm(@RequestBody FormRequest request);
    
    @PostMapping("/formbuilder/updateOpaDisclPersonEntityRel")
    ResponseEntity<FormResponse> updateOpaDisclPersonEntityRel(@RequestBody FormRequest request);
    
    @GetMapping("/formbuilder/getFormBuilderSectionName/{formBuilderSectionId}")
    String getFormBuilderSectionName(@PathVariable(value = "formBuilderSectionId") Integer formBuilderSectionId);
    
	@GetMapping("/formbuilder/getLinkedOpaDisclPersonEntity/{personEntityNumber}/{disclosureId}")
	public ResponseEntity<Object> getLinkedOpaDisclPersonEntity(@PathVariable Integer personEntityNumber,
			@PathVariable Integer disclosureId);

	@PostMapping("/formbuilder/validateForm")
    ResponseEntity<List<FormEvaluateValidationResponse>> validateForm(@RequestBody FormValidationRequest formValidationRequest);

}
