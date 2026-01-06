package com.polus.fibicomp.cmp.task.repositories;

import com.polus.fibicomp.cmp.task.pojos.CmpTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CmpTaskRepository extends JpaRepository<CmpTask, Integer> {

    /**
     * Check Existence By Task Id And Task Status Code
     * @param taskId
     * @param taskStatusCode
     * @return
     */
    boolean existsByTaskIdAndTaskStatusCode(Integer taskId, String taskStatusCode);

    /**
     * Find All By Cmp Id
     * @param cmpId
     * @return
     */
    List<CmpTask> findAllByCmpId(Integer cmpId);

    /**
     * Find By Cmp Id And Person Id
     * @param cmpId
     * @param personId
     * @return
     */
    List<CmpTask> findByCmpIdAndAssigneePersonId(Integer cmpId, String personId);
}
