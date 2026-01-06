package com.polus.fibicomp.compliance.declaration.dao;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.persistence.LockModeType;
import javax.persistence.NoResultException;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import javax.persistence.criteria.Subquery;

import com.polus.core.applicationexception.dto.ApplicationException;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.compliance.declaration.dto.DeclarationRequestDto;
import com.polus.fibicomp.compliance.declaration.pojo.*;
import com.polus.fibicomp.constants.Constants;
import lombok.extern.log4j.Log4j2;
import oracle.jdbc.OracleTypes;
import org.hibernate.Session;
import org.hibernate.internal.SessionImpl;
import org.hibernate.query.NativeQuery;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.reminder.pojo.ReminderNotification;

import lombok.RequiredArgsConstructor;

@Service(value = "coiDeclarationDao")
@Transactional
@RequiredArgsConstructor
@Log4j2
public class CoiDeclarationDaoImpl implements CoiDeclarationDao {

	private final static String PERSON_ID = "personId";
	private final static String DECLARATION_TYPE_CODE = "declarationTypeCode";
	private final static String VERSION_STATUS = "versionStatus";
	private final static String VERSION_NUMBER = "versionNumber";
	private final static String DECLARATION_STATUS_CODE = "declarationStatusCode";
	private final static String EXPIRATION_DATE = "expirationDate";
	private final static String SUBMISSION_DATE = "submissionDate";
	private final static String CREATE_TIMESTAMP = "createTimestamp";
	private final static String DECLARATION_ID = "declarationId";
	private final static String DECLARATION_NUMBER = "declarationNumber";
	private final static String NOTIFICATION_ID = "notificationId";

	private final HibernateTemplate hibernateTemplate;
	private final CommonDao commonDao;

	@Override
	public synchronized String generateNextDeclarationNumber() {
		return hibernateTemplate.execute(session -> {
			CriteriaBuilder cb = session.getCriteriaBuilder();
			CriteriaQuery<CoiDeclarationNumberCounter> cq = cb.createQuery(CoiDeclarationNumberCounter.class);
			Root<CoiDeclarationNumberCounter> root = cq.from(CoiDeclarationNumberCounter.class);

			cq.where(cb.equal(root.get("counterName"), "COI_DECLARATION_NUMBER_COUNTER"));

			CoiDeclarationNumberCounter counter = session.createQuery(cq).setLockMode(LockModeType.PESSIMISTIC_WRITE).uniqueResult();

			if (counter == null) {
				throw new RuntimeException("Declaration Number Counter not found");
			}

			Integer currentValue = counter.getCounterValue();
			counter.setCounterValue(currentValue + 1);

			session.update(counter);

			String declarationNumber = String.format("COI-%06d", currentValue);

			return declarationNumber;
		});
	}

	@Override
	public CoiDeclaration saveDeclaration(CoiDeclaration declaration) {
		hibernateTemplate.saveOrUpdate(declaration);
		return declaration;
	}

