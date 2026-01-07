package com.polus.kcintegration.proposal.dao;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.kcintegration.exception.custom.IntegrationCustomException;
import com.polus.kcintegration.proposal.dto.ProposalDTO;
import com.polus.kcintegration.proposal.dto.ProposalPersonDTO;
import com.polus.kcintegration.proposal.dto.QuestionnaireVO;
import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.StoredProcedureQuery;
import lombok.extern.slf4j.Slf4j;

@Transactional
@Service
@Slf4j
public class ProposalKCIntegrationDaoImpl implements ProposalKCIntegrationDao {

	@Autowired
	private EntityManager entityManager;

	@Override
	public String convertObjectToJSON(Object object) {
		String response = "";
		ObjectMapper mapper = new ObjectMapper();
		try {
			mapper.setVisibility(PropertyAccessor.FIELD, Visibility.ANY);
			response = mapper.writeValueAsString(object);
		} catch (Exception e) {
			log.error("Error occured in convertObjectToJSON : {}", e.getMessage());
		}
		return response;
	}

	@Override
	public ProposalDTO fetchProposalByProposalNumber(String proposalNumber) {
	    ResultSet rset = null;
	    ProposalDTO  dto = null;
		try
		{
			String procedureName = "FIBI_COI_GET_DEV_PROP_DTLS";
	        StoredProcedureQuery storedProcedure = entityManager.createStoredProcedureQuery(procedureName);
	        storedProcedure.registerStoredProcedureParameter(1, String.class, ParameterMode.IN);
	        storedProcedure.registerStoredProcedureParameter(2, void.class, ParameterMode.REF_CURSOR);
	        storedProcedure.setParameter(1, proposalNumber);
	        boolean executeResult = storedProcedure.execute();
	        if (executeResult) {
	            rset = (ResultSet) storedProcedure.getOutputParameterValue(2);
	            
	            while (rset != null && rset.next()) {
	            	  dto = ProposalDTO.builder()
	                        .proposalNumber(rset.getString("PROPOSAL_NUMBER"))
	                        .versionNumber(rset.getInt("VERSION_NUMBER"))
	                        .ipNumber(rset.getString("IP_NUMBER"))
	                        .sponsorGrantNumber(rset.getString("SPONSOR_GRANT_NUMBER"))
	                        .title(rset.getString("TITLE"))
	                        .documentUrl(rset.getString("DOCUMENT_URL"))
	                        .startDate(rset.getTimestamp("PROJECT_START_DATE"))
	                        .endDate(rset.getTimestamp("PROJECT_END_DATE"))
	                        .leadUnit(rset.getString("LEAD_UNIT_NUMBER"))
	                        .leadUnitName(rset.getString("LEAD_UNIT_NAME"))
	                        .primeSponsorCode(rset.getString("PRIME_SPONSOR"))
	                        .primeSponsorName(rset.getString("PRIME_SPONSOR_NAME"))
	                        .sponsorCode(rset.getString("SPONSOR"))
	                        .sponsorName(rset.getString("SPONSOR_NAME"))
	                        .proposalStatusCode(rset.getString("PROPOSAL_STATUS_CODE"))
	                        .proposalStatus(rset.getString("PROPOSAL_STATUS"))
	                        .proposalTypeCode(rset.getString("PROPOSAL_TYPE_CODE"))
	                        .proposalType(rset.getString("PROPOSAL_TYPE"))
	                        .srcSysUpdateTimestamp(rset.getTimestamp("SRC_SYS_UPDATE_TIMESTAMP"))
	                        .srcSysUpdateUsername(rset.getString("SRC_SYS_UPDATE_USER_NAME"))
	                        .attribute1Label(rset.getString("ATTRIBUTE_1_LABEL"))
	                        .attribute1Value(rset.getString("ATTRIBUTE_1_VALUE"))
	                        .attribute2Label(rset.getString("ATTRIBUTE_2_LABEL"))
	                        .attribute2Value(rset.getString("ATTRIBUTE_2_VALUE"))
	                        .attribute3Label(rset.getString("ATTRIBUTE_3_LABEL"))
	                        .attribute3Value(rset.getString("ATTRIBUTE_3_VALUE"))
	                        .attribute4Label(rset.getString("ATTRIBUTE_4_LABEL"))
	                        .attribute4Value(rset.getString("ATTRIBUTE_4_VALUE"))
	                        .attribute5Label(rset.getString("ATTRIBUTE_5_LABEL"))
	                        .attribute5Value(rset.getString("ATTRIBUTE_5_VALUE"))
	                        .build();
	                return dto;
	            }
	        }
	    } catch (Exception e) {
	    	log.error("Exception in fetchProposalByProposalNumber: {}", e.getMessage());
	    	throw new IntegrationCustomException("Error during feedDevelopmentProposal :{}", e, proposalNumber);
	    } finally {
	        if (rset != null) {
	            try {
	                rset.close();
	            } catch (SQLException e) {
	                log.error("Error closing ResultSet: {}", e.getMessage());
	            }
	        }
	    }
		return dto;
	}

