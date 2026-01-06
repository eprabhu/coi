package com.polus.fibicomp.coi.service;

import java.util.List;
import java.util.Map;

import com.polus.core.common.dto.ResponseData;
import com.polus.core.person.pojo.Person;
import com.polus.core.pojo.Organization;
import com.polus.core.vo.CommonVO;

import org.springframework.http.ResponseEntity;

import com.polus.fibicomp.coi.dto.EvaluateFormRequestDto;
import com.polus.fibicomp.coi.dto.LookupRequestDto;
import com.polus.fibicomp.coi.dto.LookupResponseDto;

public interface GeneralService {

    /**
     * This method is used to fetch Admin groups and Persons
     * @param moduleCode
     * @return List<Object>
     */
    ResponseEntity<Object> fetchAdminGroupsAndPersons(Integer moduleCode);

    /**
     * This method is used to fetch rights
     *
     * @return List<String> rights
     */
	ResponseEntity<Object> fetchAllCoiOpaRights();

    /**
     *
     * @return
     */
    ResponseEntity<Object> fetchRequiredParams();

    /**
     * To check if a person have rights
     * @param personId
     * @param rightNames
     * @return
     */
	boolean checkPersonHasPermission(String personId, String rightNames);

	/**
     * To evaluate form response
     * @param EvaluateFormRequestDto dto
     * @return Map of evaluated boolean result 
     */
	Map<String, Boolean> evaluateFormResponse(EvaluateFormRequestDto dto);

    /**
     * Fetches lookup values based on the provided request.
     * If isActive is 'Y', the query filters for active records.
     * If isActive is 'N', the query filters for inactive records.
     * If isActive is null or empty, it returns all records.
     *
     * @param requestDto The lookup request containing table name, column name, and isActive.
     * @return A list of LookupResponseDto containing code and description.
     */
    List<LookupResponseDto> getLookupValues(LookupRequestDto requestDto);

    /**
     * To check if a person have rights
     * @param rightNames
     * @return
     */
	boolean checkPersonHasPermission(String rightNames);

    /**
     * Get All Letter Template Types
     * @param moduleCode
     * @return
     */
    ResponseEntity<Object> getAllLetterTemplateTypes(Integer moduleCode);

    /**
     * check if disclosure is required
     * @return
     */
    public Boolean isDisclosureRequired();

    
    /**
     * Checks if any of the specified rights are granted at department level for the given unit.
     * 
     * @param unitNumber department unit identifier
     * @param rights list of rights to check
     * @return true if any right is available, false otherwise
     */
    boolean isDeptLevelRightsAvailable(String unitNumber, List<String> rights);

    /**
     * Retrieves the department-level permission status for each specified right.
     *
     * @param unitNumber department unit identifier
     * @param rights list of rights to check
     * @return map of right name to its availability status
     */
	Map<String, Boolean> getDeptLevelAvailableRights(String unitNumber, List<String> rights);

    /**
     * Retrieves a list of contract administrators matching the given search criteria.
     * 
     * @param searchString search keyword to filter contract administrators
     * @return list of matching contract administrators
     */
	List<Person> findContractAdministrators(String searchString);

	/**
     *  Retrieves the count of pending action list items for the given person.
     *
     * @param personId
     * @return return the count of pending action list items
     */
	int getPendingActionItemsCount(String personId);

    /**
     * Get All Letter Template Types
     * @param moduleCode
     * @return
     */
    ResponseEntity<Object> getAllLetterTemplateTypes(Integer moduleCode, Integer subModuleCode);

    /**
     * Get organization list
     * @param CommonVO
     * @return list of Organization
     */
	List<Organization> findOrganizationList(CommonVO vo);
}
