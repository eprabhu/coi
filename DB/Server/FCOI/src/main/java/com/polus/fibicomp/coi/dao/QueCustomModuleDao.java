package com.polus.fibicomp.coi.dao;

import com.polus.core.applicationexception.dto.ApplicationException;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.questionnaire.custompojos.CoiQuestTableAnswer;
import com.polus.fibicomp.constants.Constants;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Repository;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.List;

@Repository
public class QueCustomModuleDao {

    protected static Logger logger = LogManager.getLogger(GeneralDaoImpl.class.getName());

    @Autowired
    private HibernateTemplate hibernateTemplate;

    @Autowired
    private CommonDao commonDao;

    public List<CoiQuestTableAnswer> getCoiQuestTableAnswers(Integer questionnaireAnsHeaderId) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        CriteriaBuilder builder = session.getCriteriaBuilder();
        CriteriaQuery<CoiQuestTableAnswer> query = builder.createQuery(CoiQuestTableAnswer.class);
        Root<CoiQuestTableAnswer> rootCoiQuestTableAnswer = query.from(CoiQuestTableAnswer.class);
        Predicate predicateQuestionnaireAnsHeaderId = builder.equal(rootCoiQuestTableAnswer.get("questAnsHeaderId"), questionnaireAnsHeaderId);
        query.where(builder.and(predicateQuestionnaireAnsHeaderId));
        return session.createQuery(query).getResultList();
    }

    public void saveCoiQuestTableAnswers(CoiQuestTableAnswer questTableAnswer) {
        try {
            hibernateTemplate.saveOrUpdate(questTableAnswer);
        } catch (Exception e) {
            logger.info("Error ocuured in saveQuestTableAnswers {}", e.getMessage());
            throw new ApplicationException("Error in saveCoiQuestTableAnswers", e, Constants.JAVA_ERROR);
        }
    }
}
