package com.polus.integration.dao;

import java.sql.Timestamp;
import java.util.Calendar;
import java.util.Date;
import java.util.UUID;

import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.StoredProcedureQuery;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;
import com.fasterxml.jackson.databind.ObjectMapper;


@Transactional
@Service
public class IntegrationDaoImpl implements IntegrationDao {

	protected static Logger logger = LogManager.getLogger(IntegrationDaoImpl.class.getName());

    @Autowired
    private EntityManager entityManager;

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

	@Override
	public Timestamp getCurrentTimestamp() {
		return new Timestamp(this.getCurrentDate().getTime());
	}

	@Override
	public Date getCurrentDate() {
		Calendar c = Calendar.getInstance();
		c.setTime(new Date());
		return c.getTime();
	}

	@Override
	public String generateUUID() {
		return UUID.randomUUID().toString();
	}

    @Override
    public void updateDeclarationPersonEligibility(String projectNumber, Integer moduleCode) {
        try {
            StoredProcedureQuery query = entityManager
                    .createStoredProcedureQuery("UPDT_PERSON_DECLRATION_ELGBLTY");
            query.registerStoredProcedureParameter("AV_PROJECT_NUMBER", String.class, ParameterMode.IN);
            query.registerStoredProcedureParameter("AV_MODULE_CODE", Integer.class, ParameterMode.IN);
            query.setParameter("AV_PROJECT_NUMBER", projectNumber);
            query.setParameter("AV_MODULE_CODE", moduleCode);
            query.execute();
        } catch (Exception e) {
            logger.error("Error occured in updateDeclarationPersonEligibility : {}", e.getMessage());
        }
    }
}
