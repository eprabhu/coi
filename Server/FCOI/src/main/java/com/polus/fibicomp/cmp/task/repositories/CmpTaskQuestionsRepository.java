package com.polus.fibicomp.cmp.task.repositories;

import com.polus.fibicomp.cmp.task.pojos.CmpTaskQuestions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CmpTaskQuestionsRepository extends JpaRepository<CmpTaskQuestions, Integer> {

    /**
     * Find all by task id
     * @param taskId
     * @return
     */
    List<CmpTaskQuestions> findAllByTaskId(Integer taskId);
}
