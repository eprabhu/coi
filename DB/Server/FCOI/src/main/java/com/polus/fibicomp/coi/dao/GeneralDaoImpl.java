package com.polus.fibicomp.coi.dao;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Types;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import javax.persistence.Query;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import javax.persistence.criteria.Subquery;

import com.polus.core.pojo.LetterTemplateType;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.hibernate.Session;
import org.hibernate.internal.SessionImpl;
import org.hibernate.query.NativeQuery;
import org.hibernate.transform.Transformers;
import org.hibernate.type.StandardBasicTypes;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.applicationexception.dto.ApplicationException;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.person.pojo.Person;
import com.polus.core.pojo.State;
import com.polus.core.pojo.UnitAdministrator;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.coi.dto.EvaluateFormRequestDto;
import com.polus.fibicomp.coi.dto.LookupRequestDto;
import com.polus.fibicomp.coi.dto.LookupResponseDto;
import com.polus.fibicomp.constants.Constants;

import oracle.jdbc.OracleTypes;

@Repository
@Transactional
public class GeneralDaoImpl implements GeneralDao {

    protected static Logger logger = LogManager.getLogger(GeneralDaoImpl.class.getName());

    @Autowired
    private HibernateTemplate hibernateTemplate;

    @Autowired
    private CommonDao commonDao;

    @Value("${oracledb}")
    private String oracledb;

    @Override
    public boolean isPersonInReviewer(String personId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("select (CASE WHEN count(cr.coiReviewId) > 0 THEN true ELSE false END) from CoiReview cr where cr.assigneePersonId = :personId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("personId", personId);
        return (Boolean) query.getSingleResult();
    }

	@Override
	public List<String> fetchAllCoiOpaRights(String loginPersonId) {
		List<String> rights = new ArrayList<>();
        String leadUnit = AuthenticatedUser.getLoginPersonUnit();
		rights.addAll(fetchRightsByModule(loginPersonId, Constants.COI_MODULE_CODE, leadUnit, Types.DECIMAL));
		rights.addAll(fetchRightsByModule(loginPersonId, Constants.OPA_MODULE_CODE, leadUnit, Types.DECIMAL));
		rights.addAll(fetchRightsByModule(loginPersonId, Constants.TRAVEL_MODULE_CODE, leadUnit, Types.DECIMAL));
		rights.addAll(fetchRightsByModule(loginPersonId, Constants.CONSULT_DISCL_MODULE_CODE, leadUnit, Types.DECIMAL));
		return rights;
	}

    @Override
	public List<String> fetchRightsByModule(String loginPersonId, Integer moduleCode, String leadUnit, Integer moduleItemKey) {
		List<String> rightList = new ArrayList<>();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        CallableStatement statement = null;
        ResultSet rset = null;
        try {
            if (oracledb.equalsIgnoreCase("N")) {
                statement = connection.prepareCall("{call GET_ALL_RIGHTS_FOR_A_MODULE(?,?,?,?)}");
                statement.setInt(1, moduleCode);
                statement.setString(2, loginPersonId);
                statement.setString(3, leadUnit);
                statement.setNull(4, moduleItemKey);
                statement.execute();
                rset = statement.getResultSet();
            } else if (oracledb.equalsIgnoreCase("Y")) {
                String functionCall = "{call GET_ALL_RIGHTS_FOR_A_MODULE(?,?,?,?,?)}";
                statement = connection.prepareCall(functionCall);
                statement.registerOutParameter(1, OracleTypes.CURSOR);
                statement.setInt(2, moduleCode);
                statement.setString(3, loginPersonId);
                statement.setString(4, leadUnit);
                statement.setNull(5, moduleItemKey);
                statement.execute();
                rset = (ResultSet) statement.getObject(1);
            }
            while (rset != null && rset.next()) {
                rightList.add(rset.getString("RIGHT_NAME"));
            }
        } catch (Exception e) {
           logger.error("Exception on fetchRightsByModule {}", e.getMessage());
           throw new ApplicationException("Unable to fetch rights", e, Constants.JAVA_ERROR);
        }
        return rightList;
	}

    @Override
    public boolean isPersonInOPAReviewer(String personId) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        StringBuilder opaHql = new StringBuilder();
        opaHql.append("select count(cr.opaReviewId) ");
        opaHql.append("from OPAReview cr ");
        opaHql.append("where cr.assigneePersonId = :personId");
        Long opaCount = (Long) session.createQuery(opaHql.toString())
                .setParameter("personId", personId)
                .getSingleResult();
        if (opaCount > 0) {
            return true;
        }
        StringBuilder workflowHql = new StringBuilder();
		workflowHql.append("select count(WFD.workflowDetailId) ");
		workflowHql.append("from Workflow WF ");
		workflowHql.append("join WF.workflowDetails WFD ");
		workflowHql.append("where WF.moduleCode = 23 ");
		workflowHql.append("and WFD.approverPersonId = :personId ");
		Long workflowCount = (Long) session.createQuery(workflowHql.toString()).setParameter("personId", personId)
				.getSingleResult();
		return workflowCount > 0;
    }

