package com.polus.kcintegration.dao;

import com.polus.kcintegration.pojo.Person;

public interface KCIntegrationDao {


	/**
	 * This method is used to convert Object into JSON format.
	 * 
	 * @param object - request object.
	 * @return response - JSON data.
	 */
	public String convertObjectToJSON(Object object);
}
