package com.polus.integration.feedentity.service;

import java.util.List;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import com.polus.integration.constant.Constant;
import com.polus.integration.feedentity.client.KCFeignClient;
import com.polus.integration.feedentity.dao.EntityIntegrationDao;
import com.polus.integration.feedentity.dto.EntityDTO;
import com.polus.integration.feedentity.dto.EntityResponse;

import feign.FeignException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class EntityOutboundIntegrationService {

	@Autowired
	private EntityIntegrationDao entityIntegrationDao;

	@Autowired
	private KCFeignClient kcFeignClient;

	@Value("${kc.integration.user.name}")
	private String userName;

	public void getEntityDetails(Integer entityId) {
		log.info("Requesting feedEntityDetails for entityId: {}", entityId);

		try {
			List<EntityDTO> entityDTOs = entityIntegrationDao.getEntityDetails(entityId);
			if (entityDTOs.isEmpty()) {
				log.warn("No entity details found for entityId: {}", entityId);
				return;
			}

			for (EntityDTO entityDTO : entityDTOs) {

				entityDTO.setSponsorDetails(entityIntegrationDao.getEntitySponsorDetails(entityDTO.getEntityId()));
				entityDTO.setOrganizationDetails(entityIntegrationDao.getEntityOrganizationDetails(entityDTO.getEntityId()));
				String incorporationDate = entityDTO.getOrganizationDetails() != null ? entityDTO.getOrganizationDetails().getIncorporatedDate() : null;

				if (incorporationDate != null && !incorporationDate.isEmpty()) {
					log.info("incorporationDate : {}", incorporationDate);
					if (Pattern.matches(Constant.DATE_FORMAT, incorporationDate)) {
						entityDTO.getOrganizationDetails().setIncorporatedDate(incorporationDate);
					} else {
						log.warn("Invalid incorporation date format: {}", incorporationDate);
						entityDTO.getOrganizationDetails().setIncorporatedDate(null);
					}
				}

				try {
					EntityResponse entityResponse = kcFeignClient.feedEntityDetails(entityDTO);
					entityIntegrationDao.updateEntitySponsorInfoByParams(entityResponse);
				} catch (FeignException | DataAccessException e) {
					log.error("Error processing entityId: {} : {}", entityId, e.getMessage(), e);
				} catch (Exception e) {
					log.error("Unexpected error for entityId: {} : {}", entityId, e.getMessage(), e);
				}
			}
		} catch (DataAccessException e) {
			log.error("Database error while retrieving entity details for entityId: {}: {}", entityId, e.getMessage(), e);
		} catch (Exception e) {
			log.error("Unexpected error while retrieving entity details for entityId: {}: {}", entityId, e.getMessage(), e);
		}
	}

}
