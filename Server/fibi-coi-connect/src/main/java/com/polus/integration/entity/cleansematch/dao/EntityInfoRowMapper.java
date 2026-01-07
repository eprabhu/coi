package com.polus.integration.entity.cleansematch.dao;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.jdbc.core.RowMapper;

import com.polus.integration.entity.cleansematch.dto.EntityInfoDTO;

public class EntityInfoRowMapper implements RowMapper<EntityInfoDTO> {
    @Override
    public EntityInfoDTO mapRow(ResultSet rs, int rowNum) throws SQLException {
    	EntityInfoDTO dto = new EntityInfoDTO();
        dto.setEntityId(rs.getInt("ENTITY_ID"));
        dto.setEntityName(rs.getString("PRIMARY_NAME"));
        dto.setDunsNumber(rs.getString("DUNS_NUMBER"));
        dto.setUeiNumber(rs.getString("UEI_NUMBER"));
        dto.setCageNumber(rs.getString("CAGE_NUMBER"));
        dto.setEntityStatusTypeCode(rs.getString("ENTITY_STATUS_TYPE_CODE"));
        dto.setEntityStatus(rs.getString("ENTITY_STATUS"));
        dto.setPrimaryAddressLine1(rs.getString("PRIMARY_ADDRESS_LINE_1"));
        dto.setPrimaryAddressLine2(rs.getString("PRIMARY_ADDRESS_LINE_2"));
        dto.setCity(rs.getString("CITY"));
        dto.setState(rs.getString("STATE"));
        dto.setPostCode(rs.getString("POST_CODE"));
        dto.setCountryCode(rs.getString("COUNTRY_CODE"));
        dto.setCountry(rs.getString("COUNTRY_NAME"));
        dto.setWebsite(rs.getString("WEBSITE_ADDRESS"));
        dto.setEmail(rs.getString("CERTIFIED_EMAIL"));
        dto.setIsActive(rs.getString("IS_ACTIVE"));
        dto.setSponsorCode(rs.getString("SPONSOR_CODE"));
        dto.setPhoneNumber(rs.getString("PHONE_NUMBER"));
        dto.setOrganizationId(rs.getObject("ORGANIZATION_ID") != null ? rs.getString("ORGANIZATION_ID") : null);
        return dto;
    }
}
