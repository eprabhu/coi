package com.polus.fibicomp.matrix.dao;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.persistence.EntityManager;
import javax.persistence.ParameterMode;
import javax.persistence.PersistenceContext;
import javax.persistence.StoredProcedureQuery;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaDelete;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.CriteriaUpdate;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.matrix.pojo.CoiMatrixAnswer;
import com.polus.fibicomp.matrix.pojo.CoiMatrixQuestion;
import com.polus.fibicomp.matrix.pojo.MatrixPersonRelMapping;

@Repository
@Transactional
public class MatrixDaoImpl implements MatrixDao {

	@PersistenceContext
	private EntityManager entityManager;

	@Override
	public List<CoiMatrixQuestion> fetchMatrixQuestion() {
	    CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
	    CriteriaQuery<CoiMatrixQuestion> criteriaQuery = criteriaBuilder.createQuery(CoiMatrixQuestion.class);
	    Root<CoiMatrixQuestion> root = criteriaQuery.from(CoiMatrixQuestion.class);
	    criteriaQuery.select(root);
	    TypedQuery<CoiMatrixQuestion> query = entityManager.createQuery(criteriaQuery);
	    return query.getResultList();
	}

	@Override
	public List<MatrixPersonRelMapping> fetchMatrixPersonRelMapping() {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
	    CriteriaQuery<MatrixPersonRelMapping> criteriaQuery = criteriaBuilder.createQuery(MatrixPersonRelMapping.class);
	    Root<MatrixPersonRelMapping> root = criteriaQuery.from(MatrixPersonRelMapping.class);
	    criteriaQuery.select(root);
	    TypedQuery<MatrixPersonRelMapping> query = entityManager.createQuery(criteriaQuery);
	    return query.getResultList();
	}

	@Override
	public List<CoiMatrixAnswer> fetchMatrixAnswer(Integer personEntityId) {
	    CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
	    CriteriaQuery<CoiMatrixAnswer> criteriaQuery = criteriaBuilder.createQuery(CoiMatrixAnswer.class);
	    Root<CoiMatrixAnswer> root = criteriaQuery.from(CoiMatrixAnswer.class);
	    Predicate condition = criteriaBuilder.equal(root.get("personEntityId"), personEntityId);
	    criteriaQuery.select(root).where(condition);
	    TypedQuery<CoiMatrixAnswer> query = entityManager.createQuery(criteriaQuery);
	    return query.getResultList();
	}

	@Override
	public CoiMatrixAnswer saveMatrixQuestion(CoiMatrixAnswer answer) {
		CoiMatrixAnswer managed = entityManager.merge(answer);
	    return managed;
	}

	@Override
	public void updateMatrixQuestion(CoiMatrixAnswer answer) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaUpdate<CoiMatrixAnswer> criteriaUpdate = criteriaBuilder.createCriteriaUpdate(CoiMatrixAnswer.class);
		Root<CoiMatrixAnswer> root = criteriaUpdate.from(CoiMatrixAnswer.class);
		criteriaUpdate.set(root.get("updatedBy"), answer.getUpdatedBy());
		criteriaUpdate.set(root.get("updateTimestamp"), answer.getUpdateTimestamp());
		criteriaUpdate.set(root.get("columnValue"), answer.getColumnValue());
		criteriaUpdate.set(root.get("comments"), answer.getComments());
		criteriaUpdate.where(criteriaBuilder.equal(root.get("matrixAnswerId"), answer.getMatrixAnswerId()));
		entityManager.createQuery(criteriaUpdate).executeUpdate();
	}

	@Override
	public void deleteMatrixQuestion(CoiMatrixAnswer answer) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
	    CriteriaDelete<CoiMatrixAnswer> criteriaDelete = criteriaBuilder.createCriteriaDelete(CoiMatrixAnswer.class);
	    Root<CoiMatrixAnswer> root = criteriaDelete.from(CoiMatrixAnswer.class);
	    criteriaDelete.where(criteriaBuilder.equal(root.get("matrixAnswerId"), answer.getMatrixAnswerId()));
	    entityManager.createQuery(criteriaDelete).executeUpdate();
	}

	@SuppressWarnings("unchecked")
	@Override
	public Map<String, Object> evaluateRelationship(Integer personEntityId) {
		StoredProcedureQuery query = entityManager.createStoredProcedureQuery("EVALUATE_PER_ENT_MATRIX")
				.registerStoredProcedureParameter(1, Integer.class, ParameterMode.IN)
				.registerStoredProcedureParameter(2, String.class, ParameterMode.IN);
		query.setParameter(1, personEntityId);
		query.setParameter(2, AuthenticatedUser.getLoginPersonId());
		query.execute();
		List<Object[]> result = query.getResultList();
		Map<String, Object> evaluationResult = new HashMap<>();
		if (!result.isEmpty()) {
			Object[] row = result.get(0);
			evaluationResult.put("MESSAGE", row[0]);
			evaluationResult.put("DISCLOSURE_ID", row[1]);
			evaluationResult.put("REVIEW_STATUS_CODE", row[2]);
		}
		return evaluationResult;
	}

	@Override
	public void deleteMatrixAnswer(Integer personEntityId) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
	    CriteriaDelete<CoiMatrixAnswer> criteriaDelete = criteriaBuilder.createCriteriaDelete(CoiMatrixAnswer.class);
	    Root<CoiMatrixAnswer> root = criteriaDelete.from(CoiMatrixAnswer.class);
	    criteriaDelete.where(criteriaBuilder.equal(root.get("personEntityId"), personEntityId));
	    entityManager.createQuery(criteriaDelete).executeUpdate();
	}

	@Override
	public void copyMatrixAnswers(Integer orgPersonEntityId, Integer copyPersonEntityId) {
		StringBuilder hql = new StringBuilder().append("INSERT INTO CoiMatrixAnswer (")
				.append("personEntityId, personEntityNumber, matrixQuestionId, columnValue, ")
				.append("relationshipTypeCode, comments, updateTimestamp, updatedBy) ")
				.append("SELECT ")
				.append(":copyPersonEntityId, personEntityNumber, matrixQuestionId, columnValue, ")
				.append("relationshipTypeCode, comments, updateTimestamp, updatedBy ")
				.append("FROM CoiMatrixAnswer ")
				.append("WHERE personEntityId = :orgPersonEntityId");
		entityManager.createQuery(hql.toString()).setParameter("copyPersonEntityId", copyPersonEntityId)
				.setParameter("orgPersonEntityId", orgPersonEntityId).executeUpdate();
	}

	@Override
	public void evaluateMatrixData(CoiMatrixAnswer answer) {
		StoredProcedureQuery query = entityManager.createStoredProcedureQuery("EVALUATE_PER_ENT_MATRIX")
				.registerStoredProcedureParameter(1, Integer.class, ParameterMode.IN)
				.registerStoredProcedureParameter(2, String.class, ParameterMode.IN);
		query.setParameter(1, answer.getPersonEntityId());
		query.setParameter(2, AuthenticatedUser.getLoginPersonId());
		query.execute();
	}

}
