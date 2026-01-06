package com.polus.fibicomp.reviewcomments.dao;

import java.sql.Timestamp;
import java.util.Arrays;
import java.util.List;

import javax.persistence.Query;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.CriteriaUpdate;
import javax.persistence.criteria.Root;
import javax.persistence.criteria.Subquery;
import javax.transaction.Transactional;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Repository;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.coi.pojo.CoiReviewAttachment;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.reviewcomments.dto.ReviewCommentsCountDto;
import com.polus.fibicomp.reviewcomments.dto.ReviewCommentsDto;
import com.polus.fibicomp.reviewcomments.pojos.DisclComment;
import javax.persistence.criteria.Expression;

@Repository
@Transactional
public class ReviewCommentDaoImpl implements ReviewCommentDao {

    protected static Logger logger = LogManager.getLogger(ReviewCommentDaoImpl.class.getName());

    @Autowired
    private HibernateTemplate hibernateTemplate;

    private static final String GENERAL_COMMENTS = "3";
    private static final String QUESTIONNAIRE_COMMENTS = "4";
    private static final String SFI_COMMENTS = "5";
    private static final String PROJECT_RELATIONS_COMMENTS = "6";
    private static final String REVIEW_COMMENTS = "8";
    private static final String OPA_GENERAL_COMMENTS = "9";
    private static final String TRAVEL_DISCLOSURE_CONFLICT_COMMENTS = "2";
    private static final String OPA_FORM_COMMENTS = "10";
    private static final String OPA_REVIEW_COMMENTS = "11";
    private static final String CA_COMMENTS = "12";
    private static final String TRAVEL_GENERAL = "13";
    private static final String PROJECT_COMMENTS = "14";
    private static final String CMP_GENERAL_COMMENTS = "17";
    private static final String CMP_SECTION_COMMENTS = "18";
    private static final String CMP_SECTION_COMPONENT_COMMENTS = "19";
    private static final String CMP_RECIPIENTS_COMMENTS = "20";

    @Override
    public void saveObject(Object object) {
        hibernateTemplate.saveOrUpdate(object);
    }

