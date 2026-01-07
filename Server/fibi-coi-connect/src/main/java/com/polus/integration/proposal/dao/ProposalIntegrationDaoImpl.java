package com.polus.integration.proposal.dao;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.integration.proposal.dto.DisclosureResponse;
import com.polus.integration.proposal.pojo.COIIntegrationPropQuestAns;
import com.polus.integration.proposal.pojo.COIIntegrationProposal;
import com.polus.integration.proposal.pojo.COIIntegrationProposalPerson;
import com.polus.integration.proposal.questionnaire.pojo.FibiCoiQnrMapping;
import com.polus.integration.proposal.repository.ProposalIntegrationRepository;
import com.polus.integration.proposal.repository.ProposalPersonIntegrationRepository;
import com.polus.integration.proposal.repository.ProposalQnAIntegrationRepository;
import com.polus.questionnaire.dto.FetchQnrAnsHeaderDto;
import com.polus.questionnaire.dto.GetQNRDetailsDto;
import com.polus.questionnaire.dto.QuestionnaireSaveDto;
import com.polus.questionnaire.service.QuestionnaireEngineServiceImpl;

import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceException;
import jakarta.persistence.Query;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.extern.slf4j.Slf4j;

@Transactional
@Service
@Slf4j
public class ProposalIntegrationDaoImpl implements ProposalIntegrationDao {

	@Autowired
	private EntityManager entityManager;

	@Autowired
	private QuestionnaireEngineServiceImpl questionnaireService;
	
	@Autowired
	private ProposalIntegrationRepository proposalIntegrationRepository;
	
	@Autowired
	private ProposalPersonIntegrationRepository proposalPersonIntegrationRepository;

	@Autowired
	private ProposalQnAIntegrationRepository qnAIntegrationRepository;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Override
	public FibiCoiQnrMapping getQuestionnaireMappingInfo(Integer questionnaireId) {
		CriteriaBuilder builder = entityManager.getCriteriaBuilder();
        CriteriaQuery<FibiCoiQnrMapping> query = builder.createQuery(FibiCoiQnrMapping.class);
        Root<FibiCoiQnrMapping> root = query.from(FibiCoiQnrMapping.class);
        query.where(builder.equal(root.get("sourceQnrId"), questionnaireId));
		return entityManager.createQuery(query).getSingleResult();
	}

	@Override
	public String getQuestionAnswerByParams(Integer questionId, Integer questionnaireId, Integer proposalNumber, String disclosurePersonId) {
		String answer = null;
	    try {
	        CriteriaBuilder builder = entityManager.getCriteriaBuilder();
	        CriteriaQuery<String> query = builder.createQuery(String.class);
	        Root<COIIntegrationPropQuestAns> root = query.from(COIIntegrationPropQuestAns.class);
	        Predicate predicate1 = builder.equal(root.get("proposalNumber"), proposalNumber);
	        Predicate predicate2 = builder.equal(root.get("keyPersonId"), disclosurePersonId);
	        Predicate predicate3 = builder.equal(root.get("questionnaireId"), questionnaireId);
	        Predicate predicate4 = builder.equal(root.get("questionId"), questionId);
	        query.select(root.get("answer"));
	        query.where(builder.and(predicate1, predicate2, predicate3, predicate4));
	        answer = entityManager.createQuery(query).getSingleResult();
	    } catch (NoResultException e) {
	        log.error("No answer found for the provided parameters.", e.getMessage());
	    } catch (Exception e) {
	    	log.error("Exception in getQuestionAnswerByParams", e.getMessage());
	    }
	    return answer;
	}

	@Override
	public Integer findQuestionnaireAnsHeaderId(FetchQnrAnsHeaderDto request) {
		Integer questionnaireAnswerId = questionnaireService.findQuestionnaireAnsHeaderId(request);
		return questionnaireAnswerId != -1 ? questionnaireAnswerId : null;
	}

	@Override
	public GetQNRDetailsDto getQuestionnaireDetails(GetQNRDetailsDto questionnaireDataBus) {
		return questionnaireService.getQuestionnaireDetails(questionnaireDataBus);
	}

	@Override
	public QuestionnaireSaveDto saveQuestionnaireAnswers(QuestionnaireSaveDto questionnaireDataBus) throws Exception {
		return questionnaireService.saveQuestionnaireAnswers(questionnaireDataBus);
	}

	@Override
	public Boolean canCreateProjectDisclosure(Integer questionnaireId, String personId, String proposalNumber) {
	    try {
	        Query query = entityManager.createNativeQuery("SELECT FN_INT_CAN_CREATE_PROP_DISCL(:proposalNumber, :personId, :questionnaireId)")
	        							.setParameter("proposalNumber", proposalNumber)
	                                   .setParameter("personId", personId)
	                                   .setParameter("questionnaireId", questionnaireId);

	        Object result = query.getSingleResult();
	        if (result instanceof Number) {
	            return ((Number) result).intValue() == 1;
	        }
	        return false;
	    } catch (Exception e) {
	        log.error("Error in canCreateProjectDisclsoure", e.getMessage());
	        return false;
	    }
	}
	
