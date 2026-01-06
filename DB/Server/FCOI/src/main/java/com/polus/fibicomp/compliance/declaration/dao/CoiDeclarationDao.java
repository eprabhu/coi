package com.polus.fibicomp.compliance.declaration.dao;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.List;

import com.polus.fibicomp.compliance.declaration.dto.DeclarationRequestDto;
import com.polus.fibicomp.compliance.declaration.pojo.CoiDeclarationReviewStatusType;
import com.polus.fibicomp.compliance.declaration.pojo.CoiDeclarationStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.fibicomp.compliance.declaration.pojo.CoiDeclActionLog;
import com.polus.fibicomp.compliance.declaration.pojo.CoiDeclaration;

@Transactional
@Service
public interface CoiDeclarationDao {

	/**
	 * Generates the next available declaration number.
	 *
	 * @return a new unique declaration number as a String
	 */
	String generateNextDeclarationNumber();

	/**
	 * Saves a COI declaration to the database.
	 *
	 * @param declaration the declaration entity to be saved
	 * @return the saved declaration
	 */
	CoiDeclaration saveDeclaration(CoiDeclaration declaration);

	/**
	 * Finds the active declaration for a given person and declaration type.
	 *
	 * @param personId            the person ID
	 * @param declarationTypeCode the type code of the declaration
	 * @return the active declaration if found; otherwise null
	 */
	CoiDeclaration findActiveDeclaration(String personId, String declarationTypeCode);

	/**
	 * Retrieves a declaration by its unique ID.
	 *
	 * @param declarationId the ID of the declaration
	 * @return the corresponding declaration
	 */
	CoiDeclaration findByDeclarationId(Integer declarationId);

	/**
	 * Updates an existing COI declaration in the database.
	 *
	 * @param declaration the updated declaration entity
	 */
	void updateDeclaration(CoiDeclaration declaration);

	/**
	 * Saves an action log entry related to a declaration.
	 *
	 * @param log the action log to be saved
	 */
	void saveActionLog(CoiDeclActionLog log);

	/**
	 * Finds declarations that are expiring based on the specified date and status.
	 *
	 * @param expiryDate            the expiry date to compare
	 * @param declarationStatusCodes the status of declarations to consider
	 * @param lessThanOrEqual       flag to indicate if the comparison should be <=
	 *                              or =
	 * @return list of expiring declarations
	 */
	List<CoiDeclaration> findExpiringDeclarations(Timestamp expiryDate, List<String> declarationStatusCodes,
			boolean lessThanOrEqual);

	/**
	 * Searches declarations based on person ID, status, type, and date range.
	 *
	 * @param personId              the person ID
	 * @param declarationStatusCode the status code
	 * @param declarationTypeCode   the declaration type
	 * @param fromDate              start date for filtering
	 * @param toDate                end date for filtering
	 * @return list of declarations matching the search criteria
	 */
	List<CoiDeclaration> searchDeclarations(String personId, String declarationStatusCode, String declarationTypeCode,
			LocalDate fromDate, LocalDate toDate);

	/**
	 * Retrieves all declarations submitted by a specific person.
	 *
	 * @param personId the ID of the person
	 * @return list of declarations
	 */
	List<CoiDeclaration> findAllDeclarationsByPerson(String personId);

	/**
	 * Retrieves all action logs for a given declaration.
	 *
	 * @param declarationId the declaration ID
	 * @return list of action logs
	 */
	List<CoiDeclActionLog> getActionLogsByDeclarationId(Integer declarationId);

	/**
	 * Checks if a declaration exists based on person ID, declaration type, and
	 * status.
	 * @param declarationTypeCode
	 * @param personId              the person ID
	 * @return true if such a declaration exists, false otherwise
	 */
	boolean existsDeclarationByParams(String personId, String declarationTypeCode);

	/**
	 * Retrieves the previous version of a declaration based on its number and
	 * version.
	 *
	 * @param declarationNumber the declaration number
	 * @param versionNumber     the version number
	 * @return the previous version of the declaration if available
	 */
	CoiDeclaration getPreviousDeclarationVersion(String declarationNumber, Integer versionNumber);

