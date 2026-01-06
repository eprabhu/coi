package com.polus.integration.opaPersonFeed.services;

import com.polus.integration.feedentity.client.KCFeignClient;
import com.polus.integration.opaPersonFeed.constants.OpaPersonFeedStatus;
import com.polus.integration.opaPersonFeed.dao.OpaPersonFeedDao;
import com.polus.integration.opaPersonFeed.dto.OpaPersonFeedRequest;
import com.polus.integration.opaPersonFeed.dto.OpaPersonFeedResponse;
import com.polus.integration.opaPersonFeed.pojo.OPAPerson;
import com.polus.integration.opaPersonFeed.pojo.OpaPersonFeedLog;
import com.polus.integration.opaPersonFeed.pojo.OpaPersonFeedLogDetails;
import com.polus.integration.opaPersonFeed.repository.OPAPersonRepository;
import com.polus.integration.opaPersonFeed.repository.OpaPersonFeedLogDetailsRepository;
import com.polus.integration.opaPersonFeed.repository.OpaPersonFeedLogRepository;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.BeanUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Service
@Log4j2
@AllArgsConstructor
public class OpaPersonFeedService {

    private final KCFeignClient kcFeignClient;
    private final OpaPersonFeedDao opaPersonFeedDao;
    private final OPAPersonRepository opaPersonRepository;
    private final OpaPersonFeedLogRepository opaPersonFeedLogRepository;
    private final OpaPersonFeedLogDetailsRepository opaPersonFeedLogDetailsRepository;

    private final Integer BATCH_LIMIT = 1000;

    public void startFeedOpaPersons() {
        boolean morePages = true;
        int pageNumber = 1;
        OpaPersonFeedLog feedDetails = opaPersonFeedDao.getLastUpdatedOpaPersonFeedLog();
        OpaPersonFeedRequest feedRequest = OpaPersonFeedRequest.builder()
                .lastUpdatedTimestamp(feedDetails != null ? feedDetails.getFeedStartedAt() : null)
                .limit(BATCH_LIMIT).build();
        OpaPersonFeedLog opaPersonFeedLog = OpaPersonFeedLog.builder()
                .feedStartedAt(new Timestamp(System.currentTimeMillis()))
                .feedStatus(OpaPersonFeedStatus.PENDING.toString())
                .build();
        processPreviouslyFailedPersonFeeds(feedRequest, opaPersonFeedLog);
        List<OpaPersonFeedLogDetails> opaPersonFeedLogDetails = new ArrayList<>();
        try {
            opaPersonFeedLogRepository.save(opaPersonFeedLog);
            while (morePages) {
                feedRequest.setPageNumber(pageNumber);
                ResponseEntity<OpaPersonFeedResponse> response = fetchOpaPersonFeedDetailsWithRetry(feedRequest);

                if (response.getStatusCode().is2xxSuccessful()) {
                    OpaPersonFeedResponse feedResponse = response.getBody();
                    if (feedResponse != null && feedResponse.getTotalCount() != null) {
                        int totalCount = feedResponse.getTotalCount();
                        feedRequest.setTotalCount(totalCount);
                        int totalRecordsFetchedSoFar = BATCH_LIMIT * pageNumber;

                        log.info("Fetched page {}, totalCount: {}, fetched: {}", pageNumber, totalCount, totalRecordsFetchedSoFar);
                        if (totalCount > totalRecordsFetchedSoFar) {
                            pageNumber++;
                        } else {
                            morePages = false;
                        }
                        processFeedData(feedResponse, opaPersonFeedLog.getOpaPersonFeedLogId(), opaPersonFeedLogDetails);
                    } else {
                        log.warn("Empty or malformed response body, stopping fetch.");
                        morePages = false;
                    }
                } else {
                    log.error("Failed to fetch page {}, status: {}", pageNumber, response.getStatusCode());
                    morePages = false;
                }
            }
        } catch (Exception e) {
            log.error("Exception on startFeedOpaPersons(OPA Feed Person) | {}", e.getLocalizedMessage());
            opaPersonFeedLog.setErrorMessage(e.getLocalizedMessage());
        } finally {
            if (!opaPersonFeedLogDetails.isEmpty() && feedRequest.getTotalCount() != null && !feedRequest.getTotalCount().equals(opaPersonFeedLogDetails.size())) {
                opaPersonFeedLog.setFeedStatus(OpaPersonFeedStatus.PARTIAL_SUCCESS.toString());
            } else if (opaPersonFeedLog.getErrorMessage() != null){
                opaPersonFeedLog.setFeedStatus(OpaPersonFeedStatus.FAILED.toString());
            } else if (feedRequest.getTotalCount() == null || feedRequest.getTotalCount() == 0){
                opaPersonFeedLog.setFeedStatus(OpaPersonFeedStatus.NO_DATA_PROCESS.toString());
            } else {
                opaPersonFeedLog.setFeedStatus(OpaPersonFeedStatus.SUCCESS.toString());
            }
            opaPersonFeedLog.setFeedCompletedAt(new Timestamp(System.currentTimeMillis()));
            opaPersonFeedLogRepository.save(opaPersonFeedLog);
            if (!opaPersonFeedLogDetails.isEmpty()) {
                opaPersonFeedLogDetailsRepository.saveAll(opaPersonFeedLogDetails);
            }
        }
    }

