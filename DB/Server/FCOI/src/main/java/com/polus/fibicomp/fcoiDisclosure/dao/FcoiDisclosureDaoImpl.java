package com.polus.fibicomp.fcoiDisclosure.dao;

import java.math.BigInteger;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.sql.Types;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import javax.persistence.NoResultException;
import javax.persistence.Query;
import javax.persistence.Tuple;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.CriteriaUpdate;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import javax.persistence.criteria.Subquery;
import javax.transaction.Transactional;

import com.polus.fibicomp.coi.pojo.CoiReviewStatusType;
import com.polus.fibicomp.constants.StaticPlaceholders;
import com.polus.fibicomp.opa.pojo.OPAReviewStatusType;
import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.hibernate.Session;
import org.hibernate.internal.SessionImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Repository;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.CollectionType;
import com.polus.core.applicationexception.dto.ApplicationException;
import com.polus.core.businessrule.dao.BusinessRuleDao;
import com.polus.core.businessrule.dto.WorkFlowResultDto;
import com.polus.core.businessrule.vo.EvaluateValidationRuleVO;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.constants.CoreConstants;
import com.polus.core.inbox.pojo.Inbox;
import com.polus.core.pojo.UnitAdministrator;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.coi.dto.COIValidateDataDto;
import com.polus.fibicomp.coi.dto.COIValidateDto;
import com.polus.fibicomp.coi.dto.CoiConflictStatusTypeDto;
import com.polus.fibicomp.coi.dto.CoiDisclEntProjDetailsDto;
import com.polus.fibicomp.coi.dto.CoiDisclosureDto;
import com.polus.fibicomp.coi.dto.DisclosureActionLogDto;
import com.polus.fibicomp.coi.dto.DisclosureProjectDto;
import com.polus.fibicomp.coi.pojo.CoiConflictHistory;
import com.polus.fibicomp.coi.pojo.CoiProjConflictStatusType;
import com.polus.fibicomp.coi.pojo.CoiSectionsType;
import com.polus.fibicomp.coi.service.ActionLogService;
import com.polus.fibicomp.config.CustomExceptionService;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.fcoiDisclosure.dto.IntegrationNotificationRequestDto;
import com.polus.fibicomp.fcoiDisclosure.dto.IntegrationRequestDto;
import com.polus.fibicomp.fcoiDisclosure.dto.MakeVoidDto;
import com.polus.fibicomp.fcoiDisclosure.dto.ProjectEntityRequestDto;
import com.polus.fibicomp.fcoiDisclosure.dto.SFIJsonDetailsDto;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiConflictStatusType;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclProjectEntityRel;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclProjects;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclosure;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclosureFcoiType;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiProjectType;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiRiskCategory;
import com.polus.fibicomp.reviewcomments.pojos.DisclComment;

import oracle.jdbc.OracleTypes;

@Repository
@Transactional
public class FcoiDisclosureDaoImpl implements FcoiDisclosureDao {

    protected static Logger logger = LogManager.getLogger(FcoiDisclosureDaoImpl.class.getName());
	private static final String DISCLOSURE_ID = "disclosureId";
	private static final String PERSON_ID = "personId";
	private static final Pattern PATTERN = Pattern.compile("<<([A-Za-z0-9]+)>>(.+)");

    @Autowired
    private HibernateTemplate hibernateTemplate;

    @Autowired
    private CommonDao commonDao;

    @Value("${oracledb}")
    private String oracledb;

    @Autowired
    private ActionLogService actionLogService;

    @Autowired
    private CustomExceptionService exceptionService;

    @Autowired
	private BusinessRuleDao businessRuleDao;

    @Override
    public CoiDisclosure saveOrUpdateCoiDisclosure(CoiDisclosure coiDisclosure) {
        hibernateTemplate.saveOrUpdate(coiDisclosure);
        return coiDisclosure;
    }

    @Override
    public CoiDisclosure loadDisclosure(Integer disclosureId) {
        return hibernateTemplate.get(CoiDisclosure.class, disclosureId);
    }

    @Override
    public boolean isDisclosureRiskAdded(CoiDisclosureDto coiDisclosureDto) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT case when (count(d.disclosureId) > 0) then true else false end  ");
        hqlQuery.append("FROM CoiDisclosure d WHERE d.riskCategoryCode = :riskCategoryCode AND ");
        hqlQuery.append("d.disclosureId = :disclosureId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("disclosureId", coiDisclosureDto.getDisclosureId());
        query.setParameter("riskCategoryCode", coiDisclosureDto.getRiskCategoryCode());
        return (boolean) query.getSingleResult();
    }

    @Override
    public CoiRiskCategory getRiskCategoryStatusByCode(String riskCategoryCode) {
        return hibernateTemplate.get(CoiRiskCategory.class, riskCategoryCode);
    }

