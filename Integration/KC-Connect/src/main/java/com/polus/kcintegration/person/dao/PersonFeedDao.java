package com.polus.kcintegration.person.dao;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.kcintegration.exception.custom.IntegrationCustomException;
import com.polus.kcintegration.person.vo.PersonFeedResponse;
import com.polus.kcintegration.pojo.Person;

import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.PersistenceException;
import jakarta.persistence.Query;
import jakarta.persistence.StoredProcedureQuery;
import lombok.extern.slf4j.Slf4j;

@Transactional
@Service
@Slf4j
public class PersonFeedDao {

	@Autowired
	private EntityManager entityManager;

	/**
	 * Fetches FIBI COI person hashes using a stored procedure.
	 *
	 * @param personId    the ID of the person.
	 * @param requestDate the request date.
	 * @return list of FibiCoiPersonHash objects.
	 */
	public PersonFeedResponse fetchFibiCoiSyncedPersonIds(String personId, Timestamp requestDate) {
		log.info("Method fetchFibiCoiSyncedPersonIds started. PersonId: {}, RequestDate: {}", personId, requestDate);
		PersonFeedResponse personFeedResponse = null;

		try {
			String procedureName = "FIBI_COI_SYNC_PERSON_DETAILS";
			StoredProcedureQuery storedProcedure = entityManager.createStoredProcedureQuery(procedureName);

			storedProcedure.registerStoredProcedureParameter(1, String.class, ParameterMode.IN);
			storedProcedure.registerStoredProcedureParameter(2, Timestamp.class, ParameterMode.IN);
			storedProcedure.registerStoredProcedureParameter(3, Class.class, ParameterMode.REF_CURSOR);

			storedProcedure.setParameter(1, personId);
			storedProcedure.setParameter(2, requestDate);
			boolean executeResult = storedProcedure.execute();
			log.info("executeResult : {}", executeResult);
			if (executeResult) {
				try (ResultSet resultSet = (ResultSet) storedProcedure.getOutputParameterValue(3)) {
					if (resultSet != null) {
						while (resultSet.next()) {
							String status = resultSet.getString("PERSON_SYNC_RESULT");
							if ("TRUE".equalsIgnoreCase(status)) {
//								List<FibiCoiPersonHash> hashes = findByUpdateDate(personId, requestDate);
								String updatedPersonIds = resultSet.getString("SYNCED_PERSON_IDS");
								List<String> personIds = new ArrayList<>();
								if (updatedPersonIds != null && !updatedPersonIds.isEmpty()) {
									personIds = Arrays.asList(updatedPersonIds.split(",\\s*"));
								}
								Integer noOfSyncedInserted = resultSet.getInt("NUM_OF_RECORDS_INSERTED");
								Integer noOfSyncedUpdated = resultSet.getInt("NUM_OF_SYNCED_UPDATED");
								personFeedResponse = PersonFeedResponse.builder()
										.noOfSyncedInserted(noOfSyncedInserted)
										.noOfSyncedUpdated(noOfSyncedUpdated)
										.personIds(personIds)
										.status("SUCCESS").build();
								log.info("Fetched {} person hashes for PersonId: {} and RequestDate: {}", personIds.size(), personId, requestDate);
								log.info("Stored procedure {} executed successfully with status: {}, no of synced inserted: {} and no of synced updated: {}", procedureName, status, noOfSyncedInserted, noOfSyncedUpdated);
								return personFeedResponse;
							} else {
								personFeedResponse = PersonFeedResponse.builder()
										.noOfSyncedInserted(0)
										.noOfSyncedUpdated(0)
										.status("FAIL").build();
							}
						}
					}
				} catch (SQLException e) {
	                log.error("Error processing ResultSet fro fetchFibiCoiSyncedPersonIds: {}", e.getMessage(), e);
	                throw new RuntimeException("Error processing ResultSet fro fetchFibiCoiSyncedPersonIds", e);
	            }
			}

			log.warn("Stored procedure returned FALSE or no data for PersonId: {} and RequestDate: {}", personId, requestDate);
			return personFeedResponse;

		} catch (PersistenceException e) {
			log.error("Database error while fetching persons. PersonId: {}, RequestDate: {}", personId, requestDate, e);
			throw new IntegrationCustomException("Database error during fetch operation", e);
		} catch (Exception e) {
			log.error("Error occurred while fetching person hashes. PersonId: {}, RequestDate: {}", personId, requestDate, e);
			throw new IntegrationCustomException("Unexpected error during fetch operation", e);
		} finally {
			log.info("Method fetchFibiCoiSyncedPersonIds completed. PersonId: {}, RequestDate: {}", personId, requestDate);
		}
	}

	/**
	 * Finds FIBI COI person hashes by update date or personId.
	 *
	 * @param personId    the ID of the person.
	 * @param requestDate the request date.
	 * @return list of FibiCoiPersonHash objects.
	 */
	@SuppressWarnings("unchecked")
	public List<Person> findByUpdateDate(String personId, Timestamp requestDate) {
		log.info("Method findByUpdateDate started. PersonId: {}, RequestDate: {}", personId, requestDate);

		if (requestDate == null) {
			requestDate = Timestamp.from(Instant.now());
			log.info("Defaulted RequestDate to current timestamp: {}", requestDate);
		}

		try {
			StringBuilder sql = new StringBuilder("SELECT * FROM FIBI_COI_PERSON_HASH p WHERE 1=1");

			if (personId != null && !personId.isEmpty()) {
				sql.append(" AND p.PERSON_ID = :personId");
			}
			if (requestDate != null) {
				sql.append(" AND TRUNC(p.UPDATE_TIMESTAMP) = TRUNC(:requestDate)");
			}

			log.debug("Executing SQL query: {}", sql);

			Query query = entityManager.createNativeQuery(sql.toString(), Person.class);

			if (personId != null && !personId.isEmpty()) {
				query.setParameter("personId", personId);
			}
			query.setParameter("requestDate", requestDate);

			List<Person> result = query.getResultList();
			log.info("Query execution successful. Records found: {}", result.size());
			return result;

		} catch (Exception e) {
			log.error("Error during findByUpdateDate for PersonId: {} and RequestDate: {}", personId, requestDate, e);
			throw new IntegrationCustomException("Error during findByUpdateDate", e);
		} finally {
			log.info("Method findByUpdateDate completed. PersonId: {}, RequestDate: {}", personId, requestDate);
		}
	}
}
