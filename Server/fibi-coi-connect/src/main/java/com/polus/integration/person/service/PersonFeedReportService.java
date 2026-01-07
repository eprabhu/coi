package com.polus.integration.person.service;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.polus.integration.dao.IntegrationDao;
import com.polus.integration.feedentity.dto.MessageQVO;
import com.polus.integration.messageq.service.RMQMessagingQueueService;
import com.polus.integration.messageq.vo.MessagingQueueProperties;
import com.polus.integration.person.dao.PersonFeedSyncDao;
import com.polus.integration.person.pojo.PersonFeedReport;
import com.polus.integration.person.repo.FibiCoiPersonRepository;
import com.polus.integration.person.vo.PersonFeedRequest;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class PersonFeedReportService {

	private final IntegrationDao integrationDao;
	private final PersonFeedSyncDao personFeedSyncDao;
	private final RMQMessagingQueueService rmqMessagingQueueService;
	private final MessagingQueueProperties messagingQueueProperties;
	private final FibiCoiPersonRepository personRepository;

	public PersonFeedReportService(IntegrationDao integrationDao, PersonFeedSyncDao personFeedSyncDao,
			RMQMessagingQueueService rmqMessagingQueueService, MessagingQueueProperties messagingQueueProperties,
			FibiCoiPersonRepository personRepository) {
		super();
		this.integrationDao = integrationDao;
		this.personFeedSyncDao = personFeedSyncDao;
		this.rmqMessagingQueueService = rmqMessagingQueueService;
		this.messagingQueueProperties = messagingQueueProperties;
		this.personRepository = personRepository;
	}

	public PersonFeedReport initializeReport(PersonFeedRequest request) {
		PersonFeedReport feedReport = new PersonFeedReport();
		Timestamp startTime = integrationDao.getCurrentTimestamp();
		feedReport.setStartTimestamp(startTime);
		feedReport.setFeedStatus("Started");
		feedReport.setUpdatedBy("System");
		feedReport.setUpdateTimestamp(startTime);
		if (request != null) {
			feedReport.setPersonId(request.getPersonId());
			feedReport.setRequestDate(request.getRequestDate());
		}
		log.info("Starting person feed sync at {}", startTime);
		personFeedSyncDao.savePersonFeedHistory(feedReport);
		return feedReport;
	}

	public void finalizeReport(PersonFeedReport report) {
		Timestamp endTime = integrationDao.getCurrentTimestamp();
		report.setEndTimestamp(endTime);
		report.setDuration(endTime.getTime() - report.getStartTimestamp().getTime());
		report.setUpdatedBy("System");
		report.setUpdateTimestamp(endTime);

		sendReport(report);
		log.info("Sync process completed. Duration: {} ms", report.getDuration());
	}

	public void sendReport(PersonFeedReport report) {
		try {
			personFeedSyncDao.savePersonFeedHistory(report);
			sendEmailWithReport(report);
			log.info("Report saved and emailed successfully.");
		} catch (Exception ex) {
			log.error("Error sending report: {}", ex.getMessage(), ex);
		}
	}

	public void sendEmailWithReport(PersonFeedReport report) {
		try {
			MessageQVO messageVO = prepareMessage(report);
			rmqMessagingQueueService.publishMessageToQueue(messageVO);
			log.info("Email sent for person feed report.");
		} catch (Exception ex) {
			log.error("Error sending email for person feed report: {}", ex.getMessage(), ex);
		}
	}

	private MessageQVO prepareMessage(PersonFeedReport report) {
		MessageQVO messageVO = new MessageQVO();
		messageVO.setOrginalModuleItemKey(0);
		messageVO.setTriggerType("NOTIFY_PERSON_FEED_SYNC_REPORT");
		messageVO.setModuleCode(8);
		messageVO.setSubModuleCode(0);
		messageVO.setEventType("T");
		messageVO.setAdditionalDetails(preparePlaceholders(report));
		messageVO.setPublishedUserName("System");
		messageVO.setPublishedTimestamp(integrationDao.getCurrentTimestamp());
		messageVO.setSourceExchange(messagingQueueProperties.getQueues().get("exchange"));
		messageVO.setSourceQueueName(messagingQueueProperties.getQueues().get("coi"));
		return messageVO;
	}

	private Map<String, String> preparePlaceholders(PersonFeedReport report) {
		Map<String, String> placeHolders = new HashMap<>();

		placeHolders.put("notificationTypeId", "8042");
		placeHolders.put("SYNC_START_DATE_AND_TIME", report.getStartTimestamp() != null ? report.getStartTimestamp().toString() : "");
		placeHolders.put("SYNC_END_DATE_AND_TIME", report.getEndTimestamp() != null ? report.getEndTimestamp().toString() : "");

		// Calculate duration in minutes and seconds
		long duration = report.getDuration();
		String totalDuration = (duration / 60000) + " Minutes and " + ((duration / 1000) % 60) + " Seconds";
		placeHolders.put("TOTAL_DURATION", totalDuration);

		// User count details
		placeHolders.put("TOTAL_NO_OF_PERSONS", report.getTotalUserCount() != null ? report.getTotalUserCount().toString() : "0");
		placeHolders.put("TOTAL_NO_OF_NEW_PERSONS", report.getNewUserCount() != null ? report.getNewUserCount().toString() : "0");
		placeHolders.put("TOTAL_NO_OF_UPDATED_PERSONS", report.getUpdatedUserCount() != null ? report.getUpdatedUserCount().toString() : "0");

		// Feed sync status
		placeHolders.put("PERSON_FEED_SYNC_STATUS", report.getFeedStatus() != null ? report.getFeedStatus() : "UNKNOWN");

		// Fetch validation errors
		List<String> exceptionDetails = personRepository.findValidationMessagesByValidationStatus("ERROR");
		int totalFailedRecords = exceptionDetails != null ? exceptionDetails.size() : 0;

		StringBuilder exceptionMessage = new StringBuilder();
		if (totalFailedRecords > 0) {
			exceptionMessage.append("<br>Person records failed on sync are listed below:<br><ul>");
			for (String error : exceptionDetails) {
				exceptionMessage.append("<li>").append(error).append("</li>");
			}
			exceptionMessage.append("</ul>");
		} else {
			exceptionMessage.append("All person records were synced successfully.");
		}

		placeHolders.put("EXCEPTION_DETAILS", exceptionMessage.toString());

		return placeHolders;
	}

	public String personFeedReportTest(Integer feedId) {
		sendEmailWithReport(personFeedSyncDao.getPersonFeedReportById(feedId));
		return "✅ Person feed report sent successfully.";
	}
}
