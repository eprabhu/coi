package com.polus.fibicomp.cmp.task.repositories;

import com.polus.fibicomp.cmp.task.pojos.CmpTaskQuestionAnswers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CmpTaskQuestionAnswersRepository extends JpaRepository<CmpTaskQuestionAnswers, Integer> {

    /**
     * Delete All By Cmp Task Question Id
     *
     * @param cmpTaskQuestionId
     */
    void deleteAllByCmpTaskQuestionId(Integer cmpTaskQuestionId);

    /**
     * Find All By Cmp Task Question Id
     *
     * @param cmpTaskQuestionId
     * @return
     */
    List<CmpTaskQuestionAnswers> findAllByCmpTaskQuestionId(Integer cmpTaskQuestionId);
}