    @SuppressWarnings("unchecked")
    @Override
    public String getAlertTypeByMessageCode(String messageTypeCode) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        String hqlQuery = "select m.alertTypeCode from MessageAlertTypeMapping m where m.messageTypeCode = :messageTypeCode and m.isActive = 'Y'";
        Query query = session.createQuery(hqlQuery, String.class);
        query.setParameter("messageTypeCode", messageTypeCode);
        List<String> results = query.getResultList();
        return results.isEmpty() ? null : results.get(0);
    }

	@Override
	public Boolean evaluateFormResponse(EvaluateFormRequestDto dto) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        CallableStatement statement = null;
        ResultSet rset = null;
        Boolean isTravelDisclosureRequired = null;
        try {
            if (oracledb.equalsIgnoreCase("N")) {
                statement = connection.prepareCall("{call EVALUATE_FORM_RESPONSE(?,?,?,?)}");
                statement.setString(1, dto.getModuleItemCode());
                statement.setString(2, dto.getModuleSubItemCode());
                statement.setString(3, dto.getModuleItemKey());
                statement.setString(4, dto.getModuleSubItemKey());
                statement.execute();
                rset = statement.getResultSet();
            } else if (oracledb.equalsIgnoreCase("Y")) {
                String functionCall = "{call EVALUATE_FORM_RESPONSE(?,?,?,?,?)}";
                statement = connection.prepareCall(functionCall);
                statement.registerOutParameter(1, OracleTypes.CURSOR);
                statement.setString(2, dto.getModuleItemCode());
                statement.setString(3, dto.getModuleSubItemCode());
                statement.setString(4, dto.getModuleItemKey());
                statement.setString(5, dto.getModuleSubItemKey());
                statement.execute();
                rset = (ResultSet) statement.getObject(1);
            }
            while (rset != null && rset.next()) {
            	 String result = rset.getString("RESULT");
                 JSONObject jsonResult = new JSONObject(result);
                 isTravelDisclosureRequired = jsonResult.getBoolean("IS_TRAVEL_DISCLOSURE_REQUIRED");
            }
        } catch (Exception e) {
           logger.error("Exception on evaluateFormResponse {}", e.getMessage());
           throw new ApplicationException("Exception on evaluateFormResponse", e, Constants.JAVA_ERROR);
        }
        return isTravelDisclosureRequired;
	}

    /**
     * Fetches lookup values based on the provided request.
     * If isActive is 'Y', the query filters for active records.
     * If isActive is 'N', the query filters for inactive records.
     * If isActive is null or empty, it returns all records.
     *
     * @param requestDto The lookup request containing table name, column name, and isActive.
     * @return A list of LookupResponseDto containing code and description.
     */
    @Override
    public List<LookupResponseDto> getLookupValues(LookupRequestDto requestDto) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        StringBuilder hqlQuery = new StringBuilder();
        hqlQuery.append("SELECT ")
                .append(requestDto.getLookupTableColumnName()).append(" AS code, ")
                .append("DESCRIPTION AS description ")
                .append("FROM ")
                .append(requestDto.getLookupTableName());
        if (requestDto.getIsActive() != null && !requestDto.getIsActive().isBlank()) {
            hqlQuery.append(" WHERE IS_ACTIVE = :isActive");
        }
        NativeQuery<LookupResponseDto> query = session.createNativeQuery(hqlQuery.toString());
        query.addScalar("code", StandardBasicTypes.STRING);
        query.addScalar("description", StandardBasicTypes.STRING);
        query.setResultTransformer(Transformers.aliasToBean(LookupResponseDto.class));
        if (requestDto.getIsActive() != null && !requestDto.getIsActive().isBlank()) {
            query.setParameter("isActive", requestDto.getIsActive());
        }
        List<LookupResponseDto> resultList = query.list();
        return resultList != null ? resultList : Collections.emptyList();
    }

    @Override
    public State findStateByStateCode(String stateCode) {
        try {
            Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
            String hqlQuery = "select s from State s where m.stateCode = :stateCode ";
            TypedQuery<State> query = session.createQuery(hqlQuery, State.class);
            query.setParameter("stateCode", stateCode);
            return query.getSingleResult();
        } catch (Exception e) {
            logger.warn("State not found with state code : {}", stateCode);
            return null;
        }
    }

    @Override
    public State findStateByStateCodeCountryCode(String stateCode, String countryCode) {
        try {
            Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
            String hqlQuery = "select s from State s where s.stateCode like :stateCode AND s.countryCode = :countryCode";
            TypedQuery<State> query = session.createQuery(hqlQuery, State.class);
            query.setParameter("stateCode", "%"+stateCode+"%");
            query.setParameter("countryCode", countryCode);
            return query.getSingleResult();
        } catch (Exception e) {
            logger.warn("State not found with state code : {} & countryCode : {}", stateCode, countryCode);
            return null;
        }
    }
    
    @Override
    public boolean isPersonReviewerForModule(String personId, Integer moduleCode) {
        Map<Integer, Function<String, Boolean>> reviewerCheckMap = Map.of(
            Constants.COI_MODULE_CODE, this::isPersonInReviewer,
            Constants.OPA_MODULE_CODE, this::isPersonInOPAReviewer,
            Constants.COI_MANAGEMENT_PLAN_MODULE_CODE, this::isPersonInCmpReviewer
        );
        return reviewerCheckMap.getOrDefault(moduleCode, id -> false).apply(personId);
    }
    
    @Override
    public List<Person> getContractAdministrators(String searchString) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        CriteriaBuilder criteriaBuilder = session.getCriteriaBuilder();
        CriteriaQuery<Object[]> criteriaQuery = criteriaBuilder.createQuery(Object[].class);

        Root<Person> personRoot = criteriaQuery.from(Person.class);
        Subquery<String> subquery = criteriaQuery.subquery(String.class);
        Root<UnitAdministrator> uaRoot = subquery.from(UnitAdministrator.class);
        subquery.select(uaRoot.get("personId")).where(criteriaBuilder.equal(uaRoot.get("unitAdministratorTypeCode"), 2));

        Predicate inPersonIds = personRoot.get("personId").in(subquery);
        Predicate searchFilter = criteriaBuilder.or(
        	criteriaBuilder.like(criteriaBuilder.lower(personRoot.get("fullName")), "%" + searchString.toLowerCase() + "%"),
        	criteriaBuilder.like(personRoot.get("personId"), "%" + searchString + "%")
        );
        criteriaQuery.multiselect(personRoot.get("personId"), personRoot.get("fullName"))
          .where(criteriaBuilder.and(inPersonIds, searchFilter))
          .orderBy(criteriaBuilder.asc(personRoot.get("fullName")));
        
        List<Object[]> rows = session.createQuery(criteriaQuery).getResultList();
        List<Person> persons = new ArrayList<>();
        for (Object[] row : rows) {
            Person person = new Person();
            person.setPersonId((String) row[0]);
            person.setFullName((String) row[1]);
            persons.add(person);
        }
        return persons;
    }

    @Override
    public int getPendingActionItemCountForPerson(String personId) {
        try {
            String hql = "SELECT COUNT(i) FROM Inbox i WHERE i.openedFlag = 'N' AND i.toPersonId = :personId";
            return hibernateTemplate.getSessionFactory()
                    .getCurrentSession()
                    .createQuery(hql, Long.class)
                    .setParameter("personId", personId)
                    .getSingleResult()
                    .intValue();
        } catch (Exception e) {
            logger.error("Fetching pending action items count for personId: {}", personId, e);
            return 0;
        }
    }

    @Override
    public List<LetterTemplateType> getAllLetterTemplateTypes(Integer moduleCode, Integer subModuleCode) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        String hqlQuery = "select l from LetterTemplateType l where l.moduleCode = :moduleCode AND l.subModuleCode = :subModuleCode ";
        TypedQuery<LetterTemplateType> query = session.createQuery(hqlQuery, LetterTemplateType.class);
        query.setParameter("moduleCode", moduleCode);
        query.setParameter("subModuleCode", subModuleCode);
        return query.getResultList();
    }

	@Override
	public boolean isPersonInCmpReviewer(String loginPersonId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		String reviewerHql = "select count(cr.cmpReviewId) " + "from CoiCmpReview cr "
				+ "join CoiManagementPlan cmp on cmp.cmpId = cr.cmpId " + "where cr.assigneePersonId = :personId "
				+ "and cmp.personId <> :personId";
		Long reviewerCount = (Long) session.createQuery(reviewerHql).setParameter("personId", loginPersonId)
				.getSingleResult();
		if (reviewerCount > 0) {
			return true;
		}
		String taskHql = "select count(t.taskId) " + "from CmpTask t " + "join t.coiManagementPlan cmp "
				+ "where t.assigneePersonId = :personId " + "and cmp.personId <> :personId";
		Long taskCount = (Long) session.createQuery(taskHql).setParameter("personId", loginPersonId).getSingleResult();
		return taskCount > 0;
	}
}