    private void processPreviouslyFailedPersonFeeds(OpaPersonFeedRequest feedRequest, OpaPersonFeedLog opaPersonFeedLog) {
        List<String> failedPersonIds = opaPersonFeedLogDetailsRepository.findAllPersonId();
        if (failedPersonIds != null) {
            feedRequest.setPersonIds(failedPersonIds);
            ResponseEntity<OpaPersonFeedResponse> response = fetchOpaPersonFeedDetailsWithRetry(feedRequest);
            if (response.getStatusCode().is2xxSuccessful()) {
                processFeedData(response.getBody(), opaPersonFeedLog.getOpaPersonFeedLogId(), null);
            }
        }
    }

    // Retrying | 3 attempts with delay of 2 sec * 2  each
    @Retryable(
            value = { Exception.class },
            maxAttempts = 3,
            backoff = @Backoff(delay = 2000, multiplier = 2)
    )
    ResponseEntity<OpaPersonFeedResponse> fetchOpaPersonFeedDetailsWithRetry(OpaPersonFeedRequest feedRequest) {
        return kcFeignClient.fetchOpaPersonFeedDetails(feedRequest);
    }

    private void processFeedData(OpaPersonFeedResponse feedResponse, Integer opaPersonFeedLogId, List<OpaPersonFeedLogDetails> personFeedLogDetails) {
        feedResponse.getData().forEach(opaPerson ->  {
            try {
                saveOrUpdateOpaPerson(opaPerson);
                opaPersonFeedDao.checkAndUpdateOpaPersonEligibility(opaPerson.getPersonId());
            } catch (Exception e) {
                log.error("Exception on processFeedData(OPA Feed Person) | {}", e.getLocalizedMessage());
                if (personFeedLogDetails != null) {
                    personFeedLogDetails.add(OpaPersonFeedLogDetails.builder().personId(opaPerson.getPersonId())
                            .opaPersonFeedLogId(opaPersonFeedLogId)
                            .createTimestamp(new Timestamp(System.currentTimeMillis())).build());
                }
            }
        });
    }

    public void saveOrUpdateOpaPerson(OPAPerson newOpaPerson) {
        Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
        OPAPerson opaPerson = opaPersonRepository.findByPersonId(newOpaPerson.getPersonId());
        if (opaPerson != null) {
            BeanUtils.copyProperties(newOpaPerson, opaPerson, "opaPersonId");
            opaPerson.setUpdateTimestamp(currentTimestamp);
            opaPersonRepository.save(opaPerson);
        } else {
            newOpaPerson.setCreateTimestamp(currentTimestamp);
            newOpaPerson.setUpdateTimestamp(currentTimestamp);
            opaPersonRepository.save(newOpaPerson);
        }
    }


}
