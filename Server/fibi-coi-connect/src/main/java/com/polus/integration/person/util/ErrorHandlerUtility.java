package com.polus.integration.person.util;

import java.io.PrintWriter;
import java.io.StringWriter;

import com.polus.integration.person.pojo.PersonFeedReport;

import feign.FeignException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class ErrorHandlerUtility {

	public static void handleFeignException(FeignException feignEx, PersonFeedReport report, String contextMessage) {
		String exceptionMessage = feignEx.getMessage();
		int status = feignEx.status();

		if (status == -1) {
			log.error("Timeout or connection error in context [{}]: {}", contextMessage, exceptionMessage, feignEx);
			report.setExceptionDetails(getStackTraceAsString(feignEx));
			report.setFeedStatus("ERROR");
			throw new RuntimeException("Timeout or connection error in context: " + contextMessage, feignEx);
		} else {
			log.error("FeignException in context [{}]: Status: {}, Message: {}", contextMessage, status, exceptionMessage, feignEx);
			report.setExceptionDetails(getStackTraceAsString(feignEx));
			report.setFeedStatus("ERROR");
			throw new RuntimeException("Feign client error in context: " + contextMessage, feignEx);
		}
	}

	public static void handleUnexpectedException(Exception ex, PersonFeedReport report, String contextMessage) {
		String exceptionMessage = ex.getMessage();

		log.error("Unexpected error in context [{}]: {}", contextMessage, exceptionMessage, ex);
		report.setExceptionDetails(getStackTraceAsString(ex));
		report.setFeedStatus("ERROR");
		throw new RuntimeException("Unexpected error in context: " + contextMessage, ex);
	}

	private static String getStackTraceAsString(Throwable throwable) {
		StringWriter sw = new StringWriter();
		try (PrintWriter pw = new PrintWriter(sw)) {
			throwable.printStackTrace(pw);
			return sw.toString();
		}
	}

}
