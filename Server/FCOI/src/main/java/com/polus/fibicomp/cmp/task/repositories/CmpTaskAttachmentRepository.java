package com.polus.fibicomp.cmp.task.repositories;

import com.polus.fibicomp.cmp.task.pojos.CmpTaskAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CmpTaskAttachmentRepository extends JpaRepository<CmpTaskAttachment, Integer> {

    /**
     * Find All By Task Id
     * @param taskId
     */
    List<CmpTaskAttachment> findAllByTaskId(Integer taskId);
}
