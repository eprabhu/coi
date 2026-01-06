package com.polus.integration.entity.criteriasearch.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.integration.entity.cleansematch.dto.DnBStageEntityMatchDTO;
//import com.polus.integration.entity.cleansematch.dto.BulkCleanseMatchAPIResponse;
//import com.polus.integration.entity.cleansematch.dto.DnBCleanseMatchAPIResponse;
//import com.polus.integration.entity.cleansematch.dto.DnBEntityCleanseMatchRequestDTO;
//import com.polus.integration.entity.cleansematch.dto.DnBStageEntityMatchDTO;
//import com.polus.integration.entity.cleansematch.dto.DnBCleanseMatchAPIResponse.ErrorDetail;
import com.polus.integration.entity.cleansematch.entity.DnBEntityMatchRepository;
import com.polus.integration.entity.cleansematch.entity.StageDnBEntityMatch;
import com.polus.integration.entity.config.Constants;
import com.polus.integration.entity.config.ErrorCode;
import com.polus.integration.entity.criteriasearch.dto.BulkCriteriaSearchAPIResponse;
import com.polus.integration.entity.criteriasearch.dto.DnBCriteriaSearchAPIResponse;
import com.polus.integration.entity.criteriasearch.dto.DnBCriteriaSearchAPIResponse.ErrorDetail;
import com.polus.integration.entity.criteriasearch.dto.DnBEntityCriteriaSearchRequestDTO;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class BulkCriteriaSearchService {

	@Autowired
	private DnBEntityMatchRepository dnbEntityMatchRepository;

	@Autowired
	private CriteriaSearchUrlBuilder urlBuilder;

	@Autowired
	private DnBCriteriaSearchAPIService apiService;

	private volatile AtomicBoolean stopMatchFlag = new AtomicBoolean(false);

	private static final ObjectMapper objectMapper = new ObjectMapper();

	@Async
	public CompletableFuture<Void> startBulkSearch() {
		return null;
	}

	public void stopBulkSearch() {
		stopMatchFlag.set(true);
	}

	private String buildApiUrl() {
		return urlBuilder.buildApiUrl();
	}


}