    @Override
    public List<DisclComment> fetchReviewComments(ReviewCommentsDto reviewCommentsDto) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT rc FROM DisclComment rc WHERE rc.moduleCode = :moduleCode ");
        if (reviewCommentsDto.getSubModuleCode() != null) {
            hqlQuery.append("AND rc.subModuleCode = :subModuleCode ");
        }
        if (reviewCommentsDto.getModuleItemKey() != null) {
            hqlQuery.append("AND rc.moduleItemKey = :moduleItemKey ");
        } else {
            hqlQuery.append("AND rc.moduleItemNumber = :moduleItemNumber ");
        }
		if (reviewCommentsDto.getComponentTypeCode() != null) {
			if (OPA_FORM_COMMENTS.equals(reviewCommentsDto.getComponentTypeCode())
					|| SFI_COMMENTS.equals(reviewCommentsDto.getComponentTypeCode())) {
				hqlQuery.append("AND rc.subModuleItemNumber = :subModuleItemNumber ");
			} else {
				hqlQuery.append("AND rc.subModuleItemKey = :subModuleItemKey ");
			}
		}       
        if (reviewCommentsDto.getIsPrivate() != null) {
            hqlQuery.append("AND rc.isPrivate = :isPrivate ");
        }
        if (reviewCommentsDto.getCommentTypeCode() != null) {
            hqlQuery.append("AND rc.commentTypeCode = :commentTypeCode ");
        }
        if (reviewCommentsDto.getComponentTypeCode() != null) {
            hqlQuery.append("AND rc.componentTypeCode = :componentTypeCode ");
        } else {
            hqlQuery.append("AND rc.componentTypeCode NOT IN :componentTypeCodes ");
        }
        if (reviewCommentsDto.getFormBuilderId() != null) {
            hqlQuery.append("AND rc.formBuilderId = :formBuilderId ");
        }
        if (reviewCommentsDto.getFormBuilderSectionId() != null) {
            hqlQuery.append("AND rc.formBuilderSectionId = :formBuilderSectionId ");
            if (reviewCommentsDto.getFormBuilderComponentId() == null) {
                hqlQuery.append("AND rc.formBuilderComponentId IS NULL ");
            }
        }
        if (reviewCommentsDto.getFormBuilderComponentId() != null) {
            hqlQuery.append("AND rc.formBuilderComponentId = :formBuilderComponentId ");
        }
		if (Boolean.TRUE.equals(reviewCommentsDto.getRequirePersonPrivateComments())) {
			if (reviewCommentsDto.getCommentPersonId() != null) {
				hqlQuery.append(
						"OR (rc.commentPersonId = :commentPersonId AND rc.isPrivate = true and rc.parentCommentId IS null ");
			}
			if (reviewCommentsDto.getComponentTypeCode() != null) {
				hqlQuery.append("AND componentTypeCode =: componentTypeCode ");
			}
			if (reviewCommentsDto.getModuleItemKey() != null) {
				hqlQuery.append("AND moduleItemKey =: moduleItemKey ");
			} else if (reviewCommentsDto.getSubModuleItemNumber() != null) {
				hqlQuery.append("AND rc.subModuleItemNumber = :subModuleItemNumber ");
			}
			if (reviewCommentsDto.getSubModuleCode() != null) {
				hqlQuery.append("AND rc.subModuleCode = :subModuleCode ");
			}
			if (reviewCommentsDto.getModuleCode() != null) {
				hqlQuery.append("AND rc.moduleCode = :moduleCode ");
			}
			hqlQuery.append(
					"OR rc.parentCommentId IN (SELECT dc.commentId FROM DisclComment dc WHERE moduleCode = :moduleCode ");
			if (reviewCommentsDto.getCommentPersonId() != null) {
				hqlQuery.append("AND dc.commentPersonId = :commentPersonId AND isPrivate = true ))");
			}
		}
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("moduleCode", reviewCommentsDto.getModuleCode());
        if (reviewCommentsDto.getSubModuleCode() != null) {
            query.setParameter("subModuleCode", reviewCommentsDto.getSubModuleCode());
        }
        if (reviewCommentsDto.getModuleItemKey() != null) {
            query.setParameter("moduleItemKey", reviewCommentsDto.getModuleItemKey());
        } else {
            query.setParameter("moduleItemNumber", reviewCommentsDto.getModuleItemNumber());
        }      
		if (reviewCommentsDto.getComponentTypeCode() != null) {
			if (OPA_FORM_COMMENTS.equals(reviewCommentsDto.getComponentTypeCode())
					|| SFI_COMMENTS.equals(reviewCommentsDto.getComponentTypeCode())) {
				query.setParameter("subModuleItemNumber", reviewCommentsDto.getSubModuleItemNumber());
			} else {
				query.setParameter("subModuleItemKey", reviewCommentsDto.getSubModuleItemKey());
			}
		}
        if (reviewCommentsDto.getIsPrivate() != null) {
            query.setParameter("isPrivate", reviewCommentsDto.getIsPrivate());
        }
        if (reviewCommentsDto.getCommentTypeCode() != null) {
            query.setParameter("commentTypeCode", reviewCommentsDto.getCommentTypeCode());
        }
        if (reviewCommentsDto.getComponentTypeCode() != null) {
            query.setParameter("componentTypeCode", reviewCommentsDto.getComponentTypeCode());
        } else {
            query.setParameter("componentTypeCodes", Arrays.asList(Constants.COI_DISCL_CONFLICT_RELATION_COMPONENT_TYPE,
                    Constants.COI_TRAVEL_DISCL_CONFLICT_RELATION_COMPONENT_TYPE));
        }
        if (reviewCommentsDto.getFormBuilderId() != null) {
            query.setParameter("formBuilderId", reviewCommentsDto.getFormBuilderId());
        }
        if (reviewCommentsDto.getFormBuilderSectionId() != null) {
            query.setParameter("formBuilderSectionId", reviewCommentsDto.getFormBuilderSectionId());
        }
        if (reviewCommentsDto.getFormBuilderComponentId() != null) {
            query.setParameter("formBuilderComponentId", reviewCommentsDto.getFormBuilderComponentId());
        }
        if (reviewCommentsDto.getCommentPersonId() != null) {
        	query.setParameter("commentPersonId", reviewCommentsDto.getCommentPersonId());
        }
        return query.getResultList();
    }

    @Override
    public void deleteReviewComment(Integer commentId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("DELETE FROM DisclComment rc WHERE rc.parentCommentId = :commentId OR rc.commentId = :commentId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("commentId", commentId);
        query.executeUpdate();
    }

    @Override
    public List<CoiReviewAttachment> loadReviewAttachmentByCommentId(Integer commentId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT ra  FROM CoiReviewAttachment ra WHERE ra.commentId = :commentId ");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("commentId", commentId);
        return query.getResultList();
    }

    @Override
    public List<Integer> getAllChildCommentId(Integer commentId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT dc.commentId FROM DisclComment dc WHERE dc.parentCommentId = :parentCommentId ");
        org.hibernate.query.Query<Integer> query = session.createQuery(hqlQuery.toString());
        query.setParameter("parentCommentId", commentId);
        return query.getResultList();
    }

    @Override
    public DisclComment fetchReviewCommentByCommentId(Integer commentId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT rc FROM DisclComment rc WHERE rc.commentId = :commentId ");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("commentId", commentId);
        List<DisclComment> resultList = query.getResultList();
        if (!resultList.isEmpty()) {
            return resultList.get(0);
        }
        return null;
    }

	public List<ReviewCommentsCountDto> fetchReviewCommentsCount(ReviewCommentsDto reviewCommentsDto) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<ReviewCommentsCountDto> query = builder.createQuery(ReviewCommentsCountDto.class);
		Root<DisclComment> root = query.from(DisclComment.class);
		Expression<String> componentTypeCode = root.get("componentTypeCode");
		Expression<String> subModuleItemNumber = root.get("subModuleItemNumber");
		Expression<String> subModuleItemKey = root.get("subModuleItemKey");
		Expression<Long> count = builder.count(root);
		query.select(builder.construct(ReviewCommentsCountDto.class, componentTypeCode, subModuleItemNumber,
				subModuleItemKey, count));
		Predicate basePredicate = builder.and(
				builder.equal(root.get("moduleCode"), reviewCommentsDto.getModuleCode()),
				builder.equal(root.get("moduleItemKey"), reviewCommentsDto.getModuleItemKey()),
				root.get("componentTypeCode").in(GENERAL_COMMENTS, QUESTIONNAIRE_COMMENTS, SFI_COMMENTS,
						PROJECT_RELATIONS_COMMENTS, PROJECT_COMMENTS, REVIEW_COMMENTS, OPA_GENERAL_COMMENTS,
						TRAVEL_DISCLOSURE_CONFLICT_COMMENTS, OPA_FORM_COMMENTS, OPA_REVIEW_COMMENTS, CA_COMMENTS,
						TRAVEL_GENERAL, CMP_SECTION_COMPONENT_COMMENTS, CMP_SECTION_COMMENTS,
						CMP_GENERAL_COMMENTS, CMP_RECIPIENTS_COMMENTS));  //Code review Suggestion - it would be better if we make this configurable instead of hard coding it.
		if (reviewCommentsDto.getIsPrivate() != null) {
			basePredicate = builder.and(basePredicate,
					builder.equal(root.get("isPrivate"), reviewCommentsDto.getIsPrivate()));
		}
		if (!reviewCommentsDto.getReplyCommentsCountRequired()) {
			basePredicate = builder.and(basePredicate, builder.isNull(root.get("parentCommentId")));
		}
		if (Boolean.TRUE.equals(reviewCommentsDto.getRequirePersonPrivateComments())) {
			Subquery<Integer> subQuery = query.subquery(Integer.class);
			Root<DisclComment> subRoot = subQuery.from(DisclComment.class);
			Predicate subQueryPredicate = builder.and(
					builder.equal(subRoot.get("commentPersonId"), AuthenticatedUser.getLoginPersonId()),
					builder.equal(subRoot.get("isPrivate"), true),
					builder.equal(root.get("moduleCode"), reviewCommentsDto.getModuleCode()),
					builder.equal(root.get("moduleItemKey"), reviewCommentsDto.getModuleItemKey()));
			subQuery.select(subRoot.get("commentId")).where(subQueryPredicate);
			Predicate mainQueryPredicate = builder
					.or(builder.and(builder.equal(root.get("commentPersonId"), AuthenticatedUser.getLoginPersonId()),
							builder.equal(root.get("isPrivate"), true), builder.isNull(root.get("parentCommentId")),
							builder.equal(root.get("moduleCode"), reviewCommentsDto.getModuleCode()),
							builder.equal(root.get("moduleItemKey"), reviewCommentsDto.getModuleItemKey()),
							root.get("componentTypeCode").in(GENERAL_COMMENTS, QUESTIONNAIRE_COMMENTS, SFI_COMMENTS,
									PROJECT_RELATIONS_COMMENTS, PROJECT_COMMENTS, REVIEW_COMMENTS, OPA_GENERAL_COMMENTS,
									TRAVEL_DISCLOSURE_CONFLICT_COMMENTS, OPA_FORM_COMMENTS, OPA_REVIEW_COMMENTS,
									CA_COMMENTS, TRAVEL_GENERAL, CMP_SECTION_COMPONENT_COMMENTS, CMP_SECTION_COMMENTS,
									CMP_GENERAL_COMMENTS, CMP_RECIPIENTS_COMMENTS)));
			if (reviewCommentsDto.getReplyCommentsCountRequired()) {
				mainQueryPredicate = builder.or(mainQueryPredicate, root.get("parentCommentId").in(subQuery));
			}
			basePredicate = builder.or(basePredicate, mainQueryPredicate);
		}
		query.where(basePredicate);
		Expression<?> groupingField = builder.selectCase().when(componentTypeCode.in(OPA_FORM_COMMENTS, SFI_COMMENTS), subModuleItemNumber)
				.otherwise(subModuleItemKey);
	    query.where(basePredicate)
	         .groupBy(componentTypeCode, groupingField);
		return session.createQuery(query).getResultList();
	}

	@Override
	public boolean updateDisclCommentAsResolved(Integer commentId, Timestamp resolvedTimestamp) {
		try {
			Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
			CriteriaBuilder cb = session.getCriteriaBuilder();
			CriteriaUpdate<DisclComment> update = cb.createCriteriaUpdate(DisclComment.class);
			Root<DisclComment> root = update.from(DisclComment.class);

			update.set(root.get("isResolved"), true);
			update.set(root.get("resolvedBy"), AuthenticatedUser.getLoginPersonId());
			update.set(root.get("resolvedTimestamp"), resolvedTimestamp);
			update.where(cb.equal(root.get("commentId"), commentId));

			int rowsUpdated = session.createQuery(update).executeUpdate();
			return rowsUpdated > 0;
		} catch (Exception e) {
			throw new RuntimeException("Failed to update comment as resolved", e);
		}
	}

}