	@Override
	public void saveProposal(COIIntegrationProposal coiIntegrationProposal) {
		 proposalIntegrationRepository.save(coiIntegrationProposal);
	}

	@Override
	public void saveProposalPerson(COIIntegrationProposalPerson proposalPerson) throws Exception {
		proposalPersonIntegrationRepository.save(proposalPerson);
		
	}

	@Override
	public void saveQuestionnaireAnswer(COIIntegrationPropQuestAns integrationPropQuestAns) {
		qnAIntegrationRepository.save(integrationPropQuestAns);
	}

	@Override
	public Boolean canMarkDisclosureAsVoid(Integer questionnaireId, String personId, String moduleItemId) {
		try {
	        Query query = entityManager.createNativeQuery("SELECT FN_INT_CAN_MARK_DISCL_VOID(:proposalNumber, :personId, :questionnaireId)")
	        							.setParameter("proposalNumber", moduleItemId)
	                                   .setParameter("personId", personId)
	                                   .setParameter("questionnaireId", questionnaireId);

	        Object result = query.getSingleResult();
	        if (result instanceof Number) {
	            return ((Number) result).intValue() == 1;
	        }
	        return Boolean.FALSE;
	    } catch (Exception e) {
	        log.error("Error in canMarkDisclosureAsVoid", e.getMessage());
	        return Boolean.FALSE;
	    }
	}

	@Override
	public DisclosureResponse feedProposalDisclosureStatus(String proposalNumber, String personId) {
		try {
			log.info("Calling stored procedure COI_INT_PROP_PERSON_DISCL_STATUS with proposalNumber: {} and personId: {}", proposalNumber, personId);

			return jdbcTemplate.execute((Connection conn) -> {
				try (CallableStatement cs = conn.prepareCall("{call COI_INT_PROP_PERSON_DISCL_STATUS(?, ?)}")) {
					cs.setString(1, proposalNumber);
					cs.setString(2, personId);

					try (ResultSet rset = cs.executeQuery()) {
						if (rset != null && rset.next()) {
							Integer id = rset.getObject("DISCLOSURE_ID") != null ? rset.getInt("DISCLOSURE_ID") : null;
							String status = rset.getString("DISCLOSURE_STATUS");

							log.info("Disclosure ID: {}, Status: {} for proposalNumber: {}, personId: {}", id, status, proposalNumber, personId);

							if (status != null) {
								return DisclosureResponse.builder().disclosureId(id).disclosureStatus(status).build();
							} else {
								log.warn("No disclosure data found for proposalNumber: {} and personId: {}", proposalNumber, personId);
								return DisclosureResponse.builder().message("No data found!").build();
							}
						} else {
							log.warn("ResultSet is empty for proposalNumber: {} and personId: {}", proposalNumber, personId);
							return DisclosureResponse.builder().message("No data found!").build();
						}
					}
				} catch (SQLException ex) {
					log.error("SQL error during procedure execution for proposalNumber: {}, personId: {}: {}", proposalNumber, personId, ex.getMessage(), ex);
					throw new RuntimeException("A SQL error occurred during the procedure call.", ex);
				}
			});
		} catch (DataAccessException e) {
			log.error("DataAccessException while fetching disclosure status for proposalNumber: {}, personId: {}: {}", proposalNumber, personId, e.getMessage(), e);
			return DisclosureResponse.builder().error("Database access error occurred. Please try again later.").build();
		} catch (Exception e) {
			log.error("Unexpected error while fetching disclosure details for proposalNumber: {}, personId: {}: {}", proposalNumber, personId, e.getMessage(), e);
			return DisclosureResponse.builder().error("An unexpected error occurred. Please try again later.").build();
		}
	}

	@Override
	public DisclosureResponse checkProposalDisclosureStatus(String proposalNumber) {
		log.info("Fetching disclosure status for proposalNumber: {}", proposalNumber);

		try {
			Query query = entityManager.createNativeQuery("SELECT COI_INT_PROP_DISCL_STATUS(:proposalNumber)")
					.setParameter("proposalNumber", proposalNumber);

			Object result = query.getSingleResult();
			log.info("Result from function COI_INT_PROP_DISCL_STATUS for proposalNumber {}: {}", proposalNumber, result);

			if (result instanceof Number) {
				Integer disclosureSubmitted = ((Number) result).intValue();
				String message = (disclosureSubmitted == 1) ? "Disclosure Submitted." : "Disclosure Not Submitted.";
				Boolean isSubmitted = (disclosureSubmitted == 1);

				log.info("Proposal {} - {} - {}", proposalNumber, message, isSubmitted);
				return DisclosureResponse.builder().disclosureSubmitted(isSubmitted).message(message).build();
			} else {
				log.warn("Unexpected result type for proposalNumber {}: {}", proposalNumber, result);
				return DisclosureResponse.builder().error("Unexpected result from the database.").build();
			}

		} catch (PersistenceException e) {
			log.error("Database error for proposalNumber {}: {}", proposalNumber, e.getMessage(), e);
			return DisclosureResponse.builder().error("Database access error occurred. Please try again later.").build();
		} catch (Exception e) {
			log.error("Error fetching disclosure status for proposalNumber {}: {}", proposalNumber, e.getMessage(), e);
			return DisclosureResponse.builder().error("An unexpected error occurred. Please try again later.").build();
		}
	}

