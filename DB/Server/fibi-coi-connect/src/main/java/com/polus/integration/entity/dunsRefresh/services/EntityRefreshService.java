package com.polus.integration.entity.dunsRefresh.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.integration.entity.apitokenservice.TokenService;
import com.polus.integration.entity.base.dto.DnBOrganizationDetails;
import com.polus.integration.entity.config.APIConfig;
import com.polus.integration.entity.config.ErrorCode;
import com.polus.integration.entity.dunsRefresh.dao.DunsRefreshDao;
import com.polus.integration.entity.dunsRefresh.pojos.ParameterBo;
import com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse;
import jakarta.transaction.Transactional;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

@Service
@Transactional
@Log4j2
public class EntityRefreshService {

    @Autowired
    private DunsRefreshDao dunsRefreshDao;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private WebClient.Builder webClientBuilder;

    @Autowired
    private APIConfig apiConfig;


    public void updateEntityDetails(DnBOrganizationDetails orgDetails, Integer entityId) throws JsonProcessingException {
        String actionPersonId = "system";
        dunsRefreshDao.refreshEntityHeaderInfo(entityId, actionPersonId, orgDetails);
        dunsRefreshDao.refreshEntityIndustryCode(entityId, actionPersonId, orgDetails.getIndustryCodes());
        dunsRefreshDao.refreshEntityRegistration(entityId, actionPersonId, orgDetails.getRegistrationNumbers());
        dunsRefreshDao.refreshEntityTelephone(entityId, actionPersonId, orgDetails.getTelephone());
        dunsRefreshDao.refreshForeignName(entityId, actionPersonId, orgDetails.getMultilingualPrimaryName());
        dunsRefreshDao.refreshEntityMailingAddress(entityId, actionPersonId, orgDetails.getMailingAddress());
    }

    public boolean getParameterAsBoolean(String parameterName) {
        ParameterBo parameter = dunsRefreshDao.getParameterBO(parameterName);
        return parameter != null && parameter.getValue().equalsIgnoreCase("Y") ? true : false;
    }

    public void registerDunsMonitoring(String dunsNumber) {
        callAPI(apiConfig.getDunsMonRegistration() + "/" + dunsNumber);
    }

    public void callAPI(String apiUrl) {
        String token = tokenService.getToken();
        callExternalAPI(apiUrl, token);
    }


    private void callExternalAPI(String apiUrl, String token) {
                webClientBuilder.build()
                        .post()
                        .uri(apiUrl)
                        .header("Authorization", token)
                        .retrieve()
                        .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                                clientResponse -> clientResponse.bodyToMono(String.class)
                                        .flatMap(errorBody -> {
                                            return Mono.error(new RuntimeException("HTTP Error: " + clientResponse.statusCode() +
                                                    " - " + errorBody));
                                        }))
                        .bodyToMono(Void.class)  // or another return type if needed
                        .block();

    }
}
