package com.polus.fibicomp.coi.dao;

import java.util.List;

import com.polus.core.person.pojo.Person;
import com.polus.core.pojo.LetterTemplateType;
import com.polus.core.pojo.State;
import com.polus.fibicomp.coi.dto.EvaluateFormRequestDto;
import com.polus.fibicomp.coi.dto.LookupRequestDto;
import com.polus.fibicomp.coi.dto.LookupResponseDto;

/**
 * General Dao
 */
public interface GeneralDao {

    /**
     * This method is used to check a person is in reviewer table
     *
     * @param personId
     * @return
     */
    boolean isPersonInReviewer(String personId);

	/**
     * This method is used to fetch rights
     *
     * @return List<String> rights
     */
	List<String> fetchAllCoiOpaRights(String loginPersonId);

    /**
     * This method checks the person is assigned to a OPA review
     * @param loginPersonId
     * @return
     */
    boolean isPersonInOPAReviewer(String loginPersonId);

	/**
	 * @param messageTypeCode
	 * @return
	 */
	public String getAlertTypeByMessageCode(String messageTypeCode);

	/**
	 * @param EvaluateFormRequestDto dto
	 * @return Boolean response
	 */
	Boolean evaluateFormResponse(EvaluateFormRequestDto dto);

    /**
     * Fetches lookup values based on the provided request.
     * If isActive is 'Y', the query filters for active records.
     * If isActive is 'N', the query filters for inactive records.
     * If isActive is null or empty, it returns all records.
     *
     * @param requestDto The lookup request containing table name, column name, and isActive.
     * @return A list of LookupResponseDto containing code, description.
     */
    List<LookupResponseDto> getLookupValues(LookupRequestDto requestDto);


	/**
	 * Find State by state code
	 * @param stateCode
	 * @return
	 */
	State findStateByStateCode(String stateCode);

	/**
	 * Find State by state code & country code
	 * @param stateCode
	 * @param countryCode
	 * @return
	 */
	State findStateByStateCodeCountryCode(String stateCode, String countryCode);

	/**
	 * Fetch rights
	 * @param loginPersonId
	 * @param moduleCode
	 * @param leadUnit
	 * @param moduleItemKey
	 * @return
	 */
	List<String> fetchRightsByModule(String loginPersonId, Integer moduleCode, String leadUnit, Integer moduleItemKey);
	
	/**
     * Checks whether the given person is a reviewer for the specified module.
     *
     * @param personId
     * @param moduleCode
     * @return
     */
    boolean isPersonReviewerForModule(String personId, Integer moduleCode);

    /**
     * Retrieves a list of contract administrators matching the given search criteria.
     *
     * @param searchString the search keyword to filter contract administrators by name or personId
     * @return a list of objects representing matching contract administrators
     */
	List<Person> getContractAdministrators(String searchString);

	/**
     * Retrieves the count of pending action list items for the given person.
     *
     * @param personId
     * @return the count of pending action list items
     */
	int getPendingActionItemCountForPerson(String personId);

    /**
     * Get All Letter Template Types
     * @param moduleCode
     * @param subModuleCode
     * @return
     */
    List<LetterTemplateType> getAllLetterTemplateTypes(Integer moduleCode, Integer subModuleCode);

	boolean isPersonInCmpReviewer(String loginPersonId);
}