	@Override
	public DisclosureResponse feedDisclosureExpirationDate(String disclosureType, String personId) {
		log.info("Fetching disclosure expiration date for personId: {} and disclosureType: {}", personId, disclosureType);

		try {
			Query query = entityManager
					.createNativeQuery("SELECT COI_INT_PRSN_DISCL_EXP_DATE(:personId, :disclosureType)")
					.setParameter("personId", personId).setParameter("disclosureType", disclosureType);

			Object result = query.getSingleResult();
			log.info("Result from function COI_INT_PRSN_DISCL_EXP_DATE: {}", result);

			if (result != null && result instanceof String expirationDate) {
				log.info("Expiration Date for personId: {} and disclosureType: {}: {}", personId, disclosureType, expirationDate);
				return DisclosureResponse.builder().expirationDate(expirationDate).build();
			} else {
				log.info("Expiration Date for personId: {} and disclosureType: {}: {}", personId, disclosureType, result);
				return DisclosureResponse.builder().expirationDate("").build();
			}

		} catch (PersistenceException e) {
			log.error("Database error for personId: {} and disclosureType: {}: {}", personId, disclosureType, e.getMessage(), e);
			return DisclosureResponse.builder().error("Database access error occurred. Please try again later.").build();
		} catch (Exception e) {
			log.error("Error fetching expiration date for personId: {} and disclosureType: {}: {}", personId, disclosureType, e.getMessage(), e);
			return DisclosureResponse.builder().error("An unexpected error occurred. Please try again later.").build();
		}
	}

	@Override
	public DisclosureResponse feedProposalPersonDisclosureId(String proposalNumber, String personId) {
		String query = "SELECT MAX(D.DISCLOSURE_ID) " + "FROM COI_DISCLOSURE D "
				+ "JOIN COI_DISCL_PROJECTS P ON D.DISCLOSURE_ID = P.DISCLOSURE_ID " + "WHERE P.MODULE_CODE = 3 "
				+ "AND P.MODULE_ITEM_KEY = :moduleItemKey " + "AND D.PERSON_ID = :personId "
				+ "AND D.DISPOSITION_STATUS_CODE != 2 AND FCOI_TYPE_CODE = 2";

		try {
			Integer disclosureId = (Integer) entityManager.createNativeQuery(query)
					.setParameter("moduleItemKey", proposalNumber).setParameter("personId", personId).getSingleResult();
			log.info("disclosureId : {}", disclosureId);

			return DisclosureResponse.builder().disclosureId(disclosureId).build();
		} catch (NoResultException e) {
			log.info("No disclosure found for proposalNumber: {} and personId: {}", proposalNumber, personId);
			return DisclosureResponse.builder().message("No disclosure found for proposalNumber: " + proposalNumber + " and personId: " + personId).build();
		} catch (Exception e) {
			log.error("Error while fetching disclosure for proposalNumber: {} and personId: {}", proposalNumber, personId, e);
			throw new RuntimeException("Error fetching disclosure information", e);
		}
	}

	@Override
	public DisclosureResponse fetchDeclarationStatus(String personId, String declarationTypeCode) {
		log.info("Fetching declaration status for Person ID: {}, Declaration Type Code: {}", personId, declarationTypeCode);

		String sql = """
				SELECT ds.DESCRIPTION
				FROM COI_DECLARATION cd
				JOIN COI_DECLARATION_STATUS ds ON cd.DECLARATION_STATUS_CODE = ds.DECLARATION_STATUS_CODE
				WHERE cd.PERSON_ID = :personId
				  AND cd.DECLARATION_TYPE_CODE = :declarationTypeCode
				  AND cd.VERSION_STATUS = 'ACTIVE'
				LIMIT 1
				""";

		try {
			Object result = entityManager.createNativeQuery(sql).setParameter("personId", personId)
					.setParameter("declarationTypeCode", declarationTypeCode).getSingleResult();

			String statusDescription = result != null ? result.toString() : "No status found";
			log.info("Declaration status found: {} for Person ID: {}, Declaration Type: {}", statusDescription, personId, declarationTypeCode);
			return DisclosureResponse.builder().message(statusDescription).build();

		} catch (NoResultException e) {
			log.warn("No declaration found for Person ID: {}, Declaration Type: {}", personId, declarationTypeCode);
			return DisclosureResponse.builder()
					.message("No declaration found for Person ID: " + personId + ", Declaration Type: " + declarationTypeCode)
					.build();
		} catch (PersistenceException e) {
			log.error("Database access error while fetching declaration status for Person ID: {}, Declaration Type: {}", personId, declarationTypeCode, e);
			throw e;
		} catch (Exception e) {
			log.error("Unexpected error during fetching declaration status for Person ID: {}, Declaration Type: {}", personId, declarationTypeCode, e);
			throw e;
		}
	}

}
