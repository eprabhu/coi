package com.polus.fibicomp.opa.service;

import java.util.Date;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.polus.fibicomp.opa.pojo.OPAReview;

@Service
public interface OPAReviewService {

    /**
     * This method is used to save or update opa review
     * @param opaReview
     * @return
     */
    ResponseEntity<Object> saveOrUpdateOPAReview(OPAReview opaReview);

    /**
     * This method fetches all OPA Review by OPA disclosure id
     * @param opaDisclosureId
     * @return
     */
    ResponseEntity<Object> getOPAReview(Integer opaDisclosureId);

    /**
     * This method Starts a OPA review
     * @param opaReviewId
     * @param opaDisclsoureId 
     * @param description 
     * @return
     */
    ResponseEntity<Object> startOPAReview(Integer opaReviewId, Integer opaDisclsoureId, String description);

    /**
     * This method completes a OPA Review
     * @param opaReviewId
     * @param endDate
     * @param opaDisclosureId 
     * @param description 
     * @return
     */
    ResponseEntity<Object> completeOPAReview(Integer opaReviewId, Date endDate, Integer opaDisclosureId, String description);

    /**
     * This method fetches all review action log
     * @param opaDisclosureId
     * @return
     */
    ResponseEntity<Object> getAllReviewActionLogs(Integer opaDisclosureId);
    /**
     * This method deletes a OPA review
     * @param opaReviewId
     * @return
     */
    ResponseEntity<Object> deleteOPAReview(Integer opaReviewId);

}
