package com.polus.kcintegration.instituteProposal.dao;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.kcintegration.exception.custom.IntegrationCustomException;
import com.polus.kcintegration.instituteProposal.dto.InstituteProposalDTO;
import com.polus.kcintegration.instituteProposal.dto.InstituteProposalPersonDTO;
import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.StoredProcedureQuery;
import lombok.extern.slf4j.Slf4j;

@Transactional
@Service
@Slf4j
public class InstituteProposalIntegrationDaoImpl implements InstituteProposalIntegrationDao {

	@Autowired
	private EntityManager entityManager;

	@Override
	public InstituteProposalDTO fetchProposalByProposalNumber(String projectNumber) {
		List<String> devProposalIds = new ArrayList<>();
		try
		{
			String procedureName = "FIBI_COI_GET_INST_PROPOSAL";
	        StoredProcedureQuery storedProcedure = entityManager.createStoredProcedureQuery(procedureName);
	        storedProcedure.registerStoredProcedureParameter(1, String.class, ParameterMode.IN);
	        storedProcedure.registerStoredProcedureParameter(2, void.class, ParameterMode.REF_CURSOR);
	        storedProcedure.setParameter(1, projectNumber);
	        boolean executeResult = storedProcedure.execute();
	        if (executeResult) {
	            try (ResultSet rset = (ResultSet) storedProcedure.getOutputParameterValue(2)) {
	                if (rset != null && rset.next()) {
	                	if (rset.getString("LINKED_DEV_PROPOSAL_IDS") != null) {
	                		devProposalIds = Arrays.asList(rset.getString("LINKED_DEV_PROPOSAL_IDS").split(","));
	                	}
	                    return InstituteProposalDTO.builder()
	                        .projectNumber(projectNumber)
	                        .projectId((String) getColumnValue(rset, "PROJECT_ID", "String"))
	                        .linkedDevProposalNumbers(devProposalIds)
	                        .versionNumber((Integer) getColumnValue(rset, "VERSION_NUMBER", "Integer"))
	                        .linkedAwardProjectNumber((String) getColumnValue(rset, "LINKED_AWARD_PROJECT_NUMBER", "String"))
	                        .sponsorGrantNumber((String) getColumnValue(rset, "SPONSOR_GRANT_NUMBER", "String"))
	                        .leadUnitNumber((String) getColumnValue(rset, "LEAD_UNIT_NUMBER", "String"))
	                        .leadUnitName((String) getColumnValue(rset, "LEAD_UNIT_NAME", "String"))
	                        .projectStartDate((Timestamp) getColumnValue(rset, "PROJECT_START_DATE", "Timestamp"))
	                        .projectEndDate((Timestamp) getColumnValue(rset, "PROJECT_END_DATE", "Timestamp"))
	                        .projectTypeCode((String) getColumnValue(rset, "PROJECT_TYPE_CODE", "String"))
	                        .projectType((String) getColumnValue(rset, "PROJECT_TYPE", "String"))
	                        .projectStatusCode((String) getColumnValue(rset, "PROJECT_STATUS_CODE", "String"))
	                        .projectStatus((String) getColumnValue(rset, "PROJECT_STATUS", "String"))
	                        .title((String) getColumnValue(rset, "TITLE", "String"))
	                        .documentUrl((String) getColumnValue(rset, "DOCUMENT_URL", "String"))
	                        .primeSponsorCode((String) getColumnValue(rset, "PRIME_SPONSOR_CODE", "String"))
	                        .primeSponsorName((String) getColumnValue(rset, "PRIME_SPONSOR_NAME", "String"))
	                        .sponsorCode((String) getColumnValue(rset, "SPONSOR_CODE", "String"))
	                        .sponsorName((String) getColumnValue(rset, "SPONSOR_NAME", "String"))
	                        .srcSysUpdateTimestamp((Timestamp) getColumnValue(rset, "SRC_SYS_UPDATE_TIMESTAMP", "Timestamp"))
	                        .srcSysUpdatedBy((String) getColumnValue(rset, "SRC_SYS_UPDATE_USER_NAME", "String"))
	                        .attribute1Label((String) getColumnValue(rset, "ATTRIBUTE_1_LABEL", "String"))
	                        .attribute1Value((String) getColumnValue(rset, "ATTRIBUTE_1_VALUE", "String"))
	                        .attribute2Label((String) getColumnValue(rset, "ATTRIBUTE_2_LABEL", "String"))
	                        .attribute2Value((String) getColumnValue(rset, "ATTRIBUTE_2_VALUE", "String"))
	                        .attribute3Label((String) getColumnValue(rset, "ATTRIBUTE_3_LABEL", "String"))
	                        .attribute3Value((String) getColumnValue(rset, "ATTRIBUTE_3_VALUE", "String"))
	                        .attribute4Label((String) getColumnValue(rset, "ATTRIBUTE_4_LABEL", "String"))
	                        .attribute4Value((String) getColumnValue(rset, "ATTRIBUTE_4_VALUE", "String"))
	                        .attribute5Label((String) getColumnValue(rset, "ATTRIBUTE_5_LABEL", "String"))
	                        .attribute5Value((String) getColumnValue(rset, "ATTRIBUTE_5_VALUE", "String"))
	                        .build();
	                }
	            } catch (SQLException e) {
	                log.error("Error processing ResultSet: {}", e.getMessage());
	            }
	        }
	    } catch (Exception e) {
	        log.error("Exception in fetchProposalByProposalNumber: {}", e.getMessage());
	        throw new IntegrationCustomException("Error during fetching project by number: " + projectNumber, e);
	    }
	    return null;
	}

