package com.polus.fibicomp.cmp.task.controllers;

import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.cmp.task.pojos.CmpTaskQuestionAnswers;
import com.polus.fibicomp.cmp.task.services.CmpTaskServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/cmp/tasks")
@RequiredArgsConstructor
@Log4j2
public class CmpTaskController {

    private final CmpTaskServiceImpl cmpTaskService;

    @PostMapping("/saveQuestionAns")
    public ResponseEntity<?> saveQuestionAns(@RequestBody CmpTaskQuestionAnswers cmpTaskQuestionAnswer) {
        log.info("Request received to save CMP Task Question Answers");
        CmpTaskQuestionAnswers savedAns = cmpTaskService.saveQuestionAns(cmpTaskQuestionAnswer);
        return ResponseEntity.ok(savedAns);
    }

    @GetMapping("/myTask/{cmpId}")
    public ResponseEntity<?> getTaskByTaskByCmpIdAndPersonId(@PathVariable("cmpId") Integer cmpId) {
        log.info("Request received to fetch CMP Task by CMP ID {} and Person ID {}", cmpId, AuthenticatedUser.getLoginPersonId());
        return ResponseEntity.ok(cmpTaskService.getTaskByTaskByCmpIdAndPersonId(cmpId, AuthenticatedUser.getLoginPersonId()));
    }
}
