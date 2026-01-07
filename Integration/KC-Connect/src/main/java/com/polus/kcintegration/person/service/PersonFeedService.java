package com.polus.kcintegration.person.service;

import java.sql.Timestamp;
import java.util.Collections;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.kcintegration.exception.custom.IntegrationCustomException;
import com.polus.kcintegration.person.dao.PersonFeedDao;
import com.polus.kcintegration.person.pojo.FibiCoiPerson;
import com.polus.kcintegration.person.repo.FibiCoiPersonRepository;
import com.polus.kcintegration.person.vo.PersonFeedResponse;

import lombok.extern.slf4j.Slf4j;

@Transactional
@Service
@Slf4j
public class PersonFeedService {

	private final PersonFeedDao fibiCoiPersonFeedDao;

	private final RetryTemplate retryTemplate;

	private final FibiCoiPersonRepository fibiCoiPersonRepository;

	public PersonFeedService(PersonFeedDao fibiCoiPersonFeedDao, RetryTemplate retryTemplate,
			FibiCoiPersonRepository fibiCoiPersonRepository) {
		super();
		this.fibiCoiPersonFeedDao = fibiCoiPersonFeedDao;
		this.retryTemplate = retryTemplate;
		this.fibiCoiPersonRepository = fibiCoiPersonRepository;
	}

	/**
	 * Feeds FIBI COI person details.
	 *
	 * @param personId    the ID of the person.
	 * @param requestDate the request date.
	 * @return list of FibiCoiPersonHash objects.
	 */
	public PersonFeedResponse feedFibiCoiPersons(String personId, Timestamp requestDate) {
		log.info("Starting to feed person details for personId: {} and requestDate: {}", personId, requestDate);
		long startTime = System.currentTimeMillis();

		try {
			return retryTemplate.execute(context -> {
				log.info("Attempt {} to feed person details", context.getRetryCount() + 1);
				return fibiCoiPersonFeedDao.fetchFibiCoiSyncedPersonIds(personId, requestDate);
			});
		} catch (IntegrationCustomException e) {
			log.error("Failed to feed person details for personId: {} and requestDate: {}", personId, requestDate, e);
			throw e; // Propagate the custom exception for further handling.
		} catch (Exception e) {
			log.error("Unexpected error during feed process for personId: {} and requestDate: {}", personId, requestDate, e);
			throw new IntegrationCustomException("Unexpected error during feed process", e);
		} finally {
			long duration = System.currentTimeMillis() - startTime;
			log.info("Feed process completed for personId: {} and requestDate: {}. Duration: {} ms", personId, requestDate, duration);
		}
	}

	public List<FibiCoiPerson> feedFibiCoiPersonsByParams(int page, int size) {
		log.info("🔹 Fetching FibiCoiPersons | Page: {} | Size: {}", page, size);

		if (page < 0 || size <= 0) {
			log.warn("⚠️ Invalid pagination parameters: Page={} | Size={}", page, size);
			return Collections.emptyList();
		}

		try {
			Pageable pageable = PageRequest.of(page, size);
			List<FibiCoiPerson> persons = fibiCoiPersonRepository.feedFibiCoiPersonsByParams(pageable).getContent();

			if (persons.isEmpty()) {
				log.info("🚀 No records found for Page={} | Size={}", page, size);
			} else {
				log.info("✅ Fetched {} records for Page={} | Size={}", persons.size(), page, size);
			}

			return persons;
		} catch (Exception e) {
			log.error("❌ Error fetching FibiCoiPersons: {}", e.getMessage(), e);
			return Collections.emptyList();
		}
	}

}
