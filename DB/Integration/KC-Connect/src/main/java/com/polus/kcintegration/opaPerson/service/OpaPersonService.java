package com.polus.kcintegration.opaPerson.service;

import com.polus.kcintegration.opaPerson.dao.OpaPersonDao;
import com.polus.kcintegration.opaPerson.dto.OpaPersonFeedRequest;
import com.polus.kcintegration.opaPerson.dto.OpaPersonFeedResponse;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
@Log4j2
@Transactional
public class OpaPersonService {

    private final OpaPersonDao opaPersonDao;

    public ResponseEntity<OpaPersonFeedResponse> fetchOpaPersonFeedDetails(OpaPersonFeedRequest feedRequest) {
        if ((feedRequest.getTotalCount() == null || feedRequest.getTotalCount() == 0) && (feedRequest.getPersonIds() == null || feedRequest.getPersonIds().isEmpty())) {
            opaPersonDao.syncOpaPersonFeedData();
        }
        OpaPersonFeedResponse personFeedResponse = opaPersonDao.fetchOpaPersonFeedDetails(feedRequest);
        return new ResponseEntity<>(personFeedResponse, HttpStatus.OK);
    }
}
