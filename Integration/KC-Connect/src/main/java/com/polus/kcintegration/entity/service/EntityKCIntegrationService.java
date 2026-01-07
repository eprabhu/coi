package com.polus.kcintegration.entity.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.polus.kcintegration.entity.dao.EntityKCIntegrationDao;
import com.polus.kcintegration.entity.dto.EntityDTO;
import com.polus.kcintegration.entity.dto.EntityResponse;

import lombok.extern.slf4j.Slf4j;

import java.sql.SQLException;

@Slf4j
@Service
public class EntityKCIntegrationService {

	@Autowired
	private EntityKCIntegrationDao kcIntegrationDao;

	public EntityResponse feedEntityDetails(EntityDTO entityDTO) {
		log.info("Requesting for feedEntityDetails!");
		log.info("entityId : {}", entityDTO.getEntityId());
		EntityResponse entityResponse = EntityResponse.builder().build();
		if (entityDTO.getSponsorDetails() != null) {
			EntityResponse sponsorRes = kcIntegrationDao.feedEntityDetailsToSponsor(entityDTO);
			entityResponse.setSponsorCode(sponsorRes.getSponsorCode());
			entityResponse.setSponsorFeedError(sponsorRes.getSponsorFeedError());
			entityResponse.setRolodexId(sponsorRes.getRolodexId());
			if (entityDTO.getOrganizationDetails() != null) {
				entityDTO.getOrganizationDetails().setRolodexId(sponsorRes.getRolodexId());
				entityDTO.setSponsorCode(sponsorRes.getSponsorCode());
			}
		}
		if (entityDTO.getOrganizationDetails() != null) {
			EntityResponse orgRes = kcIntegrationDao.feedEntityDetailsToOrganization(entityDTO);
			entityResponse.setOrganizationId(orgRes.getOrganizationId());
			entityResponse.setOrganizationFeedError(orgRes.getOrganizationFeedError());
			entityResponse.setRolodexId(entityDTO.getOrganizationDetails().getRolodexId());// organization has no it's on rolodex its dependent to sponsor rolodex
		}
		entityResponse.setEntityId(entityDTO.getEntityId());
		return entityResponse;
	}

}
