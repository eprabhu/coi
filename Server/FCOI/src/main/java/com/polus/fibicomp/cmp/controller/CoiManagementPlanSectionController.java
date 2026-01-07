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

import com.polus.fibicomp.cmp.dto.CoiManagementPlanSectionDto;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanSection;
import com.polus.fibicomp.cmp.service.CoiManagementPlanService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/cmp/section")
@AllArgsConstructor
@Slf4j
public class CoiManagementPlanSectionController {

	private final CoiManagementPlanService cmpService;

	@PostMapping
	public CoiManagementPlanSection createSection(@RequestBody CoiManagementPlanSectionDto section) {
		log.info("Request to create CMP section | sectionName: {}", section.getSectionName());
		return cmpService.createSection(section);
	}

	@PutMapping
	public CoiManagementPlanSection updateSection(@RequestBody CoiManagementPlanSectionDto section) {
		log.info("Request to update CMP section | sectionId: {}", section.getSectionId());
		return cmpService.updateSection(section);
	}

	@DeleteMapping("/{id}")
	public void deleteSection(@PathVariable Integer id) {
		log.info("Request to delete CMP section | sectionId: {}", id);
		cmpService.deleteSection(id);
	}

	@GetMapping
	public List<CoiManagementPlanSection> getAllSections() {
		log.info("Request to fetch all CMP sections");
		return cmpService.getAllSections();
	}

	@GetMapping("/{id}")
	public CoiManagementPlanSection getSectionById(@PathVariable Integer id) {
		log.info("Request to fetch CMP section by ID | sectionId: {}", id);
		return cmpService.getSectionById(id);
	}

}