	@Override
	public CoiDeclaration findActiveDeclaration(String personId, String declarationTypeCode) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("SELECT c FROM CoiDeclaration c WHERE c.personId = :personId AND c.versionStatus = :versionStatus ");
		hqlQuery.append("AND c.declarationTypeCode = :declarationTypeCode");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("personId", personId);
		query.setParameter("declarationTypeCode", declarationTypeCode);
		query.setParameter("versionStatus", Constants.COI_ACTIVE_STATUS);
		return (CoiDeclaration) query.getResultList().get(0);
	}

	@Override
	public CoiDeclaration findByDeclarationId(Integer declarationId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CoiDeclaration declaration = session.find(CoiDeclaration.class, declarationId);
		session.refresh(declaration);
		return declaration;
	}

	@Override
	public void updateDeclaration(CoiDeclaration declaration) {
		hibernateTemplate.update(declaration);
	}

	@Override
	public void saveActionLog(CoiDeclActionLog log) {
		hibernateTemplate.save(log);
	}

    @Override
    public List<CoiDeclaration> findExpiringDeclarations(Timestamp expiryDate, List<String> declarationStatusCodes, boolean lessThanOrEqual) {
        try {
            return hibernateTemplate.execute(session -> {
                StringBuilder hql = new StringBuilder();
                hql.append("SELECT cd FROM CoiDeclaration cd ")
                        .append("WHERE cd.declarationStatusCode IN :declarationStatusCode ")
                        .append("AND cd.versionStatus = :versionStatus ");
                if (lessThanOrEqual) {
                    hql.append("AND cd.expirationDate <= :expiryDate ");
                } else {
                    hql.append("AND cd.expirationDate < :expiryDate ");
                }
                hql.append("ORDER BY cd.expirationDate ASC");
                return session.createQuery(hql.toString(), CoiDeclaration.class)
                        .setParameter("declarationStatusCode", declarationStatusCodes)
                        .setParameter("versionStatus", Constants.COI_ACTIVE_STATUS)
                        .setParameter("expiryDate", expiryDate)
                        .getResultList();
            });
        } catch (Exception e) {
            throw new RuntimeException("Database error while fetching expiring declarations.", e);
        }
    }

	@Override
	public List<CoiDeclaration> searchDeclarations(String personId, String declarationStatusCode,
			String declarationTypeCode, LocalDate fromDate, LocalDate toDate) {

		return hibernateTemplate.execute(session -> {
			CriteriaBuilder cb = session.getCriteriaBuilder();
			CriteriaQuery<CoiDeclaration> cq = cb.createQuery(CoiDeclaration.class);
			Root<CoiDeclaration> root = cq.from(CoiDeclaration.class);

			List<Predicate> predicates = new ArrayList<>();

			if (personId != null && !personId.isEmpty()) {
				predicates.add(cb.equal(root.get(PERSON_ID), personId));
			}
			if (declarationStatusCode != null && !declarationStatusCode.isEmpty()) {
				predicates.add(cb.equal(root.get(DECLARATION_STATUS_CODE), declarationStatusCode));
			}
			if (declarationTypeCode != null && !declarationTypeCode.isEmpty()) {
				predicates.add(cb.equal(root.get(DECLARATION_TYPE_CODE), declarationTypeCode));
			}
			if (fromDate != null) {
				predicates.add(cb.greaterThanOrEqualTo(root.get(SUBMISSION_DATE), fromDate));
			}
			if (toDate != null) {
				predicates.add(cb.lessThanOrEqualTo(root.get(SUBMISSION_DATE), toDate));
			}

			cq.where(cb.and(predicates.toArray(new Predicate[0])));
			cq.orderBy(cb.desc(root.get(CREATE_TIMESTAMP)));

			return session.createQuery(cq).getResultList();
		});
	}

	@Override
	public List<CoiDeclaration> findAllDeclarationsByPerson(String personId) {
		return hibernateTemplate.execute(session -> {
			CriteriaBuilder cb = session.getCriteriaBuilder();
			CriteriaQuery<CoiDeclaration> cq = cb.createQuery(CoiDeclaration.class);
			Root<CoiDeclaration> root = cq.from(CoiDeclaration.class);

			cq.where(cb.equal(root.get(PERSON_ID), personId));
			cq.orderBy(cb.desc(root.get(VERSION_NUMBER)));

			return session.createQuery(cq).getResultList();
		});
	}

	@Override
	public List<CoiDeclActionLog> getActionLogsByDeclarationId(Integer declarationId) {
		return hibernateTemplate.execute(session -> {
			CriteriaBuilder cb = session.getCriteriaBuilder();
			CriteriaQuery<CoiDeclActionLog> cq = cb.createQuery(CoiDeclActionLog.class);
			Root<CoiDeclActionLog> root = cq.from(CoiDeclActionLog.class);

			cq.where(cb.equal(root.get(DECLARATION_ID), declarationId));
			cq.orderBy(cb.desc(root.get(CREATE_TIMESTAMP)));

			return session.createQuery(cq).getResultList();
		});
	}

	@Override
	public boolean existsDeclarationByParams(String personId, String declarationTypeCode) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("SELECT case when (count(c.declarationId) > 0) then true else false end ");
		hqlQuery.append("FROM CoiDeclaration c WHERE  c.personId = :personId AND c.declarationStatusCode = :declarationStatusCode ");
        hqlQuery.append("AND c.declarationTypeCode = :declarationTypeCode");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("personId", personId);
		query.setParameter("declarationStatusCode", Constants.COI_DECLARATION_APPROVAL_STATUS_PENDING);
        query.setParameter("declarationTypeCode", declarationTypeCode);
		return (boolean)query.getSingleResult();
	}

	@Override
	public CoiDeclaration getPreviousDeclarationVersion(String declarationNumber, Integer versionNumber) {
		return hibernateTemplate.execute(session -> {
			CriteriaBuilder builder = session.getCriteriaBuilder();
			CriteriaQuery<CoiDeclaration> previousDisclosureQuery = builder.createQuery(CoiDeclaration.class);
			Root<CoiDeclaration> previousRoot = previousDisclosureQuery.from(CoiDeclaration.class);

			previousDisclosureQuery.select(previousRoot).where(
					builder.equal(previousRoot.get(DECLARATION_NUMBER), declarationNumber),
					builder.equal(previousRoot.get(VERSION_NUMBER), versionNumber - 1));

			try {
				return session.createQuery(previousDisclosureQuery).getSingleResult();
			} catch (NoResultException e) {
				return null;
			}
		});
	}

	@Override
	public List<Integer> getDaysToDueDateByNotificationId(Integer notificationId) {
		return hibernateTemplate.execute(session -> {
			CriteriaBuilder cb = session.getCriteriaBuilder();
			CriteriaQuery<Integer> cq = cb.createQuery(Integer.class);
			Root<ReminderNotification> root = cq.from(ReminderNotification.class);

			// Select daysToDueDate
			cq.select(root.get("daysToDueDate")).where(
					cb.and(cb.equal(root.get(NOTIFICATION_ID), notificationId), cb.isTrue(root.get("isActive"))));

			return session.createQuery(cq).getResultList();
		});
	}

	@Override
	public List<CoiDeclaration> findLatestDeclarationsByPersonId(String personId) {
		try {
			return hibernateTemplate.execute(session -> {
				CriteriaBuilder cb = session.getCriteriaBuilder();
				CriteriaQuery<CoiDeclaration> cq = cb.createQuery(CoiDeclaration.class);
				Root<CoiDeclaration> root = cq.from(CoiDeclaration.class);

				Predicate personPredicate = cb.equal(root.get("personId"), personId);
				Predicate statusPredicate = root.get("versionStatus").in("ACTIVE", "PENDING");

				Subquery<Integer> subquery = cq.subquery(Integer.class);
				Root<CoiDeclaration> subRoot = subquery.from(CoiDeclaration.class);
				subquery.select(cb.max(subRoot.get("versionNumber")));
				subquery.where(cb.equal(subRoot.get("personId"), root.get("personId")),
						cb.equal(subRoot.get("declarationTypeCode"), root.get("declarationTypeCode")),
						cb.equal(subRoot.get("versionStatus"), root.get("versionStatus")));

				cq.select(root).where(personPredicate, statusPredicate, cb.equal(root.get("versionNumber"), subquery));

				return session.createQuery(cq).getResultList();
			});
		} catch (Exception e) {
			throw new RuntimeException("Error fetching latest ACTIVE and PENDING declarations grouped by type", e);
		}
	}

	@Override
	public boolean isSameAdminPersonOrGroupAdded(Integer adminGroupId, String adminPersonId, Integer declarationId) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("SELECT case when (count(c.declarationId) > 0) then true else false end ");
		hqlQuery.append("FROM CoiDeclaration c WHERE  c.adminPersonId = :adminPersonId ");
		if (adminGroupId != null)
			hqlQuery.append("AND c.adminGroupId = :adminGroupId ") ;
		hqlQuery.append("AND c.declarationId = : declarationId");
		Query query = session.createQuery(hqlQuery.toString());
		if (adminGroupId != null)
			query.setParameter("adminGroupId", adminGroupId);
		query.setParameter("adminPersonId", adminPersonId);
		query.setParameter("declarationId", declarationId);
		return (boolean)query.getSingleResult();
	}

	@Override
	public boolean isAdminPersonOrGroupAdded(Integer declarationId) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("SELECT case when (count(c.declarationId) > 0) then false else true end ");
		hqlQuery.append("FROM CoiDeclaration c WHERE  c.adminPersonId is null AND c.adminGroupId is null ");
		hqlQuery.append("AND c.declarationId = : declarationId");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("declarationId", declarationId);
		return (boolean)query.getSingleResult();
	}

	@Override
	public boolean isDeclarationWithStatuses(List<String> reviewStatusCodes, Integer declarationId) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("SELECT case when (count(d.declarationId) > 0) then true else false end FROM CoiDeclaration d WHERE ");
		if (reviewStatusCodes != null && !reviewStatusCodes.isEmpty()) {
			hqlQuery.append(" d.reviewStatusCode IN (:reviewStatusCodes) AND ");
		}
		hqlQuery.append("d.declarationId = :declarationId ");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("declarationId",declarationId);
		if (reviewStatusCodes != null && !reviewStatusCodes.isEmpty()) {
			query.setParameter("reviewStatusCodes", reviewStatusCodes);
		}
		return (boolean) query.getSingleResult();
	}

	@Override
	public Timestamp assignAdmin(DeclarationRequestDto assignAdminDto, String reviewStatusCode) {
		Timestamp timesStamp = commonDao.getCurrentTimestamp();
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("UPDATE CoiDeclaration d SET d.adminGroupId = :adminGroupId, ");
		hqlQuery.append("d.adminPersonId = :adminPersonId, d.updateTimestamp = :updateTimestamp, ");
		hqlQuery.append("d.reviewStatusCode = :reviewStatusCode, ");
		hqlQuery.append("d.updatedBy = :updatedBy ");
		hqlQuery.append("WHERE d.declarationId = :declarationId");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("declarationId",assignAdminDto.getDeclarationId());
		query.setParameter("adminGroupId", assignAdminDto.getAdminGroupId());
		query.setParameter("adminPersonId", assignAdminDto.getAdminPersonId());
		query.setParameter("reviewStatusCode", reviewStatusCode);
		query.setParameter("updateTimestamp", timesStamp);
		query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
		query.executeUpdate();
		return timesStamp;
	}

	@Override
	public Timestamp updateDeclarationStatues(Integer declarationId, String declarationStatusCode, String reviewStatusCode,
											  String versionStatus, boolean isSubmission, Timestamp expirationDate) {
		Timestamp timesStamp = commonDao.getCurrentTimestamp();
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("UPDATE CoiDeclaration d SET d.declarationStatusCode = :declarationStatusCode, ");
		hqlQuery.append("d.reviewStatusCode = :reviewStatusCode, ");
		if (isSubmission) {
			hqlQuery.append("d.submissionDate = :submissionDate, ");
		}
		if (expirationDate != null) {
			hqlQuery.append("d.expirationDate = :expirationDate, ");
		}
		hqlQuery.append("d.versionStatus = :versionStatus, ");
		hqlQuery.append("d.updateTimestamp = :updateTimestamp, ");
		hqlQuery.append("d.updatedBy = :updatedBy ");
		hqlQuery.append("WHERE d.declarationId = :declarationId");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("declarationId", declarationId);
		query.setParameter("reviewStatusCode", reviewStatusCode);
		query.setParameter("declarationStatusCode", declarationStatusCode);
		query.setParameter("versionStatus", versionStatus);
		query.setParameter("updateTimestamp", timesStamp);
		query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
		if (isSubmission) {
			query.setParameter("submissionDate", timesStamp);
		}
		if (expirationDate != null) {
			query.setParameter("expirationDate", expirationDate);
		}
		query.executeUpdate();
		return timesStamp;
	}

	@Override
	public Timestamp returnOrWithdrawDeclaration(String reviewStatusCode, Integer declarationId) {
		Timestamp timesStamp = commonDao.getCurrentTimestamp();
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("UPDATE CoiDeclaration d SET d.reviewStatusCode = :reviewStatusCode, ");
		hqlQuery.append("d.updateTimestamp = :updateTimestamp, ");
		hqlQuery.append("d.updatedBy = :updatedBy, ");
		hqlQuery.append("d.submissionDate = null, ");
        hqlQuery.append("d.expirationDate = null ");
		hqlQuery.append("WHERE d.declarationId = :declarationId");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("declarationId", declarationId);
		query.setParameter("reviewStatusCode", reviewStatusCode);
		query.setParameter("updateTimestamp", timesStamp);
		query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
		query.executeUpdate();
		return timesStamp;
	}

	@Override
	public boolean isReviewRequiredBasedonFormAns(Integer declarationId) {
		try {
			Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
			SessionImpl sessionImpl = (SessionImpl) session;
			Connection connection = sessionImpl.connection();
			CallableStatement statement  = connection.prepareCall("{call GET_COI_DECLARATION_DETAIL_INTEG(?)}");
			statement.setInt(1, declarationId);
			statement.execute();
			ResultSet rset = statement.getResultSet();
			if (rset!= null && rset.next()) {
				return rset.getBoolean("REVIEW_REQUIRED");
			}
			throw new ApplicationException("No data found while fetching review required details", Constants.JAVA_ERROR);
		} catch (Exception e) {
			log.error("Exception on isReviewRequiredBasedonFormAns {}", e.getMessage());
			throw new ApplicationException("Unable to Declaration review required details", e, Constants.JAVA_ERROR);
		}
	}

	@Override
	public CoiDeclarationReviewStatusType getReviewStatusTypeByCode(String reviewStatusCode) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("SELECT r FROM CoiDeclarationReviewStatusType r ");
		hqlQuery.append("WHERE r.reviewStatusCode = :reviewStatusCode");
		TypedQuery<CoiDeclarationReviewStatusType> query = session.createQuery(hqlQuery.toString(), CoiDeclarationReviewStatusType.class);
		query.setParameter("reviewStatusCode", reviewStatusCode);
		return query.getSingleResult();
	}

    @Override
    public CoiDeclarationStatus getDeclarationStatusTypeByCode(String declarationStatusCode) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT r FROM CoiDeclarationStatus r ");
        hqlQuery.append("WHERE r.declarationStatusCode = :declarationStatusCode");
        TypedQuery<CoiDeclarationStatus> query = session.createQuery(hqlQuery.toString(), CoiDeclarationStatus.class);
        query.setParameter("declarationStatusCode", declarationStatusCode);
        return query.getSingleResult();
    }

	@Override
	public CoiDeclarationReviewStatusType findByReviewStatusCode(String reviewStatusCode) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CoiDeclarationReviewStatusType reviewStatus = session.find(CoiDeclarationReviewStatusType.class, reviewStatusCode);
		return reviewStatus;
	}

    @Override
    public boolean canCreateDeclaration(String personId, String declarationTypeCode) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        CallableStatement statement = null;
        try {
            String functionName = "FN_CHK_CAN_CREATE_DECLARATION";
            String functionCall = "{ ? = call " + functionName + "(?,?) }";
            statement = connection.prepareCall(functionCall);
            statement.registerOutParameter(1, OracleTypes.BOOLEAN);
            statement.setString(2, personId);
            statement.setString(3, declarationTypeCode);
            statement.execute();
            return statement.getBoolean(1);
        } catch (SQLException e) {
            throw new ApplicationException(e.getMessage(),e, Constants.DB_PROC_ERROR);
        }
    }

    @Override
    public boolean isDeclarationWithApprovalStatuses(List<String> declarationStatusCodes, Integer declarationId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT case when (count(d.declarationId) > 0) then true else false end FROM CoiDeclaration d WHERE ");
        hqlQuery.append(" d.declarationStatusCode IN (:declarationStatusCodes) AND ");
        hqlQuery.append("d.declarationId = :declarationId ");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("declarationId", declarationId);
        query.setParameter("declarationStatusCodes", declarationStatusCodes);
        return (boolean) query.getSingleResult();
    }

    @Override
    public Integer getNextVersionNumber(String declarationNumber) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT MAX(c.versionNumber)+1 FROM CoiDeclaration c WHERE c.declarationNumber = :declarationNumber ");
        TypedQuery<Integer> query = session.createQuery(hqlQuery.toString());
        query.setParameter("declarationNumber", declarationNumber);
        return  query.getSingleResult();
    }

    @Override
    public Timestamp archivePreviousVersionBasedOnStatus(String declarationNumber, Integer currentVersionNumber, String versionStatus) {
        Timestamp timesStamp = commonDao.getCurrentTimestamp();
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("UPDATE CoiDeclaration d SET d.versionStatus = :archieveStatus, ");
        hqlQuery.append("d.updateTimestamp = :updateTimestamp, ");
        hqlQuery.append("d.updatedBy = :updatedBy ");
        hqlQuery.append("WHERE d.versionNumber != :currentVersionNumber ");
        hqlQuery.append("AND d.declarationNumber = :declarationNumber ");
        hqlQuery.append("AND d.versionStatus = :versionStatus");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("declarationNumber", declarationNumber);
        query.setParameter("currentVersionNumber", currentVersionNumber);
        query.setParameter("updateTimestamp", timesStamp);
        query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
        query.setParameter("versionStatus", versionStatus);
        query.setParameter("archieveStatus", Constants.COI_ARCHIVE_STATUS);
        query.executeUpdate();
        return timesStamp;
    }
}
