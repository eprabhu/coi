package com.polus.fibicomp.cmp.dao;

import java.sql.Timestamp;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import javax.persistence.LockModeType;
import javax.persistence.ParameterMode;
import javax.persistence.StoredProcedureQuery;
import javax.persistence.Tuple;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;

import org.hibernate.Session;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.fibicomp.cmp.pojo.CoiManagementPlan;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanActionType;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanAttaType;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanCounter;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanEntityRel;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanProjectRel;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanRecipient;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanSectionComp;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanSectionRel;
import com.polus.fibicomp.cmp.pojo.CoiMgmtPlanAvailableAction;
import com.polus.fibicomp.cmp.pojo.CoiMgmtPlanSecCompHist;
import com.polus.fibicomp.cmp.pojo.CoiMgmtPlanSecCompLock;
import com.polus.fibicomp.cmp.pojo.CoiMgmtPlanSecRelHist;
import com.polus.fibicomp.coi.dto.ProjectSummaryDto;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class CoiManagementPlanDaoImpl implements CoiManagementPlanDao {

	private final HibernateTemplate hibernateTemplate;

	@Override
	public synchronized Integer generateNextCmpNumber() {
		return hibernateTemplate.execute(session -> {
			CriteriaBuilder cb = session.getCriteriaBuilder();
			CriteriaQuery<CoiManagementPlanCounter> cq = cb.createQuery(CoiManagementPlanCounter.class);
			Root<CoiManagementPlanCounter> root = cq.from(CoiManagementPlanCounter.class);
			cq.where(cb.equal(root.get("counterName"), "COI_MANAGEMENT_PLAN_NUMBER_COUNTER"));
			CoiManagementPlanCounter counter = session.createQuery(cq).setLockMode(LockModeType.PESSIMISTIC_WRITE)
					.uniqueResult();
			if (counter == null) {
				throw new RuntimeException("CMP Number Counter not found");
			}
			Integer currentValue = counter.getCounterValue();
			counter.setCounterValue(currentValue + 1);
			session.update(counter);
			return currentValue;
		});
	}

	@Override
	public CoiManagementPlanEntityRel saveEntityRelation(CoiManagementPlanEntityRel entityRel) {
		hibernateTemplate.save(entityRel);
		return entityRel;
	}

	@Override
	public CoiManagementPlanProjectRel saveProjectRelation(CoiManagementPlanProjectRel projectRel) {
		hibernateTemplate.save(projectRel);
		return projectRel;
	}

	@Override
	public CoiManagementPlanSectionRel saveSectionRelation(CoiManagementPlanSectionRel sectionRel) {
		hibernateTemplate.save(sectionRel);
		return sectionRel;
	}

	@Override
	public CoiMgmtPlanSecRelHist saveSectionRelationHistory(CoiMgmtPlanSecRelHist history) {
		hibernateTemplate.save(history);
		return history;
	}

	@Override
	public CoiManagementPlanSectionComp saveSectionComponent(CoiManagementPlanSectionComp comp) {
		hibernateTemplate.save(comp);
		return comp;
	}

	@Override
	public CoiMgmtPlanSecCompHist saveSectionComponentHistory(CoiMgmtPlanSecCompHist history) {
		hibernateTemplate.save(history);
		return history;
	}

	@Override
	public CoiManagementPlan saveCmp(CoiManagementPlan cmp) {
		hibernateTemplate.saveOrUpdate(cmp);
		return cmp;
	}

	@Override
	public void deleteEntityRelations(Integer cmpId) {
		hibernateTemplate.execute(session -> {
			session.createQuery("delete from CoiManagementPlanEntityRel where cmpId = :cmpId")
					.setParameter("cmpId", cmpId).executeUpdate();
			return null;
		});
	}

	@Override
	public void deleteProjectRelations(Integer cmpId) {
		hibernateTemplate.execute(session -> {
			session.createQuery("delete from CoiManagementPlanProjectRel where cmpId = :cmpId")
					.setParameter("cmpId", cmpId).executeUpdate();
			return null;
		});
	}

	@Override
	public List<CoiManagementPlanAttaType> getCmpAttachTypes() {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<CoiManagementPlanAttaType> query = builder.createQuery(CoiManagementPlanAttaType.class);
		Root<CoiManagementPlanAttaType> root = query.from(CoiManagementPlanAttaType.class);
		query.where(builder.equal(root.get("isActive"), true));
		query.orderBy(builder.desc(root.get("updateTimestamp")));
		return session.createQuery(query).getResultList();
	}

	@Override
	public CoiMgmtPlanSecCompLock getSectionCompLock(Integer secCompId) {
		return hibernateTemplate.execute(session -> session.get(CoiMgmtPlanSecCompLock.class, secCompId));
	}

	@Override
	public void insertSectionCompLock(Integer secCompId, String lockedBy, Timestamp lockedAt) {
		hibernateTemplate.execute(session -> {
			CoiMgmtPlanSecCompLock lock = new CoiMgmtPlanSecCompLock();
			lock.setSecCompId(secCompId);
			lock.setLockedBy(lockedBy);
			lock.setLockedAt(lockedAt);
			session.save(lock);
			return null;
		});
	}

	@Override
	public void updateSectionCompLock(Integer secCompId, String lockedBy, Timestamp lockedAt) {
		hibernateTemplate.execute(session -> {
			session.createQuery(
					"update CoiMgmtPlanSecCompLock " + "set lockedBy = :by, lockedAt = :at " + "where secCompId = :id")
					.setParameter("by", lockedBy).setParameter("at", lockedAt).setParameter("id", secCompId)
					.executeUpdate();
			return null;
		});
	}

	@Override
	public void deleteSectionCompLock(Integer secCompId, String lockedBy) {
		hibernateTemplate.execute(session -> {
			session.createQuery("delete from CoiMgmtPlanSecCompLock where secCompId = :id and lockedBy = :by")
					.setParameter("id", secCompId).setParameter("by", lockedBy).executeUpdate();
			return null;
		});
	}

	@Override
	public void updateLockedAt(Integer secCompId, Timestamp lockedAt) {
		hibernateTemplate.execute(session -> {
			session.createQuery("update CoiMgmtPlanSecCompLock " + "set lockedAt = :at " + "where secCompId = :id")
					.setParameter("at", lockedAt).setParameter("id", secCompId).executeUpdate();
			return null;
		});
	}

	@Override
	public List<CoiManagementPlanSectionRel> getSectionRelationsByCmpId(Integer cmpId) {
		return hibernateTemplate.execute(session -> session.createQuery(
				"FROM CoiManagementPlanSectionRel WHERE cmpId = :cmpId ORDER BY sortOrder, cmpSectionRelId",
				CoiManagementPlanSectionRel.class).setParameter("cmpId", cmpId).list());
	}

	@Override
	public List<CoiManagementPlanSectionComp> getSectionComponentsBySectionRelIds(List<Integer> cmpSectionRelIds) {
		if (cmpSectionRelIds == null || cmpSectionRelIds.isEmpty()) {
			return Collections.emptyList();
		}
		return hibernateTemplate.execute(session -> session.createQuery(
				"FROM CoiManagementPlanSectionComp WHERE cmpSectionRelId IN (:ids) ORDER BY sortOrder, secCompId",
				CoiManagementPlanSectionComp.class).setParameterList("ids", cmpSectionRelIds).list());
	}

	@Override
	public List<CoiManagementPlanEntityRel> getEntityRelationsByCmpId(Integer cmpId) {
		return hibernateTemplate.execute(session -> session
				.createQuery("FROM CoiManagementPlanEntityRel WHERE cmpId = :cmpId", CoiManagementPlanEntityRel.class)
				.setParameter("cmpId", cmpId).list());
	}

	@Override
	public List<CoiManagementPlanProjectRel> getProjectRelationsByCmpId(Integer cmpId) {
		return hibernateTemplate.execute(session -> session
				.createQuery("FROM CoiManagementPlanProjectRel WHERE cmpId = :cmpId", CoiManagementPlanProjectRel.class)
				.setParameter("cmpId", cmpId).list());
	}

	@Override
	public ProjectSummaryDto getAwardSummary(String projectNumber) {
		return hibernateTemplate.execute(session -> {
			List<Tuple> rows = session
					.createNativeQuery("SELECT PROJECT_NUMBER, TITLE, LEAD_UNIT_NUMBER, LEAD_UNIT_NAME, "
							+ "SPONSOR_CODE, SPONSOR_NAME, PRIME_SPONSOR_CODE, PRIME_SPONSOR_NAME, "
							+ "PROJECT_STATUS, PROJECT_START_DATE, PROJECT_END_DATE, ACCOUNT_NUMBER "
							+ "FROM COI_INT_STAGE_AWARD WHERE PROJECT_NUMBER = :projectNumber", Tuple.class)
					.setParameter("projectNumber", projectNumber).getResultList();
			if (rows.isEmpty())
				return null;
			Tuple t = rows.get(0);
			return ProjectSummaryDto.builder().projectNumber(t.get(0, String.class))
					.projectTitle(t.get(1, String.class)).homeUnitNumber(t.get(2, String.class))
					.homeUnitName(t.get(3, String.class)).sponsorCode(t.get(4, String.class))
					.sponsorName(t.get(5, String.class)).primeSponsorCode(t.get(6, String.class))
					.primeSponsorName(t.get(7, String.class)).projectStatus(t.get(8, String.class))
					.projectStartDate(t.get(9, Date.class)).projectEndDate(t.get(10, Date.class))
					.accountNumber(t.get(11, String.class)).projectType("Award").build();
		});
	}

	@Override
	public ProjectSummaryDto getProposalSummary(String proposalNumber) {
		return hibernateTemplate.execute(session -> {
			List<Tuple> rows = session
					.createNativeQuery("SELECT PROPOSAL_NUMBER, TITLE, LEAD_UNIT, LEAD_UNIT_NAME, "
							+ "SPONSOR_CODE, SPONSOR, PRIME_SPONSOR_CODE, PRIME_SPONSOR, "
							+ "PROPOSAL_STATUS, PROPOSAL_START_DATE, PROPOSAL_END_DATE "
							+ "FROM COI_INT_STAGE_DEV_PROPOSAL WHERE PROPOSAL_NUMBER = :p", Tuple.class)
					.setParameter("p", proposalNumber).getResultList();
			if (rows.isEmpty())
				return null;
			Tuple t = rows.get(0);
			return ProjectSummaryDto.builder().projectNumber(t.get(0, String.class))
					.projectTitle(t.get(1, String.class)).homeUnitNumber(t.get(2, String.class))
					.homeUnitName(t.get(3, String.class)).sponsorCode(t.get(4, String.class))
					.sponsorName(t.get(5, String.class)).primeSponsorCode(t.get(6, String.class))
					.primeSponsorName(t.get(7, String.class)).projectStatus(t.get(8, String.class))
					.projectStartDate(t.get(9, Date.class)).projectEndDate(t.get(10, Date.class))
					.projectType("Proposal").build();
		});
	}

	@Override
	public void deleteSectionComponentHistory(Integer secCompId) {
		hibernateTemplate.execute(session -> {
			session.createQuery("delete from CoiMgmtPlanSecCompHist where secCompId = :id")
					.setParameter("id", secCompId).executeUpdate();
			return null;
		});
	}

	@Override
	public void deleteSectionComponentsByRelId(Integer cmpSectionRelId) {
		hibernateTemplate.execute(session -> {
			session.createQuery("delete from CoiManagementPlanSectionComp where cmpSectionRelId = :relId")
					.setParameter("relId", cmpSectionRelId).executeUpdate();
			return null;
		});
	}

	@Override
	public void deleteSectionRelationHistory(Integer cmpSectionRelId) {
		hibernateTemplate.execute(session -> {
			session.createQuery("delete from CoiMgmtPlanSecRelHist where cmpSectionRelId = :relId")
					.setParameter("relId", cmpSectionRelId).executeUpdate();
			return null;
		});
	}

	@Override
	public void deleteSectionRelation(Integer cmpSectionRelId) {
		hibernateTemplate.execute(session -> {
			session.createQuery("delete from CoiManagementPlanSectionRel where cmpSectionRelId = :relId")
					.setParameter("relId", cmpSectionRelId).executeUpdate();
			return null;
		});
	}

	@Override
	public CoiManagementPlanSectionRel getSectionRelationById(Integer cmpSectionRelId) {
		return hibernateTemplate.execute(session -> session.get(CoiManagementPlanSectionRel.class, cmpSectionRelId));
	}

	@Override
	public void deleteSectionRelationHistoryByCmpId(Integer cmpId) {
		hibernateTemplate.execute(session -> {
			session.createQuery("delete from CoiMgmtPlanSecRelHist where cmpId = :cmpId").setParameter("cmpId", cmpId)
					.executeUpdate();
			return null;
		});
	}

	@Override
	public void deleteSectionRelationsByCmpId(Integer cmpId) {
		hibernateTemplate.execute(session -> {
			session.createQuery("delete from CoiManagementPlanSectionRel where cmpId = :cmpId")
					.setParameter("cmpId", cmpId).executeUpdate();
			return null;
		});
	}

	@Override
	public void deleteCmp(Integer cmpId) {
		hibernateTemplate.execute(session -> {
			session.createQuery("delete from CoiManagementPlan where cmpId = :cmpId").setParameter("cmpId", cmpId)
					.executeUpdate();
			return null;
		});
	}

	@Override
	public CoiManagementPlan getCmpById(Integer cmpId) {
		return hibernateTemplate.execute(session -> session.get(CoiManagementPlan.class, cmpId));
	}

	@Override
	public CoiManagementPlanSectionComp getSectionComponentById(Integer secCompId) {
		return hibernateTemplate.execute(session -> session.get(CoiManagementPlanSectionComp.class, secCompId));
	}

	@Override
	public void deleteSectionComponent(Integer secCompId) {
		hibernateTemplate.execute(session -> {
			session.createQuery("delete from CoiManagementPlanSectionComp where secCompId = :id")
					.setParameter("id", secCompId).executeUpdate();
			return null;
		});
	}

	@Override
	public List<ProjectSummaryDto> getProjectSummaryDetails(Integer moduleCode, String personId, String searchText) {
		return hibernateTemplate.execute(session -> {
			StoredProcedureQuery sp = session.createStoredProcedureQuery("GET_COI_PROJECT_SUMMARY")
					.registerStoredProcedureParameter("LI_MODULE_CODE", Integer.class, ParameterMode.IN)
					.registerStoredProcedureParameter("LS_PERSON_ID", String.class, ParameterMode.IN)
					.registerStoredProcedureParameter("LS_SEARCH_TEXT", String.class, ParameterMode.IN)
					.setParameter("LI_MODULE_CODE", moduleCode).setParameter("LS_PERSON_ID", personId)
					.setParameter("LS_SEARCH_TEXT", searchText == null ? "" : searchText);
			sp.execute();
			List<?> rows = sp.getResultList();
			return rows.stream().map(row -> mapToProjectSummary((Object[]) row)).collect(Collectors.toList());
		});
	}

	private ProjectSummaryDto mapToProjectSummary(Object[] t) {
		return ProjectSummaryDto.builder().projectNumber((String) t[0]).projectTitle((String) t[1])
				.homeUnitNumber((String) t[2]).homeUnitName((String) t[3]).sponsorCode((String) t[4])
				.sponsorName((String) t[5]).primeSponsorCode((String) t[6]).primeSponsorName((String) t[7])
				.projectStatus((String) t[8]).projectStartDate((Date) t[9]).projectEndDate((Date) t[10])
				.accountNumber((String) t[11]).projectType((String) t[12]).build();
	}

	@Override
	public List<CoiMgmtPlanSecRelHist> getSectionRelHistory(Integer cmpSectionRelId) {
		return hibernateTemplate.execute(session -> session
				.createQuery("FROM CoiMgmtPlanSecRelHist " + "WHERE cmpSectionRelId = :id "
						+ "ORDER BY updateTimestamp DESC", CoiMgmtPlanSecRelHist.class)
				.setParameter("id", cmpSectionRelId).list());
	}

	@Override
	public List<CoiMgmtPlanSecCompHist> getSectionCompHistory(Integer secCompId) {
		return hibernateTemplate
				.execute(session -> session
						.createQuery("FROM CoiMgmtPlanSecCompHist " + "WHERE secCompId = :id "
								+ "ORDER BY updateTimestamp DESC", CoiMgmtPlanSecCompHist.class)
						.setParameter("id", secCompId).list());
	}

	@Override
	public CoiMgmtPlanAvailableAction getAvailableAction(Integer availableActionId) {
		return hibernateTemplate.get(CoiMgmtPlanAvailableAction.class, availableActionId);
	}

	@Override
	public CoiManagementPlanActionType getActionType(String actionTypeCode) {
		return hibernateTemplate.get(CoiManagementPlanActionType.class, actionTypeCode);
	}

	@Override
	public CoiManagementPlanRecipient saveRecipient(CoiManagementPlanRecipient r) {
		hibernateTemplate.saveOrUpdate(r);
		return r;
	}

	@Override
	public CoiManagementPlanRecipient getRecipientById(Integer id) {
		return hibernateTemplate.execute(session -> session.get(CoiManagementPlanRecipient.class, id));
	}

	@Override
	public List<CoiManagementPlanRecipient> getRecipientsByCmpId(Integer cmpId) {
		return hibernateTemplate.execute(session -> session
				.createQuery("FROM CoiManagementPlanRecipient WHERE cmpId = :cmpId ORDER BY signOrder, cmpRecipientId",
						CoiManagementPlanRecipient.class)
				.setParameter("cmpId", cmpId).list());
	}

	@Override
	public void deleteRecipient(Integer id) {
		hibernateTemplate.execute(session -> {
			session.createQuery("delete from CoiManagementPlanRecipient where cmpRecipientId = :id")
					.setParameter("id", id).executeUpdate();
			return null;
		});
	}

	@Override
	public CoiManagementPlanSectionRel getSectionByCmpSectionRelId(Integer cmpSectionRelId) {
		if (cmpSectionRelId == null) {
			return null;
		}
		return hibernateTemplate.get(CoiManagementPlanSectionRel.class, cmpSectionRelId);
	}

	@Override
	public CoiManagementPlanSectionComp getSectionCompBySecCompId(Integer secCompId) {
		if (secCompId == null) {
			return null;
		}
		return hibernateTemplate.get(CoiManagementPlanSectionComp.class, secCompId);
	}

}
