package com.polus.kcintegration.exception.service;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.WebRequest;

import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.kcintegration.exception.custom.IntegrationCustomException;
import com.polus.kcintegration.exception.pojo.IntegrationExceptionLog;
import com.polus.kcintegration.exception.repository.IntegrationExceptionLogRepository;

@Service
public class IntegrationExceptionLogService {

	private static final Logger logger = LoggerFactory.getLogger(IntegrationExceptionLogService.class);

	@Autowired
	private IntegrationExceptionLogRepository integrationExceptionLogRepository;

	@Transactional
	public void logException(Exception ex, WebRequest request, Object requestObject) {
		try {
			integrationExceptionLogRepository.save(createLog(ex, request, requestObject));
		} catch (Exception e) {
			logger.error("Error occurred while logging exception: {}", e.getMessage());
			throw new IntegrationCustomException("Failed to log exception", e);
		}
	}

	private IntegrationExceptionLog createLog(Exception ex, WebRequest request, Object requestObject) {
		IntegrationExceptionLog log = new IntegrationExceptionLog();
		log.setTimestamp(LocalDateTime.now());
		log.setExceptionType(ex.getClass().getName());
		log.setExceptionMessage(ex.getMessage());
		log.setStackTrace(getStackTraceAsString(ex));
		log.setUrl(request.getDescription(false));
		if (requestObject != null) {
			log.setRequestObject(convertObjectToJSON(requestObject));
		}
		return log;
	}

	private String getStackTraceAsString(Exception ex) {
		StringBuilder result = new StringBuilder();
		for (StackTraceElement element : ex.getStackTrace()) {
			result.append(element.toString()).append("\n");
		}
		return result.toString();
	}

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
