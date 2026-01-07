package com.polus.integration.dao;

import java.sql.Timestamp;
import java.util.Date;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@Service
public interface IntegrationDao {

	/**
	 * This method is used to convert Object into JSON format.
	 * 
	 * @param object - request object.
	 * @return response - JSON data.
	 */
	public String convertObjectToJSON(Object object);

	/**
	 * this method is used for get current date
	 * 
	 * @return current date
	 */
	public Date getCurrentDate();

	/**
	 * This method is used to retrieve current Timestamp.
	 * 
	 * @return current Timestamp.
	 */

	public Timestamp getCurrentTimestamp();

	/**
	 * @return
	 */
	public String generateUUID();

    /**
     * This method is used to update declaration person eligibility
     * @param projectNumber
     * @param moduleCode
     */
    void updateDeclarationPersonEligibility(String projectNumber, Integer moduleCode);

}