    @Override
    public Timestamp updateDisclosureRiskCategory(CoiDisclosureDto coiDisclosureDto) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("UPDATE CoiDisclosure d SET d.updateTimestamp = :updateTimestamp, d.riskCategoryCode = :riskCategoryCode, ");
        hqlQuery.append("d.updatedBy = :updatedBy where d.disclosureId = :disclosureId");
        Timestamp updateTimestamp = commonDao.getCurrentTimestamp();
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("disclosureId", coiDisclosureDto.getDisclosureId());
        query.setParameter("riskCategoryCode", coiDisclosureDto.getRiskCategoryCode());
        query.setParameter("updateTimestamp", updateTimestamp);
        query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
        query.executeUpdate();
        return updateTimestamp;
    }

    @Override
    public List<CoiRiskCategory> fetchDisclosureRiskCategory() {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        Query query = session.createQuery("SELECT t FROM CoiRiskCategory t ORDER BY t.sortOrder ASC");
        return query.getResultList();
    }

    @Override
    public Boolean isDisclosureRiskStatusModified(String riskCategoryCode, Integer disclosureId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT case when (count(d.disclosureId) > 0) then false else true end FROM CoiDisclosure d WHERE ");
        if (riskCategoryCode != null) {
            hqlQuery.append(" d.riskCategoryCode = :riskCategoryCode AND ");
        }
        hqlQuery.append("d.disclosureId = :disclosureId ");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("disclosureId", disclosureId);
        if (riskCategoryCode != null) {
            query.setParameter("riskCategoryCode", riskCategoryCode);
        }
        return (Boolean) query.getSingleResult();
    }


    @Override
    public List<DisclosureProjectDto> getDisclosureProjects(Integer disclosureId) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        List<DisclosureProjectDto> disclosureProjects = new ArrayList<>();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        CallableStatement statement;
        ResultSet rset = null;
        try {
            if (oracledb.equalsIgnoreCase("N")) {
                statement = connection.prepareCall("{call GET_DISCLOSURE_PROJECTS(?)}");
                if (disclosureId == null) {
                    statement.setNull(1, Types.INTEGER);
                } else {
                    statement.setInt(1, disclosureId);
                }
                statement.execute();
                rset = statement.getResultSet();
            } else if (oracledb.equalsIgnoreCase("Y")) {
                String procedureName = "GET_DISCLOSURE_PROJECTS";
                String functionCall = "{call " + procedureName + "(?,?)}";
                statement = connection.prepareCall(functionCall);
                statement.registerOutParameter(1, OracleTypes.CURSOR);
                if (disclosureId == null) {
                    statement.setNull(2, Types.INTEGER);
                } else {
                    statement.setInt(2, disclosureId);
                }
                statement.execute();
                rset = (ResultSet) statement.getObject(1);
            }
            while (rset != null && rset.next()) {
                disclosureProjects.add(DisclosureProjectDto.builder()
                        .coiDisclProjectId(rset.getInt("COI_DISCL_PROJECTS_ID"))
                        .moduleCode(rset.getInt("MODULE_CODE"))
                        .projectId(rset.getString("PROJECT_ID"))
                        .projectNumber(rset.getString("PROJECT_NUMBER"))
                        .title(rset.getString("PROJECT_TITLE"))
                        .projectStatus(rset.getString("PROJECT_STATUS"))
                        .projectStartDate(rset.getTimestamp("PROJECT_START_DATE"))
                        .projectEndDate(rset.getTimestamp("PROJECT_END_DATE"))
                        .homeUnitNumber(rset.getString("LEAD_UNIT_NUMBER"))
                        .homeUnitName(rset.getString("LEAD_UNIT_NAME"))
                        .sponsorName(rset.getString("PROJECT_SPONSOR_NAME"))
                        .sponsorCode(rset.getString("SPONSOR_CODE"))
                        .primeSponsorName(rset.getString("PROJECT_PRIME_SPONSOR_NAME"))
                        .primeSponsorCode(rset.getString("PRIME_SPONSOR_CODE"))
                        .piName(rset.getString("PI_NAME"))
                        .keyPersonId(rset.getString("KEY_PERSON_ID"))
                        .keyPersonName(rset.getString("KEY_PERSON_NAME"))
                        .reporterRole(rset.getString("KEY_PERSON_ROLE_NAME"))
                        .projectType(rset.getString("COI_PROJECT_TYPE"))
                        .projectTypeCode(rset.getString("COI_PROJECT_TYPE_CODE"))
                        .projectBadgeColour(rset.getString("BADGE_COLOR"))
                        .projectIcon(rset.getString("PROJECT_ICON"))
                        .documentNumber(rset.getString("DOCUMENT_NUMBER"))
                        .accountNumber(rset.getString("ACCOUNT_NUMBER"))
                        .build());
            }
        } catch (SQLException e) {
            logger.error("Exception in getDisclosureProjects: {} ", e.getMessage());
            throw new ApplicationException("Exception in getDisclosureProjects", e, Constants.DB_PROC_ERROR);
        }
        return disclosureProjects;
    }

    @Override
    public List<Map<Object, Object>> convertJsonStringToListMap(String jsonString) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.configure(JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES, true);
            mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            CollectionType listType = mapper.getTypeFactory().constructCollectionType(List.class, Map.class);
            return mapper.readValue(jsonString, listType);
        } catch (Exception e) {
            e.printStackTrace();
            logger.error("Exception in convertJsonStringToListMap", e.getMessage());
            exceptionService.saveErrorDetails(e.getMessage(), e,CoreConstants.JAVA_ERROR);
        }
        return null;
    }

    @Override
    public List<CoiConflictStatusType> getCoiConflictStatusTypes() {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        Query query = session.createQuery("SELECT t FROM CoiConflictStatusType t ORDER BY t.sortOrder ASC");
        return query.getResultList();
    }

    @Override
    public List<CoiProjConflictStatusType> getProjConflictStatusTypes() {
        return hibernateTemplate.loadAll(CoiProjConflictStatusType.class);
    }

    @Override
    public boolean isMasterDisclosurePresent(String personId) {
        try {
            Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
            CriteriaBuilder builder = session.getCriteriaBuilder();
            CriteriaQuery<Long> query = builder.createQuery(Long.class);
            Root<CoiDisclosure> rootCoiDisclosure = query.from(CoiDisclosure.class);
            query.select(builder.count(rootCoiDisclosure));
            query.where(builder.and(builder.equal(rootCoiDisclosure.get("personId"), personId),
                    builder.equal(rootCoiDisclosure.get("fcoiTypeCode"), "1"),
                    builder.equal(rootCoiDisclosure.get("versionStatus"), Constants.COI_ACTIVE_STATUS)));
            Long count = session.createQuery(query).getSingleResult();
            return count > 0 ? true : false;
        } catch (Exception ex) {
            return false;
        }
    }

    @Override
    public Integer generateMaxDisclosureNumber() {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        CriteriaBuilder builder = session.getCriteriaBuilder();
        CriteriaQuery<Integer> query = builder.createQuery(Integer.class);
        Root<CoiDisclosure> root = query.from(CoiDisclosure.class);
        query.select(builder.max(root.get("disclosureNumber")));
        if (session.createQuery(query).getSingleResult() != null) {
            return session.createQuery(query).getSingleResult() + 1;
        } else {
            return 1;
        }
    }

    @Override
    public CoiDisclosureFcoiType getCoiDisclosureFcoiTypeByCode(String coiTypeCode) {
        return hibernateTemplate.get(CoiDisclosureFcoiType.class, coiTypeCode);
    }

    @Override
    public List<CoiSectionsType> fetchCoiSections() {
        return hibernateTemplate.loadAll(CoiSectionsType.class);
    }

    @Override
    public Boolean isReviewerAssigned(Integer disclosureId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT COUNT(r.coiReviewId) FROM CoiReview r ");
        hqlQuery.append("WHERE r.disclosureId = :disclosureId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("disclosureId", disclosureId);
        Long count = (Long) query.getSingleResult();
        return count > 0;
    }

    @Override
    public Boolean isReviewerReviewCompleted(Integer disclosureId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT COUNT(r.coiReviewId) FROM CoiReview r ");
        hqlQuery.append("WHERE r.reviewStatusTypeCode <> 2 AND r.disclosureId = :disclosureId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("disclosureId", disclosureId);
        Long count = (Long) query.getSingleResult();
        return (count <= 0);
    }

    @Override
    public Timestamp certifyDisclosure(CoiDisclosureDto coiDisclosure) {
        Timestamp currentTimestamp = commonDao.getCurrentTimestamp();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        CriteriaBuilder cb = session.getCriteriaBuilder();
        CriteriaUpdate<CoiDisclosure> criteriaUpdate = cb.createCriteriaUpdate(CoiDisclosure.class);
        Root<CoiDisclosure> root = criteriaUpdate.from(CoiDisclosure.class);
        criteriaUpdate.set("certificationText", coiDisclosure.getCertificationText());
        criteriaUpdate.set("certifiedAt", currentTimestamp);
        criteriaUpdate.set("certifiedBy", AuthenticatedUser.getLoginPersonId());
        criteriaUpdate.set("conflictStatusCode", coiDisclosure.getConflictStatusCode());
        criteriaUpdate.set("dispositionStatusCode", coiDisclosure.getDispositionStatusCode());
        criteriaUpdate.set("reviewStatusCode", coiDisclosure.getReviewStatusCode());
        criteriaUpdate.set("updateTimestamp", currentTimestamp);
        criteriaUpdate.set("updatedBy", AuthenticatedUser.getLoginPersonId());
        criteriaUpdate.set("expirationDate", coiDisclosure.getExpirationDate());
        criteriaUpdate.where(cb.equal(root.get("disclosureId"), coiDisclosure.getDisclosureId()));
        session.createQuery(criteriaUpdate).executeUpdate();
        return currentTimestamp;
    }

    @Override
    public CoiConflictStatusTypeDto validateConflicts(Integer disclosureId) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        try {
            CallableStatement statement = connection.prepareCall("{call COI_VALIDATE_DISCLOSURE_CONFLICTS(?,?,?)}");
            statement.setInt(1, disclosureId);
            statement.setString(2, AuthenticatedUser.getLoginPersonId());
            statement.setString(3, AuthenticatedUser.getLoginPersonId());
            statement.execute();
            ResultSet rset = statement.getResultSet();
            if (rset != null && rset.next()) {
                CoiConflictStatusTypeDto conflictStatusTypeDto = new CoiConflictStatusTypeDto();
                conflictStatusTypeDto.setConflictStatusCode(rset.getString(1));
                conflictStatusTypeDto.setDescription(rset.getString(2));
                return conflictStatusTypeDto;
            }
        } catch (Exception e) {
            logger.error("Exception on validateConflicts {}", e.getMessage());
            throw new ApplicationException("error in validate conflicts ", e, Constants.DB_FN_ERROR);
        }
        return null;
    }

    @Override
    public CoiRiskCategory syncDisclosureRisk(Integer disclosureId, Integer disclosureNumber) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        try {
            CallableStatement statement = connection.prepareCall("{call COI_SYNC_DISCLOSURE_RISK(?,?,?)}");
            statement.setInt(1, disclosureId);
            statement.setInt(2, disclosureNumber);
            statement.setString(3, AuthenticatedUser.getLoginUserName());
            statement.execute();
            ResultSet rset = statement.getResultSet();
            if (rset != null && rset.next()) {
                CoiRiskCategory riskCategory = new CoiRiskCategory();
                riskCategory.setRiskCategoryCode(rset.getString(1));
                riskCategory.setDescription(rset.getString(2));
                return riskCategory;
            }
        } catch (Exception e) {
            logger.error("Exception on syncDisclosureRisk {}", e.getMessage());
            exceptionService.saveErrorDetails(e.getMessage(), e,CoreConstants.JAVA_ERROR);
        }
        return null;
    }

    @Override
    public List<CoiDisclProjectEntityRel> getProjEntityRelationshipsByDisclId(Integer disclosureId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT r FROM CoiDisclProjectEntityRel r ");
        hqlQuery.append("WHERE r.coiDisclProject.disclosureId = :disclosureId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("disclosureId", disclosureId);
        return query.getResultList();
    }

    @Override
    public String getLatestConflHisStatusCodeByProEntRelId(Integer coiDisclProjectEntityRelId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT cs.projectConflictStatusCode FROM CoiConflictHistory ch ");
        hqlQuery.append("JOIN CoiProjConflictStatusType cs ON cs.projectConflictStatusCode = ch.conflictStatusCode ");
        hqlQuery.append("WHERE ch.coiDisclProjectEntityRelId = :coiDisclProjectEntityRelId ORDER BY ch.updateTimestamp DESC");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("coiDisclProjectEntityRelId", coiDisclProjectEntityRelId);
        query.setMaxResults(1);
        List<String> resultData = query.getResultList();
        return resultData != null && !resultData.isEmpty()? (String) resultData.get(0) : "";
    }

    @Override
    public void saveOrUpdateCoiConflictHistory(CoiConflictHistory coiConflictHistory) {
        hibernateTemplate.saveOrUpdate(coiConflictHistory);
//        return coiConflictHistory;
    }

    @Override
    public void saveOrUpdateCoiDisclEntProjDetails(ProjectEntityRequestDto entityProjectRelation) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("UPDATE COI_DISCL_PROJECT_ENTITY_REL cd ");
        hqlQuery.append("INNER JOIN COI_DISCL_PROJECTS d ON d.COI_DISCL_PROJECTS_ID = cd.COI_DISCL_PROJECTS_ID ");
        hqlQuery.append("SET cd.PROJECT_CONFLICT_STATUS_CODE = :projectConflictStatusCode, cd.PROJECT_ENGAGEMENT_DETAILS = :projectEngagementDetails, ");
        hqlQuery.append("cd.UPDATED_BY = :updatedBy, cd.UPDATE_TIMESTAMP = :updateTimestamp, cd.PREVIOUS_PERSON_ENTITY_ID = cd.PERSON_ENTITY_ID ");
        hqlQuery.append("WHERE d.DISCLOSURE_ID = :disclosureId ");
        if (entityProjectRelation.getApplyAll()) {
            if (entityProjectRelation.getRelationshipSFIMode()) {
                hqlQuery.append("AND cd.PERSON_ENTITY_ID = :personEntityId ");
            } else {
                hqlQuery.append("AND cd.COI_DISCL_PROJECTS_ID = :coiDisclProjectId ");
            }
        } else {
            hqlQuery.append("AND cd.COI_DISCL_PROJECT_ENTITY_REL_ID = :coiDisclProjectEntityRelId ");
        }
        Query query = session.createNativeQuery(hqlQuery.toString());
        if (entityProjectRelation.getApplyAll()) {
            if (entityProjectRelation.getRelationshipSFIMode()) {
                query.setParameter("personEntityId", entityProjectRelation.getPersonEntityId());
            } else {
                query.setParameter("coiDisclProjectId", entityProjectRelation.getCoiDisclProjectId());
            }
        } else {
            query.setParameter("coiDisclProjectEntityRelId", entityProjectRelation.getCoiDisclProjectEntityRelId());
        }
        query.setParameter("disclosureId", entityProjectRelation.getDisclosureId());
        query.setParameter("projectConflictStatusCode", entityProjectRelation.getProjectConflictStatusCode());
        query.setParameter("projectEngagementDetails", entityProjectRelation.getProjectEngagementDetails());
        query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
        query.setParameter("updateTimestamp", commonDao.getCurrentTimestamp());
        query.executeUpdate();
    }

    @Override
    public List<Object[]> fetchDisclProjectEntityRelIds(ProjectEntityRequestDto entityProjectRelation) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT r.COI_DISCL_PROJECT_ENTITY_REL_ID, c.COMMENT_ID FROM COI_DISCL_PROJECT_ENTITY_REL r ");
        hqlQuery.append("LEFT JOIN (SELECT SUB_MODULE_ITEM_KEY, COMMENT_ID  FROM DISCL_COMMENT WHERE MODULE_CODE = 8 ");
        hqlQuery.append("AND MODULE_ITEM_KEY = :disclosureId AND MODULE_ITEM_NUMBER = :moduleItemNumber ");
        hqlQuery.append("AND COMPONENT_TYPE_CODE = 1 ) c ON c.SUB_MODULE_ITEM_KEY = r.COI_DISCL_PROJECT_ENTITY_REL_ID ");
        hqlQuery.append("INNER JOIN COI_DISCL_PROJECTS p ON p.COI_DISCL_PROJECTS_ID = r.COI_DISCL_PROJECTS_ID ");
        hqlQuery.append("WHERE p.DISCLOSURE_ID = :disclosureId ");
        hqlQuery.append(" ");
        if (entityProjectRelation.getApplyAll()) {
            if (entityProjectRelation.getRelationshipSFIMode()) {
                hqlQuery.append("AND r.PERSON_ENTITY_ID = :personEntityId ");
            } else {
                hqlQuery.append("AND r.COI_DISCL_PROJECTS_ID = :coiDisclProjectId ");
            }
        }
        Query query = session.createNativeQuery(hqlQuery.toString());
        if (entityProjectRelation.getApplyAll()) {
            if (entityProjectRelation.getRelationshipSFIMode()) {
                query.setParameter("personEntityId", entityProjectRelation.getPersonEntityId());
            } else {
                query.setParameter("coiDisclProjectId", entityProjectRelation.getCoiDisclProjectId());
            }
        }
        query.setParameter("disclosureId", entityProjectRelation.getDisclosureId());
        query.setParameter("moduleItemNumber", entityProjectRelation.getDisclosureNumber());
        return query.getResultList();
    }

    @Override
    public Boolean isSFICompletedForDisclosure(Integer personEntityId, Integer disclosureId) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        StringBuilder hqlQuery = new StringBuilder();
        hqlQuery.append("SELECT COUNT(*) FROM CoiDisclProjectEntityRel r ");
        hqlQuery.append("WHERE r.projectConflictStatusCode IS NULL ");
        hqlQuery.append("AND r.coiDisclProject.disclosureId = :disclosureId ");
        hqlQuery.append("AND r.personEntityId = :personEntityId ");
        Query query = session.createQuery(hqlQuery.toString(), Long.class);
        query.setParameter("disclosureId", disclosureId);
        query.setParameter("personEntityId", personEntityId);
        Object countData = query.getSingleResult();
        if (countData != null) {
            Long count = (Long) countData;
            return count.intValue() != 0 ? Boolean.FALSE : Boolean.TRUE;
        }
        return null;
    }

    @Override
    public Boolean checkIsSFICompletedForProject(Integer moduleCode, Integer moduleItemId, Integer disclosureId) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        StringBuilder hqlQuery = new StringBuilder();
        hqlQuery.append("SELECT COUNT(*) FROM CoiDisclProjectEntityRel r ");
        hqlQuery.append("WHERE r.projectConflictStatusCode IS NULL ");
        hqlQuery.append("AND r.coiDisclProject.disclosureId = :disclosureId ");
        hqlQuery.append("AND r.coiDisclProjectId = :moduleCode ");
        Query query = session.createQuery(hqlQuery.toString(), Long.class);
        query.setParameter("disclosureId", disclosureId);
        query.setParameter("moduleCode", moduleCode);
        Object countData = query.getSingleResult();
        if (countData != null) {
            Long count = (Long) countData;
            return count.intValue() != 0 ? Boolean.FALSE : Boolean.TRUE;
        }
        return null;
    }

    @Override
    public Timestamp updateDisclosureUpdateDetails(Integer disclosureId) {
        Timestamp updateTimestamp = commonDao.getCurrentTimestamp();
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("UPDATE CoiDisclosure cd SET cd.updateTimestamp = :updateTimestamp, cd.updatedBy = :updatedBy where cd.disclosureId = :disclosureId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("disclosureId", disclosureId);
        query.setParameter("updateTimestamp", updateTimestamp);
        query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
        query.executeUpdate();
        return updateTimestamp;
    }

    @Override
    public List<CoiDisclEntProjDetailsDto> getDisclEntProjDetails(Integer disclosureId) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        List<CoiDisclEntProjDetailsDto> disclosureProjects = new ArrayList<>();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        CallableStatement statement;
        ResultSet rset = null;
        try {
            if (oracledb.equalsIgnoreCase("N")) {
                statement = connection.prepareCall("{call COI_DISCL_ENT_PROJ_DETAILS(?)}");
                statement.setInt(1, disclosureId);
                statement.execute();
                rset = statement.getResultSet();
            } else if (oracledb.equalsIgnoreCase("Y")) {
                String procedureName = "COI_DISCL_ENT_PROJ_DETAILS";
                String functionCall = "{call " + procedureName + "(?,?)}";
                statement = connection.prepareCall(functionCall);
                statement.registerOutParameter(1, OracleTypes.CURSOR);
                statement.setInt(2, disclosureId);
                statement.execute();
                rset = (ResultSet) statement.getObject(1);
            }
            while (rset != null && rset.next()) {
                CoiDisclEntProjDetailsDto entProjDetailsDto = new CoiDisclEntProjDetailsDto();
                entProjDetailsDto.setCoiDisclProjectEntityRelId(rset.getInt("COI_DISCL_PROJECT_ENTITY_REL_ID"));
                entProjDetailsDto.setCoiDisclProjectId(rset.getInt("COI_DISCL_PROJECTS_ID"));
                entProjDetailsDto.setPersonEntityId(rset.getInt("PERSON_ENTITY_ID"));
                entProjDetailsDto.setPersonEntityNumber(rset.getInt("PERSON_ENTITY_NUMBER"));
                entProjDetailsDto.setPrePersonEntityId(rset.getInt("PREVIOUS_PERSON_ENTITY_ID"));
                entProjDetailsDto.setEntityId(rset.getInt("ENTITY_ID"));
                entProjDetailsDto.setProjectConflictStatusCode(rset.getString("PROJECT_CONFLICT_STATUS_CODE"));
                entProjDetailsDto.setUpdatedBy(rset.getString("UPDATED_BY"));
                entProjDetailsDto.setUpdateTimestamp(rset.getTimestamp("UPDATE_TIMESTAMP"));
                CoiProjConflictStatusType coiProjConflictStatusType = new CoiProjConflictStatusType();
                coiProjConflictStatusType.setDescription(rset.getString("PROJECT_CONFLICT_STATUS"));
                coiProjConflictStatusType.setProjectConflictStatusCode(rset.getString("PROJECT_CONFLICT_STATUS_CODE"));
                entProjDetailsDto.setCoiProjConflictStatusType(coiProjConflictStatusType);
                entProjDetailsDto.setPersonEngagementDetails(rset.getString("PROJECT_ENGAGEMENT_DETAILS"));
                disclosureProjects.add(entProjDetailsDto);
            }
        } catch (SQLException e) {
            logger.error("Exception in getDisclEntProjDetails: {} ", e.getMessage());
            throw new ApplicationException("Exception in getDisclEntProjDetails", e, Constants.DB_PROC_ERROR);
        }
        return disclosureProjects;
    }

    @Override
    public CoiDisclosure isFCOIDisclosureExists(String personId, List<String> fcoiTypeCodes, String versionStatus) {
        try {
            StringBuilder hqlQuery = new StringBuilder();
            Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
            hqlQuery.append("SELECT d FROM CoiDisclosure d ");
            hqlQuery.append("WHERE d.fcoiTypeCode IN :fcoiTypeCodes AND ");
            hqlQuery.append("d.versionStatus = :versionStatus AND d.personId = :personId");
            Timestamp updateTimestamp = commonDao.getCurrentTimestamp();
            Query query = session.createQuery(hqlQuery.toString());
            query.setParameter("fcoiTypeCodes", fcoiTypeCodes);
            query.setParameter("versionStatus", versionStatus);
            query.setParameter("personId", personId);
            List<CoiDisclosure> disclData = query.getResultList();
            if (disclData != null && !disclData.isEmpty()) {
                return disclData.get(0);
            }
        } catch (Exception ex) {
            logger.error("Exception in isFCOIDisclosureExists", ex);
            exceptionService.saveErrorDetails(ex.getMessage(), ex,CoreConstants.JAVA_ERROR);
        }
        return null;
    }

    @Override
    public boolean evaluateDisclosureQuestionnaire(Integer moduleCode, Integer submoduleCode, String moduleItemKey) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        CallableStatement statement = null;
        try {
            String functionName = "FN_EVAL_DISCLOSURE_QUESTIONNAIRE";
            String functionCall = "{ ? = call " + functionName + "(?,?,?) }";
            statement = connection.prepareCall(functionCall);
            statement.registerOutParameter(1, OracleTypes.INTEGER);
            statement.setInt(2, moduleCode);
            statement.setInt(3, submoduleCode);
            statement.setString(4, moduleItemKey);
            statement.execute();
            int result = statement.getInt(1);
            if (result == 1) {
                return true;
            }
        } catch (SQLException e) {
            logger.error("Exception on evaluateDisclosureQuestionnaire {}", e.getMessage());
            throw new ApplicationException("error in evaluateDisclosureQuestionnaire", e, Constants.DB_FN_ERROR);
        }
        return false;
    }

    @Override
    public boolean isDisclEntProjConflictAdded(String projectConflictStatusCode, Integer coiDisclProjectEntityRelId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT case when (count(d.coiDisclProjectEntityRelId) > 0) then true else false end  ");
        hqlQuery.append("FROM CoiDisclProjectEntityRel d WHERE d.projectConflictStatusCode = :projectConflictStatusCode AND ");
        hqlQuery.append("d.coiDisclProjectEntityRelId = :coiDisclProjectEntityRelId");
        Timestamp updateTimestamp = commonDao.getCurrentTimestamp();
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("coiDisclProjectEntityRelId", coiDisclProjectEntityRelId);
        query.setParameter("projectConflictStatusCode", projectConflictStatusCode);
        return (boolean) query.getSingleResult();
    }

    @Override
    public CoiDisclProjectEntityRel getCoiDisclProjectEntityRelById(Integer coiDisclProjectEntityRelId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT d FROM CoiDisclProjectEntityRel d ");
        hqlQuery.append("WHERE d.coiDisclProjectEntityRelId = :coiDisclProjectEntityRelId ");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("coiDisclProjectEntityRelId", coiDisclProjectEntityRelId);
        List<CoiDisclProjectEntityRel> disclData = query.getResultList();
        if (!disclData.isEmpty()) {
            return disclData.get(0);
        }
        return null;
    }

    @Override
    public Timestamp updateCoiDisclEntProjDetails(String conflictStatusCode, Integer coiDisclProjectEntityRelId, String projectEngagementDetails) {
        Timestamp updateTimestamp = commonDao.getCurrentTimestamp();
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("UPDATE CoiDisclProjectEntityRel cd SET cd.projectConflictStatusCode = :projectConflictStatusCode, cd.projectEngagementDetails = :projectEngagementDetails, ");
        hqlQuery.append("cd.updateTimestamp = :updateTimestamp, ");
        hqlQuery.append("cd.updatedBy = :updatedBy where cd.coiDisclProjectEntityRelId = :coiDisclProjectEntityRelId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("coiDisclProjectEntityRelId", coiDisclProjectEntityRelId);
        query.setParameter("projectConflictStatusCode", conflictStatusCode);
        query.setParameter("projectEngagementDetails", projectEngagementDetails);
        query.setParameter("updateTimestamp", updateTimestamp);
        query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
        query.executeUpdate();
        return updateTimestamp;
    }

    @Override
    public List<CoiDisclProjectEntityRel> getProjectRelationshipByParam(Integer moduleCode, Integer moduleItemId, String loginPersonId, Integer disclosureId) {
        return hibernateTemplate.execute(session -> {
            StringBuilder hqlBuilder = new StringBuilder("SELECT DISTINCT dr FROM CoiDisclProjectEntityRel dr ");
            hqlBuilder.append("WHERE dr.coiDisclProject.coiDisclosure.personId = :loginPersonId ");
            hqlBuilder.append("AND dr.coiDisclProject.disclosureId = :disclosureId ");
            if (moduleCode != null && moduleItemId != null) {
                hqlBuilder.append("AND dr.coiDisclProject.moduleCode = :moduleCode ");
                hqlBuilder.append("AND dr.coiDisclProject.moduleItemKey = :moduleItemId ");
            }
            hqlBuilder.append("AND dr.personEntityId IS NOT NULL ");
            hqlBuilder.append("ORDER BY dr.updateTimestamp DESC");
            String hql = hqlBuilder.toString();
            org.hibernate.query.Query<CoiDisclProjectEntityRel> query = session.createQuery(hql, CoiDisclProjectEntityRel.class)
                    .setParameter("loginPersonId", loginPersonId)
                    .setParameter("disclosureId", disclosureId);
            if (moduleCode != null && moduleItemId != null) {
                query.setParameter("moduleCode", moduleCode)
                        .setParameter("moduleItemId", String.valueOf(moduleItemId));
            }
            return query.getResultList();
        });
    }

    @Override
    public Long getNumberOfSFIBasedOnDisclosureId(Integer disclosureId) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        StringBuilder hqlQuery = new StringBuilder();
        hqlQuery.append("SELECT COUNT(DISTINCT r.personEntityId) FROM CoiDisclProjectEntityRel r ");
        hqlQuery.append("WHERE r.coiDisclProject.disclosureId = :disclosureId ");
        Query query = session.createQuery(hqlQuery.toString(), Long.class);
        query.setParameter("disclosureId", disclosureId);
        Object countData = query.getSingleResult();
        if (countData != null) {
            return (Long) countData;
        }
        return null;
    }

    @Override
    public Map<String, Object> validateProjectDisclosure(String personId, Integer moduleCode, String moduleItemKey) {
        Map<String, Object> mapObj = new HashMap();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        CallableStatement statement = null;
        ResultSet rset = null;
        try {
            if (oracledb.equalsIgnoreCase("N")) {
                statement = connection.prepareCall("{call VALIDATE_PROJECT_DISCLOSURE(?,?,?)}");
                statement.setString(1, personId);
                if (moduleCode == null) {
                    statement.setNull(2, Types.INTEGER);
                } else {
                    statement.setInt(2, moduleCode);
                }
                if (moduleItemKey == null) {
                    statement.setNull(3, Types.VARCHAR);
                } else {
                    statement.setString(3, moduleItemKey);
                }
                statement.execute();
                rset = statement.getResultSet();
            } else if (oracledb.equalsIgnoreCase("Y")) {
                String functionCall = "{call VALIDATE_PROJECT_DISCLOSURE(?,?,?,?)}";
                statement = connection.prepareCall(functionCall);
                statement.registerOutParameter(1, OracleTypes.CURSOR);
                statement.setString(2, personId);
                statement.setInt(3, moduleCode);
                statement.setString(4, moduleItemKey);
                statement.execute();
                rset = (ResultSet) statement.getObject(1);
            }
            while (rset.next()) {
                mapObj.put("isExpired", rset.getBoolean("isExpired"));
                mapObj.put("projectDisclosure", rset.getInt("projectDisclosure") == 0 ? null : rset.getInt("projectDisclosure"));
                mapObj.put("fcoiDisclosure", rset.getInt("fcoiDisclosure") == 0 ? null : rset.getInt("fcoiDisclosure"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            logger.error("Exception on validateProjectDisclosure {}", e.getMessage());
            throw new ApplicationException("Unable to fetch disclosure", e, Constants.JAVA_ERROR);
        }
        return mapObj;
    }

    @Override
    public void saveOrUpdateCoiDisclProjects(CoiDisclProjects coiDisclProjects) {
        hibernateTemplate.saveOrUpdate(coiDisclProjects);
    }

    @Override
    public List<CoiDisclProjects> syncFcoiDisclosureProjects(Integer disclosureId, Integer disclosureNumber, String loginPersonId) {
        List<CoiDisclProjects> coiDisclProjects = new ArrayList<>();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        CallableStatement statement = null;
        ResultSet rset = null;
        try {
            if (oracledb.equalsIgnoreCase("N")) {
                statement = connection.prepareCall("{call COI_SYNC_INSERT_DISCL_PROJECTS(?,?,?)}");
                statement.setInt(1, disclosureId);
                statement.setInt(2, disclosureNumber);
                statement.setString(3, loginPersonId);
                statement.execute();
                rset = statement.getResultSet();
            } else if (oracledb.equalsIgnoreCase("Y")) {
                String functionCall = "{call COI_SYNC_INSERT_DISCL_PROJECTS(?,?,?,?)}";
                statement = connection.prepareCall(functionCall);
                statement.registerOutParameter(1, OracleTypes.CURSOR);
                statement.setInt(2, disclosureId);
                statement.setInt(3, disclosureNumber);
                statement.setString(4, loginPersonId);
                statement.execute();
                rset = (ResultSet) statement.getObject(1);
            }

            while (rset.next()) {
                CoiDisclProjects disclProject = CoiDisclProjects.builder()
                        .coiDisclProjectId(rset.getInt("COI_DISCL_PROJECTS_ID"))
                        .moduleCode(rset.getInt("MODULE_CODE"))
                        .moduleItemKey(rset.getString("MODULE_ITEM_KEY"))
                        .build();
                coiDisclProjects.add(disclProject);
            }
            return coiDisclProjects;
        } catch (Exception e) {
            e.printStackTrace();
            logger.error("Exception on syncFcoiDisclosureProjects {}", e.getMessage());
            throw new ApplicationException("Exception on syncFcoiDisclosureProjects", e, Constants.DB_PROC_ERROR);
        }
    }

    @Override
    public List<SFIJsonDetailsDto> getPersonEntitiesByPersonId(String personId, String engagementTypesNeeded) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        StringBuilder hqlQuery = new StringBuilder();
        hqlQuery.append("SELECT DISTINCT new com.polus.fibicomp.fcoiDisclosure.dto.SFIJsonDetailsDto(");
        hqlQuery.append("pe.personEntityId, pe.personEntityNumber, pe.entityId) ");
        hqlQuery.append("FROM PersonEntity pe ");
        hqlQuery.append("JOIN PersonEntityRelationship er ON er.personEntityId = pe.personEntityId ");
        hqlQuery.append("JOIN ValidPersonEntityRelType vp ON vp.validPersonEntityRelTypeCode = er.validPersonEntityRelTypeCode ");
        hqlQuery.append("WHERE pe.personId = :personId ");
        hqlQuery.append("AND pe.versionStatus = :versionStatus ");
        if (Constants.ALL_FINANCIAL_ENGAGEMENT.equalsIgnoreCase(engagementTypesNeeded)) {
            hqlQuery.append("AND vp.disclosureTypeCode = '1' ");
        } else if (Constants.ALL_SFI_ENGAGEMENT.equalsIgnoreCase(engagementTypesNeeded)) {
            hqlQuery.append("AND pe.isSignificantFinInterest = true ");
        }
        TypedQuery<SFIJsonDetailsDto> query = session.createQuery(hqlQuery.toString(), SFIJsonDetailsDto.class);
        query.setParameter("personId", personId);
        query.setParameter("versionStatus", "ACTIVE");
        return query.getResultList();
    }

    @Override
    public void syncFcoiDisclProjectsAndEntities(Integer disclosureId, Integer disclosureNumber, Integer coiDisclProjectId, Integer moduleCode,
                                                 String moduleItemKey, String sfiJsonArray, String loginPersonId) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        CallableStatement statement = null;
//        ResultSet rset = null;
        try {
            if (oracledb.equalsIgnoreCase("N")) {
                statement = connection.prepareCall("{call COI_DISCL_PROJ_ENTITY_INSERTION(?,?,?,?,?,?,?,?)}");
                statement.setInt(1, coiDisclProjectId);
                statement.setInt(2, disclosureId);
                statement.setInt(3, disclosureNumber);
                statement.setInt(4, moduleCode);
                statement.setString(5, moduleItemKey);
                statement.setString(6, loginPersonId);
                statement.setString(7, loginPersonId);
                statement.setString(8, sfiJsonArray);
                statement.setString(8, sfiJsonArray);
            } else if (oracledb.equalsIgnoreCase("Y")) {
                String functionCall = "{call COI_DISCL_PROJ_ENTITY_INSERTION(?,?,?,?,?,?,?,?,?)}";
                statement = connection.prepareCall(functionCall);
                statement.registerOutParameter(1, OracleTypes.CURSOR);
                statement.setInt(2, coiDisclProjectId);
                statement.setInt(3, disclosureId);
                statement.setInt(4, disclosureNumber);
                statement.setInt(5, moduleCode);
                statement.setString(6, moduleItemKey);
                statement.setString(7, loginPersonId);
                statement.setString(8, loginPersonId);
                statement.setString(9, sfiJsonArray);
                statement.setString(10, sfiJsonArray);
            }

            Objects.requireNonNull(statement).execute();
            session.flush();
        } catch (Exception e) {
            logger.error("Exception on syncFcoiDisclProjectsAndEntities for coiDisclProjectId : {} | {}", coiDisclProjectId, e.getMessage());
            exceptionService.saveErrorDetails(e.getMessage(), e,CoreConstants.JAVA_ERROR);
        }
    }

    @Override
    public boolean isAdminPersonOrGroupAdded(Integer disclosureId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT case when (count(c.disclosureId) > 0) then false else true end ");
        hqlQuery.append("FROM CoiDisclosure c WHERE  c.adminPersonId is null AND c.adminGroupId is null ");
        hqlQuery.append("AND c.disclosureId = :disclosureId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("disclosureId", disclosureId);
        return (boolean) query.getSingleResult();
    }

    @Override
    public boolean isSameAdminPersonOrGroupAdded(Integer adminGroupId, String adminPersonId, Integer disclosureId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT case when (count(c.disclosureId) > 0) then true else false end ");
        hqlQuery.append("FROM CoiDisclosure c WHERE  c.adminPersonId = :adminPersonId ");
        if (adminGroupId != null)
            hqlQuery.append("AND c.adminGroupId = :adminGroupId ");
        hqlQuery.append("AND c.disclosureId = : disclosureId");
        Query query = session.createQuery(hqlQuery.toString());
        if (adminGroupId != null)
            query.setParameter("adminGroupId", adminGroupId);
        query.setParameter("adminPersonId", adminPersonId);
        query.setParameter("disclosureId", disclosureId);
        return (boolean) query.getSingleResult();
    }

    @Override
    public Timestamp assignDisclosureAdmin(Integer adminGroupId, String adminPersonId, Integer disclosureId) {
        Timestamp updateTimestamp = commonDao.getCurrentTimestamp();
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("UPDATE CoiDisclosure c SET c.adminGroupId = :adminGroupId , c.adminPersonId = :adminPersonId, ");
        hqlQuery.append("c.updateTimestamp = :updateTimestamp, c.updatedBy = :updatedBy ");
        hqlQuery.append("WHERE c.disclosureId = : disclosureId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("adminGroupId", adminGroupId);
        query.setParameter("adminPersonId", adminPersonId);
        query.setParameter("disclosureId", disclosureId);
        query.setParameter("updateTimestamp", updateTimestamp);
        query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
        query.executeUpdate();
        return updateTimestamp;
    }

    @Override
    public void syncFCOIDisclosure(Integer disclosureId, Integer disclosureNumber) {
        Session session = Objects.requireNonNull(hibernateTemplate.getSessionFactory()).getCurrentSession();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        try {
            CallableStatement statement = connection.prepareCall("{call COI_SYNC_FCOI_DISCLOSURE(?,?,?)}");
            statement.setInt(1, disclosureId);
            statement.setInt(2, disclosureNumber);
            statement.setString(3, AuthenticatedUser.getLoginPersonId());
            statement.execute();
            DisclosureActionLogDto actionLogDto = DisclosureActionLogDto.builder().actionTypeCode(Constants.COI_DIS_ACTION_LOG_DISCLOSURE_SYNCED)
                    .disclosureId(disclosureId).disclosureNumber(disclosureNumber)
                    .reporter(AuthenticatedUser.getLoginUserFullName())
                    .build();
            actionLogService.saveDisclosureActionLog(actionLogDto);
        } catch (Exception e) {
            logger.error("Exception in syncFCOIDisclosure {}", e.getMessage());
            exceptionService.saveErrorDetails(e.getMessage(), e,CoreConstants.JAVA_ERROR);
        }
    }

    @Override
	public List<COIValidateDto> evaluateValidation(CoiDisclosureDto coiDisclosureDto) {
		List<COIValidateDto> coiValidateDtos = new ArrayList<>();
		List<COIValidateDataDto> validateDataDtos = new ArrayList<>();

		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();

		session.doWork(connection -> {
			try {
				List<WorkFlowResultDto> resultDtos = evaluateValidationRule(coiDisclosureDto);

				if (resultDtos != null && !resultDtos.isEmpty()) {
					for (WorkFlowResultDto dto : resultDtos) {
						String validationMessage = dto.getValidationMessage();
						String validationType = dto.getValidationType();
						logger.info("validationMessage : {}", validationMessage);
						logger.info("validationType : {}", validationType);
						Matcher matcher = PATTERN.matcher(validationMessage);

						COIValidateDataDto validateDataDto = new COIValidateDataDto();
						validateDataDto.setVALIDATION_TYPE(validationType);

						if (matcher.matches()) {
							String validationMsgType = matcher.group(1).trim();
							logger.info("validationMsgType : {}", validationMsgType);
							validationMessage = matcher.group(2).trim();
							validateDataDto.setMESSAGE(validationMessage);
							validateDataDto.setVALIDATION_MSG_TYPE(validationMsgType);

							try (CallableStatement statement = connection.prepareCall("{call COI_EVALUATE_VALIDATION_MESSAGE(?,?,?,?)}")) {
								statement.setInt(1, coiDisclosureDto.getDisclosureId());
								statement.setString(2, coiDisclosureDto.getLogginPersonId());
								statement.setString(3, validationType);
								statement.setString(4, validationMsgType);
								statement.execute();

								try (ResultSet resultSet = statement.getResultSet()) {
									List<String> sfiBuilder = new ArrayList<>();
									List<String> projSfiDetailsBuilder = new ArrayList<>();

									while (resultSet.next()) {
										String sfi = resultSet.getString("SFIs");
										String projSfiDetails = resultSet.getString("PROJ_SFI_DETAILS");

										sfiBuilder.add(sfi);
										projSfiDetailsBuilder.add(projSfiDetails);
									}

									validateDataDto.setSFIs(sfiBuilder);
									validateDataDto.setPROJ_SFI_DETAILS(projSfiDetailsBuilder);
								}
							}
						} else {
							validateDataDto.setMESSAGE(validationMessage);
						}
						validateDataDtos.add(validateDataDto);
					}

					Map<String, List<COIValidateDataDto>> groupedValidation = validateDataDtos.stream().filter(
							o -> o.getVALIDATION_MSG_TYPE() != null && !o.getVALIDATION_MSG_TYPE().equals(Constants.COI_VALIDATION_PRO_SFI_ACTION_TYPE))
							.collect(Collectors.groupingBy(COIValidateDataDto::getMESSAGE, Collectors.toList()));

					groupedValidation.forEach((message, dataList) -> {
						dataList.forEach(data -> {
							COIValidateDto coiValidateDto = new COIValidateDto();
							coiValidateDto.setValidationMessage(data.getMESSAGE());
							coiValidateDto.setValidationType(data.getVALIDATION_TYPE());
							coiValidateDto.setSfiList(data.getSFIs() != null ? data.getSFIs() : new ArrayList<>());
							coiValidateDtos.add(coiValidateDto);
						});
					});

					Map<String, List<COIValidateDataDto>> groupedValidationPS = validateDataDtos.stream().filter(
							o -> o.getVALIDATION_MSG_TYPE() != null && o.getVALIDATION_MSG_TYPE().equals(Constants.COI_VALIDATION_PRO_SFI_ACTION_TYPE))
							.collect(Collectors.groupingBy(COIValidateDataDto::getMESSAGE, Collectors.toList()));

					groupedValidationPS.forEach((message, dataList) -> {
						COIValidateDto coiValidateDto = new COIValidateDto();
						coiValidateDto.setValidationMessage(message);
						coiValidateDto.setValidationType(dataList.get(0).getVALIDATION_TYPE());

						List<List<Map<String, String>>> projectSfiListMaps = dataList.stream()
								.flatMap(item -> item.getPROJ_SFI_DETAILS().stream()).map(detail -> {
									Map<String, String> detailMap = Arrays.stream(detail.split("\\|\\|"))
											.map(part -> part.split("::", 2)).filter(pair -> pair.length == 2)
											.collect(Collectors.toMap(pair -> pair[0].trim(), pair -> pair[1].trim(),
													(existing, replacement) -> existing, // Handle duplicate keys
													LinkedHashMap::new // Preserve order
									));
									return detailMap;
								}).collect(Collectors.groupingBy(map -> map.get("ModuleItemKey"))).values().stream()
								.collect(Collectors.toList());

						coiValidateDto.setProjectSfiList(projectSfiListMaps);
						coiValidateDto.setSfiList(new ArrayList<>());
						coiValidateDtos.add(coiValidateDto);
					});
				}
			} catch (SQLException e) {
				logger.error("SQL Exception during evaluateValidation: {}", e.getMessage(), e);
				throw new ApplicationException("Database error in evaluateValidation", e, Constants.DB_PROC_ERROR);
			} catch (Exception e) {
				logger.error("Unexpected error during evaluateValidation: {}", e.getMessage(), e);
				throw new ApplicationException("Unexpected error in evaluateValidation", e, Constants.JAVA_ERROR);
			}
		});

		return coiValidateDtos;
	}

    private List<WorkFlowResultDto> evaluateValidationRule(CoiDisclosureDto coiDisclosureDto) {
    	EvaluateValidationRuleVO evaluateValidationRuleVO = new EvaluateValidationRuleVO();
		evaluateValidationRuleVO.setLogginPersonId(coiDisclosureDto.getLogginPersonId());
		evaluateValidationRuleVO.setUpdateUser(coiDisclosureDto.getUpdateUser());
		evaluateValidationRuleVO.setModuleCode(coiDisclosureDto.getModuleCode());
		evaluateValidationRuleVO.setSubModuleCode(coiDisclosureDto.getSubModuleCode());
		evaluateValidationRuleVO.setModuleItemKey(coiDisclosureDto.getModuleItemKey());
		evaluateValidationRuleVO.setSubModuleItemKey(coiDisclosureDto.getSubModuleItemKey());

    	return businessRuleDao.evaluateValidationRule(evaluateValidationRuleVO);
    }

    @Override
    public boolean isProjectSFISyncNeeded(Integer disclosureId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT c.syncNeeded ");
        hqlQuery.append("FROM CoiDisclosure c WHERE  c.disclosureId = :disclosureId ");
        org.hibernate.Query<Boolean> query = session.createQuery(hqlQuery.toString());
        query.setParameter("disclosureId", disclosureId);
        return query.getSingleResult();
    }

    @Override
    public void updateDisclosureSyncNeeded(Integer disclosureId, boolean syncNeeded) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("UPDATE CoiDisclosure c SET c.syncNeeded = :syncNeeded ");
        hqlQuery.append("WHERE  c.disclosureId = :disclosureId ");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("disclosureId", disclosureId);
        query.setParameter("syncNeeded", syncNeeded);
        query.executeUpdate();
    }

    @Override
    public void updateDisclosureSyncNeededByPerEntId(Integer personEntityId, boolean syncNeeded) {
            StringBuilder hqlQuery = new StringBuilder();
            Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
            hqlQuery.append("UPDATE COI_DISCLOSURE d ");
            hqlQuery.append("INNER JOIN PERSON_ENTITY pe ON pe.PERSON_ID = d.PERSON_ID ");
            hqlQuery.append("SET d.SYNC_NEEDED = :syncNeeded ");
            hqlQuery.append("WHERE pe.PERSON_ENTITY_ID = :personEntityId ");
            hqlQuery.append("AND d.REVIEW_STATUS_CODE IN (1, 5, 6) ");
            Query query = session.createNativeQuery(hqlQuery.toString());
            query.setParameter("personEntityId", personEntityId);
            String status = syncNeeded ? "Y" : "N";
            query.setParameter("syncNeeded", status);
            query.executeUpdate();
    }

    @Override
    public void updateFcoiDisclSyncNeedStatus(DisclosureProjectDto projectDto) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        CallableStatement statement = null;
        try {
            if (oracledb.equalsIgnoreCase("N")) {
                statement = connection.prepareCall("{call COI_SYNC_UPDATE_DISCL_INTEG_UPDATES(?,?)}");
                statement.setInt(1, projectDto.getModuleCode());
                statement.setString(2, projectDto.getProjectId());
            } else if (oracledb.equalsIgnoreCase("Y")) {
                String functionCall = "{call COI_SYNC_UPDATE_DISCL_INTEG_UPDATES(?,?,?)}";
                statement = connection.prepareCall(functionCall);
                statement.registerOutParameter(1, OracleTypes.CURSOR);
                statement.setInt(2, projectDto.getModuleCode());
                statement.setString(3, projectDto.getProjectId());
            }
            Objects.requireNonNull(statement).execute();
        } catch (Exception e) {
            logger.error("Exception on updateFcoiDisclSyncNeedStatus : {} | {} | {}", projectDto.getModuleCode(),projectDto.getProjectId(), e.getMessage());
            throw new ApplicationException("Unable to fetch disclosure", e, Constants.DB_PROC_ERROR);
        }
    }

    @Override
    public DisclComment saveOrUpdateDisclComment(DisclComment disclComment) {
        hibernateTemplate.getSessionFactory().getCurrentSession();
        hibernateTemplate.saveOrUpdate(disclComment);
        hibernateTemplate.flush();
        return disclComment;
    }

    @Override
    public void detachFcoiDisclProject(DisclosureProjectDto projectDto) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        CallableStatement statement = null;
        try {
            if (oracledb.equalsIgnoreCase("N")) {
                statement = connection.prepareCall("{call COI_SYNC_REMOVE_DEACTIVATED_PROJECTS(?,?)}");
                statement.setInt(1, projectDto.getModuleCode());
                statement.setString(2, projectDto.getProjectNumber());
            } else if (oracledb.equalsIgnoreCase("Y")) {
                String functionCall = "{call COI_SYNC_REMOVE_DEACTIVATED_PROJECTS(?,?,?)}";
                statement = connection.prepareCall(functionCall);
                statement.registerOutParameter(1, OracleTypes.CURSOR);
                statement.setInt(2, projectDto.getModuleCode());
                statement.setString(3, projectDto.getProjectNumber());
            }
            Objects.requireNonNull(statement).execute();
        } catch (Exception e) {
            logger.error("Exception on detachFcoiDisclProject : {} | {} | {}", projectDto.getModuleCode(),projectDto.getProjectNumber(), e.getMessage());
            throw new ApplicationException("Unable to fetch disclosure", e, Constants.DB_PROC_ERROR);
        }
    }

    @Override
    public List<MakeVoidDto> makeDisclosureVoid(IntegrationRequestDto integrationRequestDto) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        CallableStatement statement = null;
        try {
        	List<MakeVoidDto> makeVoidDto = new ArrayList<>();
            if (oracledb.equalsIgnoreCase("N")) {
                statement = connection.prepareCall("{call COI_DISCL_VOID_DEACTIVATED_PROJECT(?,?,?,?,?)}");
                statement.setInt(1, integrationRequestDto.getModuleCode());
                statement.setString(2, integrationRequestDto.getModuleItemKey());
                statement.setString(3, integrationRequestDto.getPersonId());
                statement.setString(4, integrationRequestDto.getRemark());
                statement.setString(5, integrationRequestDto.getActionType());
            } else if (oracledb.equalsIgnoreCase("Y")) {
                String functionCall = "{call COI_DISCL_VOID_DEACTIVATED_PROJECT(?,?,?,?,?,?)}";
                statement = connection.prepareCall(functionCall);
                statement.registerOutParameter(1, OracleTypes.CURSOR);
                statement.setInt(2, integrationRequestDto.getModuleCode());
                statement.setString(3, integrationRequestDto.getModuleItemKey());
                statement.setString(4, integrationRequestDto.getPersonId());
                statement.setString(5, integrationRequestDto.getRemark());
                statement.setString(6, integrationRequestDto.getActionType());
            }
            Boolean hasResult = statement.execute();
            if (hasResult) {
                try (ResultSet rs = statement.getResultSet()) {
                    while (rs.next()) {
                    	MakeVoidDto dto = MakeVoidDto.builder()
                    	        .disclosureId(rs.getInt("DISCLOSURE_ID"))
                    	        .disclosureNumber(rs.getString("DISCLOSURE_NUMBER"))
                    	        .coiProjectType(rs.getString("COI_PROJECT_TYPE"))
                    	        .projectTitle(rs.getString("PROJECT_TITLE"))
                    	        .projectNumber(rs.getString("PROJECT_NUMBER"))
                    	        .reporterId(rs.getString("PERSON_ID"))
                    	        .reporterName(rs.getString("FULL_NAME"))
                    	        .build();
                    	makeVoidDto.add(dto);
                    }
                }
            }
            return makeVoidDto;
        } catch (Exception e) {
            logger.error("Exception on makeDisclosureVoid : {} | {} | {}", integrationRequestDto.getModuleCode(),integrationRequestDto.getModuleItemKey(), e.getMessage());
            throw new ApplicationException("Unable to make the disclosure void", e, Constants.DB_PROC_ERROR);
        }
    }

    @Override
    public boolean isDisclDispositionInStatus(String dispositionStatusCode, Integer disclosureId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT case when (count(c.disclosureId) > 0) then true else false end ");
        hqlQuery.append("FROM CoiDisclosure c WHERE  c.dispositionStatusCode = :dispositionStatusCode ");
        hqlQuery.append("AND c.disclosureId = : disclosureId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("dispositionStatusCode", dispositionStatusCode);
        query.setParameter("disclosureId", disclosureId);
        return (boolean) query.getSingleResult();
    }


    @Override
    public void generateProjectSnapshot(Integer disclosureId, String personId) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        CallableStatement statement = null;
        try {
            if (oracledb.equalsIgnoreCase("N")) {
                statement = connection.prepareCall("{call COI_DISCL_GENERATE_JSON_PROJECT_SNAPSHOT(?,?)}");
                statement.setInt(1, disclosureId);
                statement.setString(2, personId);
            } else if (oracledb.equalsIgnoreCase("Y")) {
                String functionCall = "{call COI_DISCL_GENERATE_JSON_PROJECT_SNAPSHOT(?,?,?)}";
                statement = connection.prepareCall(functionCall);
                statement.registerOutParameter(1, OracleTypes.CURSOR);
                statement.setInt(2, disclosureId);
                statement.setString(3, personId);
            }
            Objects.requireNonNull(statement).execute();
        } catch (Exception e) {
            logger.error("Exception on generateProjectSnapshot : {}", e.getMessage());
            exceptionService.saveErrorDetails(e.getMessage(), e,CoreConstants.JAVA_ERROR);
//            throw new ApplicationException("Unable to generate project snapshot!", e, Constants.DB_PROC_ERROR);
        }
    }


    @Override
    public List<CoiDisclProjects> getCoiDisclProjects(Integer disclosureId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT c FROM CoiDisclProjects c ");
        hqlQuery.append("WHERE c.disclosureId = : disclosureId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("disclosureId", disclosureId);
        return query.getResultList();
    }

    @Override
    public List<CoiProjectType> getCoiProjectTypes() {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT c FROM CoiProjectType c ");
        Query query = session.createQuery(hqlQuery.toString());
        return query.getResultList();
    }

    @Override
    public String getDisclosureFcoiTypeCode(Integer disclosureId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT c.fcoiTypeCode FROM CoiDisclosure c ");
        hqlQuery.append("WHERE c.disclosureId = : disclosureId");
        TypedQuery<String> query = session.createQuery(hqlQuery.toString(), String.class);
        query.setParameter("disclosureId", disclosureId);
        return query.getSingleResult();
    }

	@Override
	public Boolean canNotifyUserForCreateAwardDisclosure(String personId, Integer moduleCode, Integer subModuleCode, String moduleItemKey, String subModuleItemKey) {
	    Long count = hibernateTemplate.execute(session -> {
	        String sql = "{ ? = call FN_CAN_NOTIFY_FOR_CREATE_AWD_DISCL(?, ?, ?, ?, ?) }";
	        return session.doReturningWork(connection -> {
	            try (CallableStatement callableStatement = connection.prepareCall(sql)) {
	                callableStatement.registerOutParameter(1, Types.BIGINT);
	                callableStatement.setString(2, personId);
	                callableStatement.setInt(3, moduleCode);
	                callableStatement.setInt(4, subModuleCode);
	                callableStatement.setString(5, moduleItemKey);
	                callableStatement.setString(6, subModuleItemKey);
	                callableStatement.execute();
	                return callableStatement.getLong(1);
	            }
	        });
	    });
	    return count != null && count > 0;
	}

	@Override
	public IntegrationNotificationRequestDto getAwardForNotifyDisclosureCreation(IntegrationNotificationRequestDto vo, String personId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        CallableStatement statement = null;
        try {
            if (oracledb.equalsIgnoreCase("N")) {
                statement = connection.prepareCall("{call GET_AWD_FOR_NOTIFY_DISCL_CREATION(?,?)}");
                statement.setString(1, personId);
                statement.setString(2, vo.getModuleItemKey());
            } else if (oracledb.equalsIgnoreCase("Y")) {
                String functionCall = "{call GET_AWD_FOR_NOTIFY_DISCL_CREATION(?,?,?)}";
                statement = connection.prepareCall(functionCall);
                statement.registerOutParameter(1, OracleTypes.CURSOR);
                statement.setString(2, personId);
                statement.setString(3, vo.getModuleItemKey());
            }
            Objects.requireNonNull(statement).execute();
            ResultSet resultSet = statement.getResultSet();
            if (resultSet != null && resultSet.next()) {
                vo.setModuleItemKey(resultSet.getString("PROJECT_NUMBER"));
                vo.setTitle(resultSet.getString("TITLE"));
                vo.setModuleItemId(resultSet.getInt("PROJECT_ID"));
                vo.setUnitNumber(resultSet.getString("LEAD_UNIT_NUMBER"));
                vo.setUnitName(resultSet.getString("LEAD_UNIT_NAME"));
                vo.setProjectType(resultSet.getString("PROJECT_TYPE"));
                vo.setProjectStatus(resultSet.getString("PROJECT_STATUS"));
            }
        } catch (Exception e) {
        	logger.error("Error executing stored procedure: GET_AWD_FOR_NOTIFY_DISCL_CREATION {}", e.getMessage());
			throw new ApplicationException("Error executing stored procedure: GET_AWD_FOR_NOTIFY_DISCL_CREATION", e, Constants.DB_PROC_ERROR);
        }
		return vo;
	}

	@Override
	public List<Map<Integer, String>> getExpiredFcoiDisclosures(Integer daysToDueDate) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<Tuple> query = builder.createTupleQuery();
		Root<CoiDisclosure> root = query.from(CoiDisclosure.class);

		query.multiselect(root.get(DISCLOSURE_ID).alias(DISCLOSURE_ID), root.get(PERSON_ID).alias(PERSON_ID));

		Subquery<Integer> subquery = query.subquery(Integer.class);
		Root<CoiDisclosure> subRoot = subquery.from(CoiDisclosure.class);
		subquery.select(builder.max(subRoot.get("versionNumber")))
				.where(builder.equal(subRoot.get(DISCLOSURE_ID), root.get(DISCLOSURE_ID)));

		Predicate expirationPredicate = null;
		if (daysToDueDate != null) {
			LocalDate expirationDate = LocalDate.now().plusDays(daysToDueDate);
			expirationPredicate = builder.equal(root.get("expirationDate"), expirationDate);
		} else {
			expirationPredicate = builder.lessThan(root.get("expirationDate"), builder.currentDate());
		}

		Predicate fcoiTypePredicate = builder.or(builder.equal(root.get("fcoiTypeCode"), 1),
				builder.equal(root.get("fcoiTypeCode"), 3));

		Predicate latestVersionPredicate = builder.equal(root.get("versionNumber"), subquery);

		query.where(builder.and(expirationPredicate, fcoiTypePredicate, latestVersionPredicate));

		List<Tuple> results = session.createQuery(query).getResultList();
		List<Map<Integer, String>> disclosureList = new ArrayList<>();

		for (Tuple tuple : results) {
			Map<Integer, String> disclosureMap = new HashMap<>();
			disclosureMap.put(tuple.get(DISCLOSURE_ID, Integer.class), tuple.get(PERSON_ID, String.class));
			disclosureList.add(disclosureMap);
		}

		return disclosureList;
	}

	@Override
	public CoiDisclosure getPreviousDisclosureVersion(Integer disclosureNumber, Integer versionNumber) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<CoiDisclosure> previousDisclosureQuery = builder.createQuery(CoiDisclosure.class);
		Root<CoiDisclosure> previousRoot = previousDisclosureQuery.from(CoiDisclosure.class);
		previousDisclosureQuery.select(previousRoot)
		    .where(
		        builder.equal(previousRoot.get("disclosureNumber"), disclosureNumber),
		        builder.equal(previousRoot.get("versionNumber"), versionNumber - 1)
		    );
		CoiDisclosure previousDisclosure = session.createQuery(previousDisclosureQuery).getSingleResult();
		return previousDisclosure;
	}

	@Override
	public List<String> getExpiredInboxFcoiDisclosureIds() {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<String> query = builder.createQuery(String.class);
		Root<Inbox> root = query.from(Inbox.class);
		query.select(root.get("moduleItemKey"));
		query.where(
				builder.equal(root.get("moduleCode"), CoreConstants.COI_MODULE_CODE),
				builder.equal(root.get("messageTypeCode"), Constants.INBOX_REVISE_FCOI_DISCLOSURE)
        );
		return session.createQuery(query).getResultList();
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<String> markReadMessageForDisclosureCreation(String moduleItemKey, String personId, String messageTypeCode, String fcoiTypeCode) {
	    Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
	    String modulePrefix = StringUtils.substringBefore(moduleItemKey, "-");
	    StringBuilder sqlQuery = new StringBuilder()
	            .append("SELECT T1.MODULE_ITEM_KEY FROM INBOX T1 ")
	            .append("INNER JOIN COI_INT_STAGE_AWARD T2 ON T2.PROJECT_NUMBER = T1.MODULE_ITEM_KEY ")
	            .append("WHERE T1.TO_PERSON_ID = :personId ")
	            .append("AND T1.MODULE_CODE = :moduleCode ")
	            .append("AND T1.SUB_MODULE_CODE = :subModuleCode ")
	            .append("AND T1.SUB_MODULE_ITEM_KEY = :subModuleItemKey ")
	            .append("AND T1.OPENED_FLAG = 'N' ")
	            .append("AND SUBSTRING(T1.MODULE_ITEM_KEY, 1, LOCATE('-', T1.MODULE_ITEM_KEY) - 1) = :modulePrefix");
	    if (Constants.FCOI_TYPE_CODE_PROJECT.equals(fcoiTypeCode)) {
	        sqlQuery.append(" AND T2.DISCLOSURE_VALIDATION_FLAG <> 'SELF'");  
	    }
	    Query query = session.createNativeQuery(sqlQuery.toString());
	    query.setParameter("personId", personId);
	    query.setParameter("moduleCode", Constants.COI_MODULE_CODE);
	    query.setParameter("subModuleCode", Constants.COI_SUBMODULE_CODE);
	    query.setParameter("subModuleItemKey", CoreConstants.SUBMODULE_ITEM_KEY);
	    query.setParameter("modulePrefix", modulePrefix);
	    return query.getResultList();
	}

    @SuppressWarnings("unchecked")
	@Override
    public List<String> getProjectNumbersBasedOnParam(Integer disclosureId, String loginPersonId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT c.moduleItemKey FROM CoiDisclosure d ")
                .append("INNER JOIN CoiDisclProjects c ON c.disclosureId = d.disclosureId ")
                .append("WHERE c.disclosureId = :disclosureId and c.moduleCode = 1 ")
                .append("AND d.personId = :loginPersonId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("disclosureId", disclosureId);
        query.setParameter("loginPersonId", loginPersonId);
        return query.getResultList();
    }

    @Override
    public void updateRequestForWithdrawal(Integer disclosureId, Boolean withdrawalRequested, String comment) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("UPDATE CoiDisclosure d ");
        hqlQuery.append("SET d.withdrawalRequested = :withdrawalRequested, ");
        hqlQuery.append("d.withdrawalRequestReason = :withdrawalRequestReason, ");
        hqlQuery.append("d.updateTimestamp = :updateTimestamp, ");
        hqlQuery.append("d.updatedBy = :updatedBy ");
        hqlQuery.append("WHERE d.disclosureId = :disclosureId ");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("withdrawalRequested", withdrawalRequested);
        query.setParameter("withdrawalRequestReason", comment);
        query.setParameter("disclosureId", disclosureId);
        query.setParameter("updateTimestamp", commonDao.getCurrentTimestamp());
        query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
        query.executeUpdate();
    }

    @Override
    public boolean isDisclRequestedWithdrawal(Integer disclosureId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT case when (count(d.disclosureId) > 0) then true else false end  ");
        hqlQuery.append("FROM CoiDisclosure d WHERE d.withdrawalRequested = :withdrawalRequested AND ");
        hqlQuery.append("d.disclosureId = :disclosureId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("disclosureId", disclosureId);
        query.setParameter("withdrawalRequested", true);
        return (boolean) query.getSingleResult();
    }

    @Override
 	public CoiDisclosure getLatestDisclosure(String personId, List<String> fcoiTypeCode, String projectNumber) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();

		if (projectNumber != null && !projectNumber.isEmpty()) {
			hqlQuery.append("SELECT d FROM CoiDisclosure d ")
					.append("INNER JOIN CoiDisclProjects p ON d.disclosureId = p.disclosureId ")
					.append("WHERE d.personId = :personId ")
					.append("AND p.moduleItemKey = :projectNumber ")
					.append("AND d.fcoiTypeCode IN :fcoiTypeCodes ")
					.append("AND d.dispositionStatusCode != 2 ");
		} else {
			hqlQuery.append("SELECT d FROM CoiDisclosure d ")
					.append("WHERE d.personId = :personId ")
					.append("AND d.fcoiTypeCode IN :fcoiTypeCodes ")
					.append("AND d.dispositionStatusCode != 2 ");
		}

		hqlQuery.append("ORDER BY d.versionNumber DESC");

		TypedQuery<CoiDisclosure> query = session.createQuery(hqlQuery.toString(), CoiDisclosure.class);
		query.setParameter("personId", personId);
		query.setParameter("fcoiTypeCodes", fcoiTypeCode);

		if (projectNumber != null && !projectNumber.isEmpty()) {
			query.setParameter("projectNumber", projectNumber);
		}

		query.setMaxResults(1);
		return query.getResultStream().findFirst().orElse(null);
	}

    @Override
    public Boolean checkIfNewEngagementCreated(String personId, String engagementTypesNeeded) {
		StringBuilder sqlQuery = new StringBuilder();
		sqlQuery.append("SELECT COUNT(d.person_entity_id) ")
				.append("FROM person_entity d ")
				.append("INNER JOIN person_entity_relationship entityRel ON entityRel.person_entity_id = d.person_entity_id ")
				.append("WHERE d.person_id = :personId ");
		if (engagementTypesNeeded != null && !engagementTypesNeeded.isBlank() && !Constants.ALL_ENGAGEMENT.equals(engagementTypesNeeded)) {
			if (Constants.ALL_FINANCIAL_ENGAGEMENT.equalsIgnoreCase(engagementTypesNeeded)) {
				sqlQuery.append("AND entityRel.VALID_PERS_ENTITY_REL_TYP_CODE IN (:validTypeCodes) ");
	        } else if (Constants.ALL_SFI_ENGAGEMENT.equalsIgnoreCase(engagementTypesNeeded)) {
	        	sqlQuery.append("AND d.IS_SIGNIFICANT_FIN_INTEREST = 'Y' ");
	        } 
		}
        sqlQuery.append("AND d.version_number = ( ")
            	.append("SELECT MAX(d2.version_number) FROM person_entity d2 ")
            	.append("WHERE d2.version_status = 'ACTIVE' ")
            	.append("AND d2.person_id = :personId ")
	            .append("AND d2.person_entity_id = d.person_entity_id) ")
	            .append("AND NOT EXISTS ( ")
	            .append("SELECT 1 FROM coi_discl_person_entity_rel rel2 ")
	            .append("JOIN coi_disclosure cd2 ON cd2.disclosure_id = rel2.disclosure_id ")
	            .append("WHERE rel2.person_entity_id = d.person_entity_id ")
	            .append("AND cd2.FCOI_TYPE_CODE IN (1, 3))");
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		Query query = session.createNativeQuery(sqlQuery.toString());
		query.setParameter("personId", personId);
		if (engagementTypesNeeded != null && !engagementTypesNeeded.isBlank() && Constants.ALL_FINANCIAL_ENGAGEMENT.equalsIgnoreCase(engagementTypesNeeded)) {
			query.setParameter("validTypeCodes", Arrays.asList(Constants.FINANCIAL_SELF_RELATION_TYPE,
					Constants.FINANCIAL_DEPENDENT_RELATION_TYPE, Constants.FINANCIAL_SPOUSE_RELATION_TYPE));
		}
		BigInteger count = (BigInteger) query.getSingleResult();
		return count.intValue() > 0;
    }

    @Override
    public List<String> getProjectDisclosuresForMarkAsVoid(String loginPersonId, Integer moduleCode) {
    	 StringBuilder hqlQuery = new StringBuilder();
         Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
         hqlQuery.append("SELECT c.moduleItemKey FROM CoiDisclosure d ")
                 .append("INNER JOIN CoiDisclProjects c ON c.disclosureId = d.disclosureId ")
                 .append("WHERE c.moduleCode = :moduleCode AND d.personId = :loginPersonId and d.fcoiTypeCode = 2 and d.dispositionStatusCode !=2 ")
                 .append("and d.reviewStatusCode in (1,5,6)");
         Query query = session.createQuery(hqlQuery.toString());
         query.setParameter("loginPersonId", loginPersonId);
         query.setParameter("moduleCode", moduleCode);
         return query.getResultList();
    }

    @Override
    public Boolean checkIfEngagementLinkedToFcoi(String personId, List<Integer> validTypeCodes, Integer personEntityId, String engagementTypesNeeded) {
    	StringBuilder sqlQuery = new StringBuilder();
        sqlQuery.append("SELECT COUNT(rel.person_entity_id) FROM person_entity d ")
            .append("LEFT JOIN coi_discl_person_entity_rel rel ON rel.person_entity_id = d.person_entity_id ")
            .append("LEFT JOIN coi_disclosure cd ON cd.disclosure_id = rel.disclosure_id ")
            .append("INNER JOIN person_entity_relationship entityRel ON entityRel.person_entity_id = d.person_entity_id ")
            .append("WHERE d.person_id = :personId ");
		if (validTypeCodes != null) {
			sqlQuery.append("AND entityRel.VALID_PERS_ENTITY_REL_TYP_CODE IN (:validTypeCodes) ");
		} else if (Constants.ALL_SFI_ENGAGEMENT.equals(engagementTypesNeeded)) {
			sqlQuery.append("AND d.IS_SIGNIFICANT_FIN_INTEREST = true ");
		}
        sqlQuery.append("AND rel.person_entity_id = :personEntityId ")
        	.append("AND cd.FCOI_TYPE_CODE IN (1, 3) ")
            .append("AND d.version_number = ( ")
            .append("SELECT MAX(d2.version_number) FROM person_entity d2 ")
            .append("WHERE d2.version_status = 'ACTIVE' AND d2.person_id = :personId ")
            .append("AND d2.person_entity_id = :personEntityId )");
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        Query query = session.createNativeQuery(sqlQuery.toString());
        query.setParameter("personId", personId);
        query.setParameter("personEntityId", personEntityId);
        if (validTypeCodes != null) {
            query.setParameter("validTypeCodes", validTypeCodes);
        }
        BigInteger count = (BigInteger) query.getSingleResult();
        return count.intValue() == 0;
    }

    @Override
    public Boolean checkIfProjectDisclosureApproved(String personId, Integer moduleCode, String moduleItemKey) {
        StringBuilder sqlQuery = new StringBuilder();
        sqlQuery.append("SELECT COUNT(c.moduleItemKey) FROM CoiDisclosure d ")
                .append("INNER JOIN CoiDisclProjects c ON c.disclosureId = d.disclosureId ")
                .append("WHERE c.moduleCode = :moduleCode AND c.moduleItemKey = :moduleItemKey AND d.personId = :loginPersonId AND d.fcoiTypeCode = 2 AND d.dispositionStatusCode != 2");
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		Query query = session.createQuery(sqlQuery.toString());
        query.setParameter("moduleCode", moduleCode);
        query.setParameter("loginPersonId", personId);
        query.setParameter("moduleItemKey", moduleItemKey);
        Long count = (Long) query.getSingleResult(); 
        return count > 0;
    }

	@Override
	public Boolean isDisclosureSynced(Integer disclosureId, String documentOwnerId, String engagementTypesNeeded) {		
		StringBuilder disclosureSyncedEngagementQuery = new StringBuilder();
	    disclosureSyncedEngagementQuery.append("SELECT DISTINCT rel.personEntityNumber ")
	        .append("FROM CoiDisclProjectEntityRel rel ")
	        .append("INNER JOIN CoiDisclProjects proj ON rel.coiDisclProjectId = proj.coiDisclProjectId ")
	        .append("INNER JOIN PersonEntityRelationship perRel ON rel.personEntityId = perRel.personEntityId ")
	        .append("WHERE proj.disclosureId = :disclosureId ");
	    boolean setValidTypeCodes = false;
	    if (engagementTypesNeeded != null && !engagementTypesNeeded.isBlank() && !Constants.ALL_ENGAGEMENT.equals(engagementTypesNeeded)) {
	        if (Constants.ALL_FINANCIAL_ENGAGEMENT.equalsIgnoreCase(engagementTypesNeeded)) {
	            disclosureSyncedEngagementQuery.append("AND perRel.validPersonEntityRelTypeCode IN (:validTypeCodes) ");
	            setValidTypeCodes = true;
	        } else if (Constants.ALL_SFI_ENGAGEMENT.equalsIgnoreCase(engagementTypesNeeded)) {
	            disclosureSyncedEngagementQuery.append("AND perRel.personEntityId IN (")
	                .append("SELECT pe.personEntityId FROM PersonEntity pe ")
	                .append("WHERE pe.personId = :personId AND pe.versionStatus = 'ACTIVE' ")
	                .append("AND pe.isSignificantFinInterest = 'Y') ");
	        }
	    }
	    StringBuilder financialEngagementQuery = new StringBuilder();
	    financialEngagementQuery.append("SELECT DISTINCT pe.personEntityNumber ")
	        .append("FROM PersonEntity pe ")
	        .append("INNER JOIN PersonEntityRelationship perRel ON pe.personEntityId = perRel.personEntityId ")
	        .append("WHERE pe.personId = :personId AND pe.versionStatus = 'ACTIVE' ");
	    boolean setValidTypeCodesInSecondQuery = false;
	    if (engagementTypesNeeded != null && !engagementTypesNeeded.isBlank() && !Constants.ALL_ENGAGEMENT.equals(engagementTypesNeeded)) {
	        if (Constants.ALL_FINANCIAL_ENGAGEMENT.equalsIgnoreCase(engagementTypesNeeded)) {
	            financialEngagementQuery.append("AND perRel.validPersonEntityRelTypeCode IN (:validTypeCodes) ");
	            setValidTypeCodesInSecondQuery = true;
	        } else if (Constants.ALL_SFI_ENGAGEMENT.equalsIgnoreCase(engagementTypesNeeded)) {
	            financialEngagementQuery.append("AND pe.isSignificantFinInterest = 'Y' ");
	        }
	    }
	    Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
	    Query query1 = session.createQuery(disclosureSyncedEngagementQuery.toString());
	    query1.setParameter("disclosureId", disclosureId);
	    if (Constants.ALL_SFI_ENGAGEMENT.equalsIgnoreCase(engagementTypesNeeded)) {
	        query1.setParameter("personId", documentOwnerId);
	    }
	    if (setValidTypeCodes) {
	        query1.setParameter("validTypeCodes", Arrays.asList(
	            Constants.FINANCIAL_SELF_RELATION_TYPE,
	            Constants.FINANCIAL_DEPENDENT_RELATION_TYPE,
	            Constants.FINANCIAL_SPOUSE_RELATION_TYPE));
	    }
	    List<String> disclosureSyncedPersonEntities = query1.getResultList();
	    Query query2 = session.createQuery(financialEngagementQuery.toString());
	    query2.setParameter("personId", documentOwnerId);
	    if (setValidTypeCodesInSecondQuery) {
	        query2.setParameter("validTypeCodes", Arrays.asList(
	            Constants.FINANCIAL_SELF_RELATION_TYPE,
	            Constants.FINANCIAL_DEPENDENT_RELATION_TYPE,
	            Constants.FINANCIAL_SPOUSE_RELATION_TYPE));
	    }
	    List<String> financialPersonEntities = query2.getResultList();
	    return disclosureSyncedPersonEntities.containsAll(financialPersonEntities);
	}

	@Override
	public void updateDisclosureExpirationDate(Integer disclosureId, Timestamp expirationDate) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		StringBuilder hqlQuery = new StringBuilder();
		hqlQuery.append("UPDATE CoiDisclosure c ");
		hqlQuery.append("SET c.expirationDate = :expirationDate, ");
		hqlQuery.append("c.isExtended = true ");
		hqlQuery.append("WHERE c.disclosureId = :disclosureId ");
		hqlQuery.append("AND c.expirationDate < :expirationDate");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("expirationDate", expirationDate);
		query.setParameter("disclosureId", disclosureId);
		query.executeUpdate();
	}

	@Override
	public List<ProjectEntityRequestDto> getDisclosureExtendingProjectDetails(Integer disclosureId, String personId, Integer disclosureNumber) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		StringBuilder hqlQuery = new StringBuilder();
		hqlQuery.append("SELECT NEW com.polus.fibicomp.fcoiDisclosure.dto.ProjectEntityRequestDto( ");
		hqlQuery.append("c1.disclosureId, c1.disclosureNumber, c1.dispositionStatusCode) ");
		hqlQuery.append("FROM CoiDisclosure c1 ");
		hqlQuery.append("JOIN CoiDisclosure c2 ON c2.disclosureId = :fcoiDisclosureId ");
		hqlQuery.append("WHERE c1.updateTimestamp > c2.certifiedAt ");
		hqlQuery.append("AND c2.versionStatus != 'ARCHIVE' ");
		hqlQuery.append("AND c1.coiProjectTypeCode = '1' ");
		hqlQuery.append("AND c1.dispositionStatusCode = '3' ");
		hqlQuery.append("AND c1.personId = :personId ");
		hqlQuery.append("AND c2.disclosureId = ( ");
		hqlQuery.append("    SELECT MAX(c3.disclosureId) ");
		hqlQuery.append("    FROM CoiDisclosure c3 ");
		hqlQuery.append("    WHERE c3.personId = :personId ");
		hqlQuery.append("    AND c3.disclosureNumber = :disclosureNumber ");
		hqlQuery.append(")");
		TypedQuery<ProjectEntityRequestDto> query = session.createQuery(hqlQuery.toString(), ProjectEntityRequestDto.class);
		query.setParameter("fcoiDisclosureId", disclosureId);
		query.setParameter("personId", personId);
		query.setParameter("disclosureNumber", disclosureNumber);
		List<ProjectEntityRequestDto> resultList = query.getResultList();
		return resultList;
	}

    @Override
	public List<DisclosureProjectDto> getAllSubmissionOrReviewDoneProjects(Integer disclosureId, String reviewStatusCode) {
	    Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
	    List<DisclosureProjectDto> disclosureProjects = new ArrayList<>();
	    SessionImpl sessionImpl = (SessionImpl) session;
	    Connection connection = sessionImpl.connection();
	    CallableStatement statement = null;
	    ResultSet rset = null;  
	    try {
	        if (oracledb.equalsIgnoreCase("N")) {
	            statement = connection.prepareCall("{call GET_PROJECTS_BY_DISC_REVIEW_STATUS(?,?)}");
	            if (disclosureId == null) {
	                statement.setNull(1, Types.INTEGER);
	            } else {
	                statement.setInt(1, disclosureId);
	            }
	            statement.setInt(2, Integer.parseInt(reviewStatusCode));
	            statement.execute();
	            rset = statement.getResultSet();
	        } else if (oracledb.equalsIgnoreCase("Y")) {
	            String procedureName = "GET_PROJECTS_BY_DISC_REVIEW_STATUS";
	            String functionCall = "{call " + procedureName + "(?,?,?)}";
	            statement = connection.prepareCall(functionCall);
	            statement.registerOutParameter(1, OracleTypes.CURSOR);
	            if (disclosureId == null) {
	                statement.setNull(2, Types.INTEGER);
	            } else {
	                statement.setInt(2, disclosureId);
	            }
	            statement.setInt(3,Integer.parseInt(reviewStatusCode));           
	            statement.execute();
	            rset = (ResultSet) statement.getObject(1);
	        }
	        while (rset != null && rset.next()) {
	            disclosureProjects.add(DisclosureProjectDto.builder()
	                    .projectNumber(rset.getString("PROJECT_NUMBER"))
	                    .projectId(rset.getString("PROJECT_ID"))
	                    .title(rset.getString("PROJECT_TITLE"))
	                    .leadUnitNumber(rset.getString("DEPARTMENT_NUMBER"))
	                    .leadUnitName(rset.getString("DEPARTMENT_NAME"))
	                    .piName(rset.getString("PRINCIPAL_INVESTIGATOR"))
	                    .projectType(rset.getString("PROJECT_TYPE"))
	                    .projectSubmissionStatus(rset.getString("PROJECT_SUBMISSION_STATUS"))
	                    .projectReviewStatus(rset.getString("PROJECT_OVERALL_REVIEW_STATUS"))
	                    .build());
	        }
	    } catch (SQLException e) {
	        logger.error("Exception in getAllSubmissionOrReviewDoneProjects: {}", e.getMessage());
	        throw new ApplicationException("Exception in getAllSubmissionOrReviewDoneProjects", e, Constants.DB_PROC_ERROR);
	    } finally {
	        try {
	            if (rset != null) rset.close();
	            if (statement != null) statement.close();
	        } catch (SQLException e) {
	            logger.error("Error closing resources: {}", e.getMessage());
	        }
	    }
	    return disclosureProjects;
	}

	@Override
	public void syncFcoiDisclAndPersonEntities(Integer disclosureId, String sfiJsonString) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        CallableStatement statement = null;
        try {
            if (oracledb.equalsIgnoreCase("N")) {
                statement = connection.prepareCall("{call COI_DISCL_PERSON_ENTITY_INSERTION(?,?,?)}");
                statement.setInt(1, disclosureId);
                statement.setString(2, AuthenticatedUser.getLoginPersonId());
                statement.setString(3, sfiJsonString);
            } else if (oracledb.equalsIgnoreCase("Y")) {
                String functionCall = "{call COI_DISCL_PERSON_ENTITY_INSERTION(?,?,?,?)}";
                statement = connection.prepareCall(functionCall);
                statement.registerOutParameter(1, OracleTypes.CURSOR);
                statement.setInt(2, disclosureId);
                statement.setString(3, AuthenticatedUser.getLoginPersonId());
                statement.setString(4, sfiJsonString);
            }
            Objects.requireNonNull(statement).execute();
            session.flush();
        } catch (Exception e) {
            logger.error("Exception on syncFcoiDisclAndPersonEntities: {}", e.getMessage());
            throw new ApplicationException("Error executing stored procedure: COI_DISCL_PERSON_ENTITY_INSERTION", e, Constants.DB_PROC_ERROR);
        }
	}

	@Override
	public Integer getActiveProjectsCount(String personId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
	    SessionImpl sessionImpl = (SessionImpl) session;
	    Connection connection = sessionImpl.connection();
	    CallableStatement statement = null;
	    int activeProjectsCount = 0;
	    try {
	        String functionName = "FN_CHK_ACTIVE_PROJECTS";
            String functionCall = "{ ? = call " + functionName + "(?) }";
	        statement = connection.prepareCall(functionCall);
	        statement.registerOutParameter(1, OracleTypes.INTEGER);
	        statement.setString(2, personId);
	        statement.execute();
	        activeProjectsCount = statement.getInt(1);
	    } catch (SQLException e) {
	        logger.error("Exception in getActiveProjectsCount: {}", e.getMessage());
	        throw new ApplicationException("Error in getActiveProjectsCount", e, Constants.DB_FN_ERROR);
	    } finally {
	        try {
	            if (statement != null) {
	                statement.close();
	            }
	        } catch (SQLException e) {
	            logger.warn("Could not close CallableStatement", e);
	        }
	    }
	    return activeProjectsCount;
	}

	@Override
	public Map<String, List<String>> getProjectDisclosuresForMarkAsVoid(String loginPersonId) {
	    StringBuilder hql = new StringBuilder();
	    hql.append("SELECT c.moduleCode, c.moduleItemKey ")
	       .append("FROM CoiDisclosure d ")
	       .append("JOIN CoiDisclProjects c ON c.disclosureId = d.disclosureId ")
	       .append("WHERE c.moduleCode IN (")
	       .append("    SELECT p.coiProjectTypeCode FROM CoiProjectType p WHERE p.fcoiNeeded = 'Y'")
	       .append(") AND d.personId = :loginPersonId ")
	       .append("AND d.fcoiTypeCode = 2 ")
	       .append("AND d.dispositionStatusCode != 2 ")
	       .append("AND d.reviewStatusCode IN (1, 5, 6)");
	    Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
	    Query query = session.createQuery(hql.toString());
	    query.setParameter("loginPersonId", loginPersonId);
	    List<Object[]> results = query.getResultList();
	    return results.stream()
	    	    .filter(row -> row[0] != null && row[1] != null)
	    	    .collect(Collectors.groupingBy(
	    	        row -> String.valueOf(row[0]),
	    	        Collectors.mapping(row -> String.valueOf(row[1]), Collectors.toList())
	    	    ));
	}
	
	@Override
	public List<UnitAdministrator> getUnitAdministrators(String adminTypeCode, String unitNumber) {
		try {
			String hqlQuery = "SELECT DISTINCT ua " + "FROM UnitAdministrator ua "
					+ "INNER JOIN Person p ON p.personId = ua.personId " + "WHERE ua.unitNumber = :unitNumber "
					+ "AND ua.unitAdministratorTypeCode = :adminTypeCode " + "AND p.status = 'A'";
			Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
			TypedQuery<UnitAdministrator> query = session.createQuery(hqlQuery, UnitAdministrator.class);
			query.setParameter("unitNumber", unitNumber);
			query.setParameter("adminTypeCode", adminTypeCode);
			return query.getResultList();
		} catch (Exception e) {
			logger.error("Error fetching unit administrators for unit {}: {}", unitNumber, e.getMessage(), e);
			return null;
		}
	}

    @Override
    public boolean isDisclReviewStatusIn(String reviewStatusCode, Integer disclosureId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT case when (count(c.disclosureId) > 0) then true else false end ");
        hqlQuery.append("FROM CoiDisclosure c WHERE  c.reviewStatusCode = :reviewStatusCode ");
        hqlQuery.append("AND c.disclosureId = : disclosureId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("reviewStatusCode", reviewStatusCode);
        query.setParameter("disclosureId", disclosureId);
        return (boolean) query.getSingleResult();
    }

    @Override
    public void updateDisclosureStatuses(Integer disclosureId, Timestamp updateTimesStamp, String reviewStatusCode, String dispositionStatusCode) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("UPDATE CoiDisclosure d SET ");
        hqlQuery.append("d.updateTimestamp = :updateTimestamp, ");
        hqlQuery.append("d.updatedBy = :updatedBy ");
        if (reviewStatusCode != null)
            hqlQuery.append(", d.reviewStatusCode = :reviewStatusCode ");
        if (dispositionStatusCode != null)
            hqlQuery.append(", d.dispositionStatusCode = :dispositionStatusCode ");
        hqlQuery.append("WHERE d.disclosureId = :disclosureId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("disclosureId",disclosureId);
        if (reviewStatusCode != null)
            query.setParameter("reviewStatusCode", reviewStatusCode);
        if (dispositionStatusCode != null)
            query.setParameter("dispositionStatusCode", dispositionStatusCode);
        query.setParameter("updateTimestamp", updateTimesStamp);
        query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
        query.executeUpdate();
    }

    @Override
    public Integer getDisclosureNumber(Integer disclosureId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT c.disclosureNumber ");
        hqlQuery.append("FROM CoiDisclosure c WHERE c.disclosureId = : disclosureId");
        TypedQuery<Integer> query = session.createQuery(hqlQuery.toString(), Integer.class);
        query.setParameter("disclosureId", disclosureId);
        return query.getSingleResult();
    }

    @Override
    public String getHomeUnit(Integer disclosureId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT d.homeUnit ");
        hqlQuery.append("FROM CoiDisclosure d WHERE d.disclosureId = :disclosureId ");
        TypedQuery<String> query = session.createQuery(hqlQuery.toString());
        query.setParameter("disclosureId",disclosureId);
        return query.getSingleResult();
    }

    public CoiReviewStatusType getDisclosureReviewStatue(Integer disclosureId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT d.coiReviewStatusType ");
        hqlQuery.append("FROM CoiDisclosure d WHERE d.disclosureId = :disclosureId ");
        TypedQuery<CoiReviewStatusType> query = session.createQuery(hqlQuery.toString());
        query.setParameter("disclosureId",disclosureId);
        return query.getSingleResult();
    }

    @Override
    public List<Map<String, String>> getExpiringDisclosureSumryData() throws SQLException {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        CallableStatement statement = null;
        List<Map<String, String>> notificationDetails = new ArrayList<>();
        ResultSet resultSet = null;
        statement = connection.prepareCall("{call FCOI_DIS_RNWL_RMNDR_MNTLY_SMRY()}");
        statement.execute();
        resultSet = statement.getResultSet();
        while (resultSet.next()) {
            Map<String, String> additionalData = new HashMap<>();
            additionalData.put("MODULE_CODE", resultSet.getString("MODULE_CODE"));
            additionalData.put("SUB_MODULE_CODE", resultSet.getString("SUB_MODULE_CODE"));
            additionalData.put("EXPIRATION_DATE", resultSet.getString("EXPIRATION_DATE"));
            additionalData.put("HTML_CONTENT", resultSet.getString("HTML_CONTENT"));
            additionalData.put("NOTIFICATION_TYPE_ID", resultSet.getString("NOTIFICATION_TYPE_ID"));
            additionalData.put("DAYS_LEFT_TO_EXPIRE", resultSet.getString("DAYS_LEFT_TO_EXPIRE"));
            additionalData.put(StaticPlaceholders.NOTIFICATION_RECIPIENTS, resultSet.getString("NOTIFICATION_RECIPIENTS"));
            notificationDetails.add(additionalData);
        }
        return notificationDetails;
    }

    @Override
    public Integer getProjectDisclosureId(String projectType, String personId, String moduleItemKey) {
        StringBuilder hqlQuery = new StringBuilder();
        hqlQuery.append("SELECT p.coiDisclosure.disclosureId ");
        hqlQuery.append("FROM CoiDisclProjects p ");
        hqlQuery.append("WHERE p.coiDisclosure.coiProjectTypeCode = :projectType ");
        hqlQuery.append("AND p.coiDisclosure.personId = :personId ");
        hqlQuery.append("AND p.moduleCode = :projectType ");
        hqlQuery.append("AND p.moduleItemKey = :moduleItemKey order by p.coiDisclosure.disclosureId desc");
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        int attempts = 0;
        while (attempts < 3) {
            try {
                TypedQuery<Integer> query = session.createQuery(hqlQuery.toString(), Integer.class);
                query.setParameter("projectType", projectType);
                query.setParameter("personId", personId);
                query.setParameter("moduleItemKey", moduleItemKey);
                return query.getResultList().get(0);
            } catch (NoResultException ex) {
                attempts++;
                if (attempts >= 3) {
                    throw ex;
                }
                try {
                    Thread.sleep(1000); // 1 second delay between retries
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Retry interrupted", ie);
                }
            }
        }
        return null;
    }

    @Override
    public List<MakeVoidDto> markPendingDisclosuresAsVoid(String personId, String actionType, String moduleCode) throws SQLException {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        CallableStatement statement = null;
        ResultSet resultSet = null;
    	List<MakeVoidDto> makeVoidDto = new ArrayList<>();
        try {
            statement = connection.prepareCall("{call MARK_PENDING_PROJECT_DISCLOSURES_AS_VOID(?,?,?)}");
            statement.setString(1, personId);
            statement.setString(2, actionType);
            statement.setString(3, moduleCode);
            boolean hasResult = statement.execute();
            if (!hasResult) {
                return null;
            }
            ResultSet rs = statement.getResultSet();
                while (rs.next()) {
                	MakeVoidDto dto = MakeVoidDto.builder()
                	        .disclosureId(rs.getInt("DISCLOSURE_ID"))
                	        .disclosureNumber(rs.getString("DISCLOSURE_NUMBER"))
                	        .coiProjectType(rs.getString("COI_PROJECT_TYPE"))
                	        .projectTitle(rs.getString("PROJECT_TITLE"))
                	        .projectNumber(rs.getString("PROJECT_NUMBER"))
                	        .build();
                	makeVoidDto.add(dto);
                }
            return makeVoidDto;
        } catch (SQLException e) {
        	logger.error("Error occured in procedure call MARK_PENDING_PROJECT_DISCLOSURES_AS_VOID({},{},{}): {}", personId, actionType, moduleCode, e.getMessage());
        	throw e;
        }
    }
}
