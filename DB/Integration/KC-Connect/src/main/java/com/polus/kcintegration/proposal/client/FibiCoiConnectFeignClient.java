package com.polus.kcintegration.proposal.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.MediaType;

import com.polus.kcintegration.proposal.config.FeignClientConfig;
import com.polus.kcintegration.proposal.dto.DisclosureResponse;
import com.polus.kcintegration.proposal.vo.ProposalIntegrationVO;

@FeignClient(name = "FIBI-COI-CONNECT", url = "${fibiIntegrationClient.url}", configuration = FeignClientConfig.class)
public interface FibiCoiConnectFeignClient {

	@PostMapping(value = "/createProposalDisclosure", consumes = MediaType.APPLICATION_JSON_VALUE)
	DisclosureResponse createProposalDisclosure(@RequestBody ProposalIntegrationVO proposalIntegrationVO);

}