	/**
	 * Retrieves configured days before due date based on a notification ID.
	 *
	 * @param notificationId the ID of the notification
	 * @return list of days as integers
	 */
	List<Integer> getDaysToDueDateByNotificationId(Integer notificationId);

	/**
	 * Finds the latest declarations submitted by a person.
	 *
	 * @param personId the ID of the person
	 * @return list of latest declarations
	 */
	List<CoiDeclaration> findLatestDeclarationsByPersonId(String personId);

	/**
	 * This method check same admin person or admin group is added
	 * @param adminGroupId
	 * @param adminPersonId
	 * @param declarationId
	 * @return
	 */
	boolean isSameAdminPersonOrGroupAdded(Integer adminGroupId, String adminPersonId, Integer declarationId);

	/**
	 * This method is used to check an admin group or admin person is already added
	 * @param declarationId
	 * @return
	 */
	boolean isAdminPersonOrGroupAdded(Integer declarationId);

	/**
	 * This method is used to check the disclosure is in the given status
	 * @param declarationStatuses
	 * @param declarationId
	 * @return
	 */
	boolean isDeclarationWithStatuses(List<String> declarationStatuses, Integer declarationId);

	/**
	 * This method is used to update or add admin person/admin group
	 * @param assignAdminDto
	 * @param reviewStatusCode
	 * @return
	 */
	Timestamp assignAdmin(DeclarationRequestDto assignAdminDto, String reviewStatusCode);

	/**
	 * This method is used to update declaration review statuses
	 * @param declarationId
	 * @param declarationStatusCode
	 * @param reviewStatusCode
	 * @return
	 */
	Timestamp updateDeclarationStatues(Integer declarationId, String declarationStatusCode, String reviewStatusCode,
									   String versionStatus, boolean isSubmission, Timestamp expirationDate);

	/**
	 * Return or Withdraw Declaration
	 * @param reviewStatusCode
	 * @param declarationId
	 * @return
	 */
	Timestamp returnOrWithdrawDeclaration(String reviewStatusCode, Integer declarationId);

	/**
	 * This method fetched the review required flag
	 * @param declarationId
	 * @return
	 */
	boolean isReviewRequiredBasedonFormAns(Integer declarationId);

	/**
	 * This method is used to fetch Declaration Review status by review status code
	 * @param reviewStatusCode
	 * @return
	 */
	CoiDeclarationReviewStatusType getReviewStatusTypeByCode(String reviewStatusCode);

    /**
     * This method is used to fetch declaration status
     * @param declarationStatusCode
     * @return
     */
    CoiDeclarationStatus getDeclarationStatusTypeByCode(String declarationStatusCode);

    /**
	 * Retrieves a review status description by its unique ID.
	 *
	 * @param reviewStatusCode 
	 * @return CoiDeclarationReviewStatusType
	 */
    CoiDeclarationReviewStatusType findByReviewStatusCode(String reviewStatusCode);

    /**
     * This method is used to check the person is eligible to create a declaration
     * @param personId
     * @param declarationTypeCode
     * @return
     */
    boolean canCreateDeclaration(String personId, String declarationTypeCode);
    /**
     * This method is used to check the declaration is in the approval statuses
     * @param declarationStatusCodes
     * @param declarationId
     * @return
     */
    boolean isDeclarationWithApprovalStatuses(List<String> declarationStatusCodes, Integer declarationId);

    /**
     * This method is used to get next version number for a declaration
     * @param declarationNumber
     * @return
     */
    Integer getNextVersionNumber(String declarationNumber);

    /**
     * This method is used to archive previous version based on version status
     * @param declarationNumber
     * @param currentVersionNumber
     * @param versionStatus
     * @return
     */
    Timestamp archivePreviousVersionBasedOnStatus(String declarationNumber, Integer currentVersionNumber, String versionStatus);
}
