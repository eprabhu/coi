package com.polus.fibicomp.cmp.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.polus.fibicomp.cmp.dto.CoiManagementPlanSecTmplMappingDto;
import com.polus.fibicomp.cmp.pojo.CoiMgmtPlanTmplSecMapping;
import com.polus.fibicomp.cmp.service.CoiManagementPlanService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/cmp/sec-templ-mapping")
@AllArgsConstructor
@Slf4j
public class CoiManagementPlanSecTmplMappingController {

	private final CoiManagementPlanService cmpService;

	@PostMapping
	public CoiMgmtPlanTmplSecMapping createMapping(@RequestBody CoiManagementPlanSecTmplMappingDto mapping) {
		log.info("Request to create CMP template-section mapping | templateId: {}, sectionId: {}",
				mapping.getTemplateId(), mapping.getSectionId());
		return cmpService.createMapping(mapping);
	}

	@PutMapping
	public CoiMgmtPlanTmplSecMapping updateMapping(@RequestBody CoiManagementPlanSecTmplMappingDto mapping) {
		log.info("Request to update CMP template-section mapping | mappingId: {}", mapping.getTmplSecMappingId());
		return cmpService.updateMapping(mapping);
	}

	@DeleteMapping("/{id}")
	public void deleteMapping(@PathVariable Integer id) {
		log.info("Request to delete CMP template-section mapping | mappingId: {}", id);
		cmpService.deleteMapping(id);
	}

	@GetMapping
	public Map<String, List<CoiMgmtPlanTmplSecMapping>> getAllMappings() {
		log.info("Request to fetch all CMP template-section mappings");
		return cmpService.getAllMappings();
	}

	@GetMapping("/{id}")
	public CoiMgmtPlanTmplSecMapping getMappingById(@PathVariable Integer id) {
		log.info("Request to fetch CMP template-section mapping by ID | mappingId: {}", id);
		return cmpService.getMappingById(id);
	}

	@GetMapping("/section/{id}")
	public List<CoiMgmtPlanTmplSecMapping> getMappingBySectionId(@PathVariable Integer id) {
		log.info("Request to fetch CMP template-section mappings by sectionId | sectionId: {}", id);
		return cmpService.getMappingBySectionId(id);
	}

}
