package com.polus.fibicomp.cmp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.polus.fibicomp.cmp.dto.CoiCmpReviewDto;
import com.polus.fibicomp.cmp.pojo.CoiCmpReview;
import com.polus.fibicomp.cmp.service.CoiCmpReviewService;
import com.polus.fibicomp.coi.service.ActionLogService;

@RestController
@RequestMapping("/cmp/review")
public class CoiCmpReviewController {

	@Autowired
	private CoiCmpReviewService reviewService;

	@Autowired
	private ActionLogService actionLogService;

	@PostMapping
	public ResponseEntity<Object> saveOrUpdateReview(@RequestBody CoiCmpReviewDto dto) {
		return reviewService.saveOrUpdateReview(dto);
	}

	@GetMapping("/{cmpId}")
	public ResponseEntity<List<CoiCmpReview>> getReviews(@PathVariable Integer cmpId) {
		return reviewService.getReviews(cmpId);
	}

	@PatchMapping("/start/{reviewId}")
	public ResponseEntity<Object> startReview(@PathVariable Integer reviewId, @RequestBody CoiCmpReviewDto dto) {
		return reviewService.startReview(reviewId, dto.getStartDate(), dto.getDescription());
	}

	@PatchMapping("/complete/{reviewId}")
	public ResponseEntity<Object> completeReview(@PathVariable Integer reviewId, @RequestBody CoiCmpReviewDto dto) {
		return reviewService.completeReview(reviewId, dto.getStartDate(), dto.getEndDate(), dto.getDescription());
	}

	@DeleteMapping("/{reviewId}")
	public ResponseEntity<Object> deleteReview(@PathVariable Integer reviewId) {
		return reviewService.deleteReview(reviewId);
	}

	@GetMapping("/history/{cmpId}")
	public ResponseEntity<Object> getCmpReviewHistory(@PathVariable Integer cmpId) {
		return actionLogService.getCmpReviewHistoryById(cmpId);
	}

}
