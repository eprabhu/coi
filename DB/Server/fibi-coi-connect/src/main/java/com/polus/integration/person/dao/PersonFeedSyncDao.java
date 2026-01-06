package com.polus.integration.person.dao;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.integration.person.pojo.FibiCoiPerson;
import com.polus.integration.person.pojo.PersonFeedReport;
import com.polus.integration.person.repo.FibiCoiPersonRepository;
import com.polus.integration.person.repo.PersonFeedReportRepository;
import com.polus.integration.pojo.Person;

import jakarta.persistence.EntityManager;
import lombok.extern.slf4j.Slf4j;

@Transactional
@Service
@Slf4j
public class PersonFeedSyncDao {

	private final FibiCoiPersonRepository personRepository;

	private final PersonFeedReportRepository personFeedReportRepository;

	private final EntityManager entityManager;

	private final JdbcTemplate jdbcTemplate;

	public PersonFeedSyncDao(FibiCoiPersonRepository personRepository,
			PersonFeedReportRepository personFeedReportRepository, EntityManager entityManager,
			JdbcTemplate jdbcTemplate) {
		super();
		this.personRepository = personRepository;
		this.personFeedReportRepository = personFeedReportRepository;
		this.entityManager = entityManager;
		this.jdbcTemplate = jdbcTemplate;
	}

	public void saveOrUpdatePersons(List<FibiCoiPerson> persons) {
		if (persons.isEmpty()) {
			log.info("No persons to save or update.");
			return;
		}
		try {
			personRepository.saveAll(persons);
			personRepository.flush();
			log.info("Saved or updated {} persons.", persons.size());
		} catch (Exception ex) {
			log.error("Error saving or updating persons.", ex);
		}
	}

	public void saveOrUpdatePersons1(List<Person> persons) {
		if (persons.isEmpty()) {
			log.info("No persons to save or update.");
			return;
		}
		try {
			for (Person person : persons) {
				entityManager.merge(person);
			}
			entityManager.flush();
			log.info("Saved or updated {} persons.", persons.size());
		} catch (Exception ex) {
			log.error("Error saving or updating persons.", ex);
			throw new RuntimeException("Error saving or updating persons", ex);
		}
	}

	public void savePersonFeedHistory(PersonFeedReport personFeedReport) {
		personFeedReportRepository.save(personFeedReport);
	}

	public Map<String, Object> validateAndUpdatePersonFeedData(Integer personFeedId) throws Exception {
		try {
			log.info("Starting validation and update process for personFeedId: {}", personFeedId);

			return jdbcTemplate.execute((Connection conn) -> {
				Map<String, Object> validationReport = new HashMap<>();
				try (CallableStatement cs = conn.prepareCall("{call COI_INT_VALDTE_PERSN_DETILS(?)}")) {
					if (personFeedId != null) {
						cs.setInt(1, personFeedId);
					} else {
						cs.setNull(1, java.sql.Types.INTEGER);
					}

					try (ResultSet rset = cs.executeQuery()) {
						if (rset.next()) {
							String validationMessage = rset.getString("VALIDATION_MESSAGE");
							String invalidPersonIds = rset.getString("INVALID_PERSON_IDS");
							Integer noOfNewRecords = rset.getInt("NO_OF_NEW_RECORDS");
							Integer noOfUpdateRecords = rset.getInt("NO_OF_UPDATE_RECORDS");

							log.info("Stored procedure executed successfully.");
							log.info("Validation Message: {}", validationMessage);
							log.info("Invalid Person IDs: {}", invalidPersonIds);
							log.info("New Records: {}", noOfNewRecords);
							log.info("Updated Records: {}", noOfUpdateRecords);

							validationReport.put("VALIDATION_MESSAGE", validationMessage);
							validationReport.put("INVALID_PERSON_IDS", invalidPersonIds);
							validationReport.put("NO_OF_NEW_RECORDS", noOfNewRecords);
							validationReport.put("NO_OF_UPDATE_RECORDS", noOfUpdateRecords);
						} else {
							log.warn("Stored procedure did not return any results for personFeedId: {}", personFeedId);
						}
					}
				}
				return validationReport;
			});
		} catch (DataAccessException e) {
			log.error("Database access error while executing stored procedure COI_INT_VALDTE_PERSN_DETILS for personFeedId: {}. Error: {}", personFeedId, e.getMessage(), e);
			throw new Exception("Database error occurred: " + e.getMessage(), e);
		} catch (Exception e) {
			log.error("Unexpected error occurred during validation for personFeedId: {}. Error: {}", personFeedId, e.getMessage(), e);
			throw new Exception("Unexpected error: " + e.getMessage(), e);
		}
	}

	public void truncateFibiCoiPerson() {
		personRepository.truncateFibiCoiPerson();
	}

	@Transactional
	public void feedFibiCoiPersonsByParams(List<FibiCoiPerson> fibiCoiPersons) {
		personRepository.saveAll(fibiCoiPersons);
	}

	public PersonFeedReport getPersonFeedReportById(Integer feedId) {
		Optional<PersonFeedReport> feedReport = personFeedReportRepository.findById(feedId);
		return feedReport.isPresent() ? feedReport.get() : null;
	}

}
