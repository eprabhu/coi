package com.polus.integration.feedentity.client;

import java.util.List;

import com.polus.integration.coideclarations.dtos.CoiDeclarationDto;
import com.polus.integration.opaPersonFeed.dto.OpaPersonFeedRequest;
import com.polus.integration.opaPersonFeed.dto.OpaPersonFeedResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.polus.integration.award.dto.ProjectSyncRequest;
import com.polus.integration.feedentity.config.FeignClientConfig;
import com.polus.integration.feedentity.dto.EntityDTO;
import com.polus.integration.feedentity.dto.EntityResponse;
import com.polus.integration.person.pojo.FibiCoiPerson;
import com.polus.integration.person.vo.PersonFeedRequest;
import com.polus.integration.person.vo.PersonFeedResponse;
import com.polus.integration.pojo.Person;

@FeignClient(name = "KC-CONNECT", url = "${kc.integration.client.url}", configuration = FeignClientConfig.class)
public interface KCFeignClient {

	@PostMapping("/entity/feedEntityDetails")
	public EntityResponse feedEntityDetails(EntityDTO entityDTOs);

	@GetMapping("/api/personFeed/getAllPersons")
	ResponseEntity<List<Person>> getAllPersons();

	@PostMapping("/api/personFeed/getPersonsByPersonIds")
	ResponseEntity<PersonFeedResponse> getPersonsByPersonIds(PersonFeedRequest feedRequest);

	@PostMapping("/api/personFeed/feedPersonDetails")
	ResponseEntity<PersonFeedResponse> feedPersonDetails(PersonFeedRequest feedRequest);

	@PostMapping("/api/personFeed/updateFeedStatusByPersonIds")
	ResponseEntity<PersonFeedResponse> updateFeedStatusByPersonIds(PersonFeedRequest feedRequest);

	@GetMapping("/api/personFeed/feedFibiCoiPersonsByParams")
	ResponseEntity<List<FibiCoiPerson>> feedFibiCoiPersonsByParams(@RequestParam int page, @RequestParam int size);

	@PostMapping("/opaPersonFeed/fetch")
	ResponseEntity<OpaPersonFeedResponse> fetchOpaPersonFeedDetails(@RequestBody OpaPersonFeedRequest feedRequest);

	@PostMapping("/coi/persons/projects/sync")
	void syncPersonProjects(ProjectSyncRequest syncRequest);

	@PostMapping("/coiDeclaration/integration/sync")
	void syncCoiDeclaration(@RequestBody CoiDeclarationDto coiDeclaration);
}
