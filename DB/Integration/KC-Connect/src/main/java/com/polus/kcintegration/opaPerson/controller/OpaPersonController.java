package com.polus.kcintegration.opaPerson.controller;

import com.polus.kcintegration.opaPerson.dto.OpaPersonFeedRequest;
import com.polus.kcintegration.opaPerson.dto.OpaPersonFeedResponse;
import com.polus.kcintegration.opaPerson.service.OpaPersonService;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/opaPersonFeed")
@AllArgsConstructor
@Log4j2
public class OpaPersonController {

    private final OpaPersonService opaPersonService;

    @PostMapping("/fetch")
    ResponseEntity<OpaPersonFeedResponse> fetchOpaPersonFeedDetails(@RequestBody OpaPersonFeedRequest feedRequest) {
        log.info("Request for OPA Person Feed | limit : {} | page number {}", feedRequest.getLimit(), feedRequest.getPageNumber());
        return opaPersonService.fetchOpaPersonFeedDetails(feedRequest);
    }
}
