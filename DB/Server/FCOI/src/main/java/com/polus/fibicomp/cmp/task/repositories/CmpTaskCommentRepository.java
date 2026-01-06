package com.polus.fibicomp.cmp.task.repositories;

import com.polus.fibicomp.cmp.task.pojos.CmpTaskComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CmpTaskCommentRepository extends JpaRepository<CmpTaskComment, Integer> {

    /**
     * Delete All By Task Id
     * @param taskId
     */
    void deleteAllByTaskId(Integer taskId);

    /**
     * Find All By Task Id
     * @param taskId
     */
    List<CmpTaskComment> findAllByTaskIdOrderByUpdateTimestampAsc(Integer taskId);
}
