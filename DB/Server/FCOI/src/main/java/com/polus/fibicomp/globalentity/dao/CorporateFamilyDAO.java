package com.polus.fibicomp.globalentity.dao;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.fibicomp.globalentity.dto.CorporateFamilyRequestDTO;
import com.polus.fibicomp.globalentity.dto.CorporateFamilyResponseDTO;
import com.polus.fibicomp.globalentity.pojo.EntityFamilyTree;
import com.polus.fibicomp.globalentity.pojo.EntityFamilyTreeRole;

@Transactional
@Service
public interface CorporateFamilyDAO {

	void createCorporateFamily(EntityFamilyTree entity);

	void insertFamilyTreeRoles(EntityFamilyTreeRole entityFamilyTreeRole);

	void updateParent(CorporateFamilyRequestDTO dto);

	List<CorporateFamilyResponseDTO> fetchCorporateFamily(Integer entityNumber);

	Boolean isEntityPresent(Integer entityNumber);

	Boolean isValidParent(Integer entityNumber);

	Boolean isParentLinked(Integer entityId);

	Boolean isEntityRoleTypePresent(Integer entityNumber, String roleTypeCode);

	/*
	 * To check if the entity being passed does not have any parent or child
	 */
	Boolean isParentSingleNode(Integer entityNumber);

	Integer getParentEntityIdEntityId(Integer entityNumber);

	int unlinkEntity(Integer entityNumber);

	int deleteEntityFromFamilyTree(Integer entityNumber);

	int deleteAllEntityFromFamilyTree(List<Integer> entityNumbers);

    void deleteEntityFamilyTreeRole(Integer entityNumber);

	boolean fetchExistingParentIs(Integer entityNumber, Integer parentEntityNumber);

}
