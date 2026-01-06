package com.polus.fibicomp.cmp.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.polus.fibicomp.cmp.dto.CoiManagementPlanTemplateDto;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanTemplate;
import com.polus.fibicomp.cmp.service.CoiManagementPlanService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/cmp/template")
@RequiredArgsConstructor
@Slf4j
public class CoiManagementPlanTemplateController {

	private final CoiManagementPlanService cmpService;

	@PostMapping
	public CoiManagementPlanTemplate createTemplate(@RequestBody CoiManagementPlanTemplateDto template) {
		log.info("Request to create CMP template | templateName: {}", template.getTemplateName());
		return cmpService.createTemplate(template);
	}

	@PutMapping
	public CoiManagementPlanTemplate updateTemplate(@RequestBody CoiManagementPlanTemplateDto template) {
		log.info("Request to update CMP template | templateId: {}", template.getTemplateId());
		return cmpService.updateTemplate(template);
	}

	@DeleteMapping("/{id}")
	public void deleteTemplate(@PathVariable Integer id) {
		log.info("Request to delete CMP template | templateId: {}", id);
		cmpService.deleteTemplate(id);
	}

	@GetMapping
	public List<CoiManagementPlanTemplate> getAllTemplates() {
		log.info("Request to fetch all CMP templates");
		return cmpService.getAllTemplates();
	}

	@GetMapping("/{id}")
	public CoiManagementPlanTemplate getTemplateById(@PathVariable Integer id) {
		log.info("Request to fetch CMP template by ID | templateId: {}", id);
		return cmpService.getTemplateById(id);
	}

}
