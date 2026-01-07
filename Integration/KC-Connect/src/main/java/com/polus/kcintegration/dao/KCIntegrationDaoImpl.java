package com.polus.kcintegration.dao;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;
import com.fasterxml.jackson.databind.ObjectMapper;

@Transactional
@Service
public class KCIntegrationDaoImpl implements KCIntegrationDao {

	protected static Logger logger = LogManager.getLogger(KCIntegrationDaoImpl.class.getName());

	@Override
	public String convertObjectToJSON(Object object) {
		String response = "";
		ObjectMapper mapper = new ObjectMapper();
		try {
			mapper.setVisibility(PropertyAccessor.FIELD, Visibility.ANY);
			response = mapper.writeValueAsString(object);
		} catch (Exception e) {
			logger.error("Error occured in convertObjectToJSON : {}", e.getMessage());
		}
		return response;
	}

}
