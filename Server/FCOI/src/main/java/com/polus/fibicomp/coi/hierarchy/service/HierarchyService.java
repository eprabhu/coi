package com.polus.fibicomp.coi.hierarchy.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.polus.fibicomp.coi.dao.ConflictOfInterestDao;
import com.polus.fibicomp.coi.hierarchy.dao.HierarchyDao;
import com.polus.fibicomp.coi.hierarchy.dto.DisclosureDto;
import com.polus.fibicomp.coi.hierarchy.dto.HierarchyProjResponseDto;
import com.polus.fibicomp.coi.hierarchy.dto.HierarchyResponseDto;
import com.polus.fibicomp.coi.hierarchy.dto.ProjectHierarchyDto;
import com.polus.fibicomp.coi.hierarchy.dto.ProjectPersonDto;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiProjectType;
import java.util.Comparator;

@Service
public class HierarchyService {
	
	@Autowired
	private HierarchyDao hierarchyDao;

	@Autowired
	private ConflictOfInterestDao conflictOfInterestDao;

	public ResponseEntity<Object> fetchProjectTree(Integer moduleCode, String projectNumber) {
	    List<ProjectHierarchyDto> hierarchyData = hierarchyDao.getProjectRelations(moduleCode, projectNumber);
	    return new ResponseEntity<>(prepareProjectTree(hierarchyData), HttpStatus.OK);
	}

	private HierarchyResponseDto prepareProjectTree(List<ProjectHierarchyDto> hierarchyData) {
		HierarchyResponseDto rootNode = new HierarchyResponseDto();
		if (!hierarchyData.isEmpty()) {
			List<CoiProjectType> coiProjectTypes = conflictOfInterestDao.getCoiProjectTypes();
			Map<String, CoiProjectType> projectTypeMap = coiProjectTypes.stream().collect(Collectors.toMap(CoiProjectType::getCoiProjectTypeCode, Function.identity()));
			Map<String, HierarchyResponseDto> treeRoot = new HashMap<>();
			for (ProjectHierarchyDto data : hierarchyData) {
		        String awardNumber = data.getAwardNumber();
		        String ipNumber = data.getIpNumber();
		        String proposalNumber = data.getProposalNumber();
		        rootNode = prepareRootNode(treeRoot, awardNumber, Constants.AWARD_MODULE_CODE.toString(), projectTypeMap.get(Constants.AWARD_MODULE_CODE.toString()));
		        if (rootNode != null) {
		            prepareChildNode(rootNode, ipNumber, proposalNumber, projectTypeMap);
		        } else {
		            // Handle IP Node when there's no award number
		            rootNode = prepareRootNode(treeRoot, ipNumber, Constants.INST_PROPOSAL_MODULE_CODE.toString(), projectTypeMap.get(Constants.INST_PROPOSAL_MODULE_CODE.toString()));
		            if (rootNode != null) {
		                prepareInnerChildNode(rootNode, proposalNumber, projectTypeMap);
		            } else {
		                // Handle Proposal Node when there's no award or IP number
		                rootNode = prepareRootNode(treeRoot, proposalNumber, Constants.DEV_PROPOSAL_MODULE_CODE.toString(), projectTypeMap.get(Constants.DEV_PROPOSAL_MODULE_CODE.toString()));
		            }
		        }
		    }
		}
		return rootNode;
	}

	private HierarchyResponseDto prepareRootNode(Map<String, HierarchyResponseDto> rootMap, String projectNumber, String moduleCode, CoiProjectType projectType) {
		return (projectNumber != null) ? rootMap.computeIfAbsent(projectNumber, key -> {
	        HierarchyResponseDto dto = new HierarchyResponseDto();
	        dto.setProjectTypeCode(moduleCode);
	        if (projectType != null) {
	            dto.setProjectIcon(projectType.getProjectIcon());
	            dto.setProjectType(projectType.getDescription());
	        }
	        dto.setProjectNumber(projectNumber);
	        dto.setLinkedModule(new ArrayList<>());
	        return dto;
	    }) : null;
	}


	private void prepareChildNode(HierarchyResponseDto rootNode, String ipNumber, String proposalNumber, Map<String, CoiProjectType> projectTypeMap) {
		if (ipNumber != null) {
	        HierarchyResponseDto ipNode = rootNode.getLinkedModule().stream()
	                .filter(child -> child.getProjectNumber().equals(ipNumber)).findFirst()
	                .orElseGet(() -> {
	                    return setChildDetail(Constants.INST_PROPOSAL_MODULE_CODE.toString(), rootNode, ipNumber, projectTypeMap);
	                });
	        prepareInnerChildNode(ipNode, proposalNumber, projectTypeMap);
		}
	}

	private HierarchyResponseDto setChildDetail(String moduleCode, HierarchyResponseDto rootNode, String projectNumber, Map<String, CoiProjectType> projectTypeMap) {
		HierarchyResponseDto child = new HierarchyResponseDto();
        child.setProjectTypeCode(moduleCode);
        child.setProjectNumber(projectNumber);
        CoiProjectType projectType = projectTypeMap.get(moduleCode);
        if (projectType != null) {
	            child.setProjectIcon(projectType.getProjectIcon());
	            child.setProjectType(projectType.getDescription());
	        }
        child.setLinkedModule(new ArrayList<>());
        rootNode.getLinkedModule().add(child);
        return child;
	}

	private void prepareInnerChildNode(HierarchyResponseDto rootNode, String projectNumber, Map<String, CoiProjectType> projectTypeMap) {
		if (projectNumber != null) {
        	setChildDetail(Constants.DEV_PROPOSAL_MODULE_CODE.toString(), rootNode, projectNumber, projectTypeMap);
        }
	}

	public ResponseEntity<Object> fetchProjectDetails(Integer moduleCode, String projectNumber) {
		HierarchyProjResponseDto response = hierarchyDao.fetchProjectDetails(moduleCode, projectNumber);
		List<ProjectPersonDto> projectPersons = response.getProjectPersons();
		projectPersons.forEach(person -> {
			List<DisclosureDto> disclosures = hierarchyDao.getPersonDisclosures(moduleCode, projectNumber, person.getKeyPersonId());
			person.setDisclosures(disclosures);
			if (disclosures != null && !disclosures.isEmpty()) {
				DisclosureDto latestDisclosure = disclosures.stream().filter(d -> d.getCreateTimestamp() != null)
						.max(Comparator.comparing(DisclosureDto::getCreateTimestamp)).orElse(null);
				if (latestDisclosure != null && latestDisclosure.getReviewStatus() != null) {
					person.setOverallReviewStatus(latestDisclosure.getReviewStatus());
				}
			}
		});
		return new ResponseEntity<>(response, HttpStatus.OK);
	}
}
