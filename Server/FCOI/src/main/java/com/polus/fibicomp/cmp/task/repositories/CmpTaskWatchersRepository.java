package com.polus.fibicomp.cmp.task.repositories;

import com.polus.fibicomp.cmp.task.pojos.CmpTaskWatchers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CmpTaskWatchersRepository extends JpaRepository<CmpTaskWatchers, Integer> {

    /**
     * Delete All By Task Id
     * @param taskId
     */
    void deleteAllByTaskId(Integer taskId);

    /**
     * Find All By I Task Id
     * @param taskId
     */
    List<CmpTaskWatchers> findAllByTaskId(Integer taskId);
}