	@Override
	public List<ProposalPersonDTO> fetchProposalPersons(String proposalNumber) {
	    List<ProposalPersonDTO> persons = new ArrayList<>();
	    ResultSet rset = null;
		try {
			String procedureName = "FIBI_COI_GET_DEV_PROP_PER_DTLS";
	        StoredProcedureQuery storedProcedure = entityManager.createStoredProcedureQuery(procedureName);
	        storedProcedure.registerStoredProcedureParameter(1, String.class, ParameterMode.IN);
	        storedProcedure.registerStoredProcedureParameter(2, void.class, ParameterMode.REF_CURSOR);
	        storedProcedure.setParameter(1, proposalNumber);
	        boolean executeResult = storedProcedure.execute();
	        if (executeResult) {
	            rset = (ResultSet) storedProcedure.getOutputParameterValue(2);
	            while (rset != null && rset.next()) {
	            	ProposalPersonDTO  dto = ProposalPersonDTO.builder()
	                        .proposalNumber(rset.getString("PROPOSAL_NUMBER"))
	                        .keyPersonName(rset.getString("FULL_NAME"))
	                        .keyPersonId(rset.getString("PERSON_ID"))
	                        .keyPersonRoleCode(rset.getInt("PROP_PERSON_ROLE_CODE"))
	                        .keyPersonRole(rset.getString("KEY_PERSON_ROLE"))
	                        .percentageOfEffort(rset.getBigDecimal("PERCENTAGE_OF_EFFORT"))
	                        .certificationFlag(rset.getString("CERTIFICATION_FLAG"))
	                        .disclosureReqFlag(rset.getString("DISCLOSURE_REQUIRED_FLAG"))
	                        .disclosureReviewStatus(rset.getString("DISCLOSURE_REVIEW_STATUS"))
	                        .disclosureStatus(rset.getString("DISCLOSURE_STATUS"))
	                        .attribute1Label(rset.getString("ATTRIBUTE_1_LABEL"))
	                        .attribute1Value(rset.getString("ATTRIBUTE_1_VALUE"))
	                        .attribute2Label(rset.getString("ATTRIBUTE_2_LABEL"))
	                        .attribute2Value(rset.getString("ATTRIBUTE_2_VALUE"))
	                        .attribute3Label(rset.getString("ATTRIBUTE_3_LABEL"))
	                        .attribute3Value(rset.getString("ATTRIBUTE_3_VALUE"))
	                        .build();
	            	persons.add(dto);
	            }
	        }
	    } catch (SQLException e) {
	    	log.error("Exception in fetchProposalPersons: {}", e.getMessage());
	    	throw new IntegrationCustomException("Error during fetchProposalPersons :{}", e, proposalNumber);
	    } finally {
	        if (rset != null) {
	            try {
	                rset.close();
	            } catch (SQLException e) {
	                log.error("Error closing ResultSet: {}", e.getMessage());
	            }
	        }
	    }
	    return persons;
	}

	@Override
	public List<QuestionnaireVO> fetchQuestionnaireDetailsByParams(String moduleItemId, Integer questionnaireId, String personId) {
		List<QuestionnaireVO> questionnaireVOs = new ArrayList<>();
		ResultSet rset = null;
		try {
			String procedureName = "FIBI_COI_GET_DEV_PROP_QNR_DTLS";
	        StoredProcedureQuery storedProcedure = entityManager.createStoredProcedureQuery(procedureName);
	        storedProcedure.registerStoredProcedureParameter(1, String.class, ParameterMode.IN);
	        storedProcedure.registerStoredProcedureParameter(2, Integer.class, ParameterMode.IN);
	        storedProcedure.registerStoredProcedureParameter(3, String.class, ParameterMode.IN);
	        storedProcedure.registerStoredProcedureParameter(4, void.class, ParameterMode.REF_CURSOR);
	        storedProcedure.setParameter(1, moduleItemId);
	        storedProcedure.setParameter(2, questionnaireId);
	        storedProcedure.setParameter(3, personId);
	        boolean executeResult = storedProcedure.execute();
	        if (executeResult) {
	        	rset = (ResultSet) storedProcedure.getOutputParameterValue(4);
	            while (rset != null && rset.next()) {
	            	QuestionnaireVO vo = new QuestionnaireVO();
	            	vo.setProposalNumber(moduleItemId);
	            	vo.setPersonId(rset.getString("PERSON_ID"));
	            	vo.setQuestionId(rset.getInt("QUESTION_ID"));
	            	vo.setQuestionnaireId(rset.getInt("QUESTIONNAIRE_ID"));
	            	vo.setAnswer(rset.getString("ANSWER"));
	            	vo.setCoiProjectTypeCode(rset.getString("COI_PROJECT_TYPE_CODE"));
	            	vo.setPersonHomeUnit(rset.getString("HOME_UNIT"));
	            	vo.setAttribute1Label(rset.getString("ATTRIBUTE_1_LABEL"));
	            	vo.setAttribute1Value(rset.getString("ATTRIBUTE_1_VALUE"));
	            	vo.setAttribute2Label(rset.getString("ATTRIBUTE_2_LABEL"));
	            	vo.setAttribute2Value(rset.getString("ATTRIBUTE_2_VALUE"));
	            	vo.setAttribute3Label(rset.getString("ATTRIBUTE_3_LABEL"));
	            	vo.setAttribute3Value(rset.getString("ATTRIBUTE_3_VALUE"));
	            	questionnaireVOs.add(vo);
	            }
	        }
		} catch (Exception e) {
			log.error("Exception in fetchQuestionnaireDetailsByParams: {}", e.getMessage());
			throw new IntegrationCustomException("Error during fetchQuestionnaireDetailsByParams :{}", e, moduleItemId);
		} finally {
	        if (rset != null) {
	            try {
	                rset.close();
	            } catch (SQLException e) {
	                log.error("Error closing ResultSet: {}", e.getMessage());
	            }
	        }
	    }
		return questionnaireVOs;
	}

}
