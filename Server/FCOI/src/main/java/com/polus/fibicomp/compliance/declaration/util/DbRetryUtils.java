package com.polus.fibicomp.compliance.declaration.util;

import java.sql.SQLException;
import java.util.function.Supplier;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class DbRetryUtils {

	private static final int DEFAULT_RETRY_COUNT = 3;

	private DbRetryUtils() {
		// prevent instantiation
	}

	public static <T> T retryWithDeadlockHandling(Supplier<T> action, String errorMessage) {
		return retryWithDeadlockHandling(action, errorMessage, DEFAULT_RETRY_COUNT);
	}

	public static <T> T retryWithDeadlockHandling(Supplier<T> action, String errorMessage, int retryLimit) {
		int retryCount = 0;

		while (retryCount < retryLimit) {
			try {
				return action.get();
			} catch (RuntimeException e) {
				Throwable cause = e.getCause();
				if (cause instanceof SQLException && isDeadlockException((SQLException) cause)) {
					retryCount++;
					log.warn("Deadlock detected. Retrying... attempt {}", retryCount);
					if (retryCount == retryLimit) {
						log.error("Max retry attempts reached: {}", errorMessage);
						throw new RuntimeException("Deadlock retry limit reached: " + errorMessage, e);
					}
				} else {
					throw e;
				}
			}
		}

		throw new RuntimeException("Unexpected failure in DB retry block");
	}

	private static boolean isDeadlockException(SQLException e) {
		String sqlState = e.getSQLState();
		int errorCode = e.getErrorCode();
		String message = e.getMessage().toLowerCase();

		return (sqlState != null && sqlState.equals("40001")) || message.contains("deadlock") || errorCode == 1213 || // MySQL
				errorCode == 60 || // Oracle
				errorCode == 1205; // SQL Server
	}
}