	@Override
	public List<InstituteProposalPersonDTO> fetchProposalPersons(String projectNumber) {
	    List<InstituteProposalPersonDTO> persons = new ArrayList<>();
		try {
			String procedureName = "FIBI_COI_GET_INST_PROP_PERSONS";
	        StoredProcedureQuery storedProcedure = entityManager.createStoredProcedureQuery(procedureName);
	        storedProcedure.registerStoredProcedureParameter(1, String.class, ParameterMode.IN);
	        storedProcedure.registerStoredProcedureParameter(2, void.class, ParameterMode.REF_CURSOR);
	        storedProcedure.setParameter(1, projectNumber);
	        boolean executeResult = storedProcedure.execute();
	        if (executeResult) {
	            try (ResultSet rset = (ResultSet) storedProcedure.getOutputParameterValue(2)) {
	                while (rset != null && rset.next()) {
	                    try {
	                        InstituteProposalPersonDTO dto = InstituteProposalPersonDTO.builder()
	                                .projectNumber(projectNumber)
	                                .keyPersonName((String) getColumnValue(rset, "PERSON_NAME", "String"))
	                                .keyPersonId((String) getColumnValue(rset, "PERSON_ID", "String"))
	                                .keyPersonRoleCode((Integer) getColumnValue(rset, "KEY_PERSON_ROLE_CODE", "Integer"))
	                                .keyPersonRoleName((String) getColumnValue(rset, "KEY_PERSON_ROLE", "String"))
	                                .percentOfEffort((BigDecimal) getColumnValue(rset, "PERCENTAGE_OF_EFFORT", "BigDecimal"))
	                                .attribute1Label((String) getColumnValue(rset, "ATTRIBUTE_1_LABEL", "String"))
	                                .attribute1Value((String) getColumnValue(rset, "ATTRIBUTE_1_VALUE", "String"))
	                                .attribute2Label((String) getColumnValue(rset, "ATTRIBUTE_2_LABEL", "String"))
	                                .attribute2Value((String) getColumnValue(rset, "ATTRIBUTE_2_VALUE", "String"))
	                                .attribute3Label((String) getColumnValue(rset, "ATTRIBUTE_3_LABEL", "String"))
	                                .attribute3Value((String) getColumnValue(rset, "ATTRIBUTE_3_VALUE", "String"))
	                                .build();
	                        persons.add(dto);
	                    } catch (SQLException e) {
	                        log.error("Error processing ResultSet for project number '{}': {}", projectNumber, e.getMessage());
	                    }
	                }
	            } catch (SQLException e) {
	                log.error("Error accessing ResultSet: {}", e.getMessage(), e);
	                throw new IntegrationCustomException("Error accessing ResultSet for project number: " + projectNumber, e);
	            }
	        }
	    } catch (Exception e) {
	        log.error("Exception during fetchProposalPersons for project number '{}': {}", projectNumber, e.getMessage());
	        throw new IntegrationCustomException("Error during fetchProposalPersons for project number: " + projectNumber, e);
	    }

	    return persons;
	}

	private Object getColumnValue(ResultSet rset, String columnName, String dataType) throws SQLException {
	    try {
	        if ("Integer".equals(dataType)) {
	            return rset.getInt(columnName);
	        } else if ("String".equals(dataType)) {
	            return rset.getString(columnName);
	        } else if ("BigDecimal".equals(dataType)) {
	            return rset.getBigDecimal(columnName);
	        } else if ("Timestamp".equals(dataType)) {
	            return rset.getTimestamp(columnName);
	        } else {
	            throw new IllegalArgumentException("Unsupported data type: " + dataType);
	        }
	    } catch (SQLException e) {
	        log.error("Error accessing column '{}': {}", columnName, e.getMessage());
	        throw new IntegrationCustomException("Error accessing column '" + columnName + "': " + e.getMessage(), e);
	    }
	}

}
