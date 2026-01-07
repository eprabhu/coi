package com.polus.fibicomp.reviewcomments.ctrl;

import java.util.Map;

import javax.persistence.EntityNotFoundException;
import javax.validation.Valid;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.fibicomp.reviewcomments.config.ServiceRouter;
import com.polus.fibicomp.reviewcomments.dto.ReviewCommentsDto;
import com.polus.fibicomp.reviewcomments.pojos.DisclComment;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/reviewComments")
public class ReviewCommentsCtrl {

    protected static Logger logger = LogManager.getLogger(ReviewCommentsCtrl.class.getName());

    @Autowired
    private ServiceRouter serviceRouter;

    @PostMapping
    public ResponseEntity<Object> saveOrUpdateReviewComment(@RequestParam(value = "files", required = false) MultipartFile[] files,
                                                            @RequestParam("formDataJson") String formDataJson) throws JsonProcessingException {
        logger.info("Requesting for saveOrUpdateReviewComment");
        ObjectMapper mapper = new ObjectMapper();
        DisclComment disclComment = mapper.readValue(formDataJson, DisclComment.class);
        return serviceRouter.getServiceBean(disclComment.getModuleCode()).saveOrUpdateReviewComment(files, disclComment);
    }

    @PostMapping("/fetch")
    public ResponseEntity<Object> fetchReviewComments(@RequestBody @Valid ReviewCommentsDto reviewCommentsDto) {
        logger.info("Requesting for fetchReviewComments");
        return serviceRouter.getServiceBean(reviewCommentsDto.getModuleCode()).fetchReviewComments(reviewCommentsDto);
    }

    @DeleteMapping(value = "/{reviewCommentId}/{moduleCode}")
    public ResponseEntity<Object> deleteReviewComment(@PathVariable(value = "reviewCommentId") final Integer reviewCommentId,
                                                      @PathVariable(value = "moduleCode") final Integer moduleCode) {
        logger.info("Requesting for deleteReviewAttachment");
        return serviceRouter.getServiceBean(moduleCode).deleteReviewComment(reviewCommentId, moduleCode);
    }

    @DeleteMapping(value = "/attachment/{attachmentId}/{moduleCode}")
    public ResponseEntity<Object> deleteReviewAttachment(@PathVariable(value = "attachmentId", required = true) final Integer attachmentId,
                                                         @PathVariable(value = "moduleCode") final Integer moduleCode) {
        logger.info("Requesting for deleteReviewAttachment");
        return serviceRouter.getServiceBean(moduleCode).deleteReviewAttachment(attachmentId);
    }

    @GetMapping(value = "/downloadAttachment/{moduleCode}")
    public ResponseEntity<byte[]> downloadReviewAttachment(@RequestHeader("attachmentId") Integer attachmentId,
                                                           @PathVariable(value = "moduleCode") final Integer moduleCode) {
        logger.info("Requesting for downloadReviewAttachment");
        logger.info("downloadReviewAttachmentId : {}", attachmentId);
        return serviceRouter.getServiceBean(moduleCode).downloadReviewAttachment(attachmentId);
    }

    @PostMapping(value = "/count")
   	public ResponseEntity<Map<String,Object>> getReviewCommentsCount(@RequestBody ReviewCommentsDto reviewCommentsDto) {
   		log.info("Requesting for getReviewCommentsCount");
   		log.info("moduleItemKey : {}", reviewCommentsDto.getModuleItemKey());
   		log.info("moduleCode : {}", reviewCommentsDto.getModuleCode());
   		log.info("replyCommentsCountRequired: {}",reviewCommentsDto.getReplyCommentsCountRequired());
   		return serviceRouter.getServiceBean(reviewCommentsDto.getModuleCode()).getReviewCommentsCount(reviewCommentsDto);
   	}

    @PostMapping("/resolve")
	public ResponseEntity<Object> resolveReviewComment(@RequestBody @Valid ReviewCommentsDto reviewCommentsDto) {
		try {
			log.info("Received request to resolve comment with ID: {} and module code {}", reviewCommentsDto.getCommentId(), reviewCommentsDto.getModuleCode());
			serviceRouter.getServiceBean(reviewCommentsDto.getModuleCode()).resolveDisclCommentById(reviewCommentsDto.getCommentId());
			log.info("Successfully resolved comment with ID: {}", reviewCommentsDto.getCommentId());
			return ResponseEntity.ok("Comment resolved successfully.");
		} catch (EntityNotFoundException e) {
			log.error("Comment not found with ID: {}", reviewCommentsDto.getCommentId(), e);
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Comment not found.");
		} catch (Exception e) {
			log.error("Error resolving comment with ID: {}", reviewCommentsDto.getCommentId(), e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error resolving comment.");
		}
	}

}
