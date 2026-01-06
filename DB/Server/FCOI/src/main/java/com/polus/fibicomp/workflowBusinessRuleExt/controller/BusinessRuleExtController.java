package com.polus.fibicomp.workflowBusinessRuleExt.controller;

import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.workflowBusinessRuleExt.dto.WorkflowDto;
import com.polus.fibicomp.workflowBusinessRuleExt.service.BusinessRuleExtService;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@RestController
@Log4j2
public class BusinessRuleExtController {

    @Autowired
    private BusinessRuleExtService businessRuleExtService;

    @PostMapping(value = "/approveOrRejectWorkflow", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> approveProposal(@RequestParam(value = "files", required = false) MultipartFile[] files, @RequestParam("formDataJson") String formDataJson,
                                                  @RequestParam("moduleCode") String moduleCode, @RequestParam("subModuleCode") String subModuleCode) throws Exception {
        log.info("Requesting for approveOrRejectWorkflow");

        return businessRuleExtService.approveOrRejectWorkflow(files, formDataJson, moduleCode, subModuleCode);
    }

    @PostMapping("/fetchWorkFlowDetails")
    public ResponseEntity<Object> fetchWorkFlowDetails(@RequestBody WorkflowDto workflowDto) {
        log.info("Request for /fetchWorkFlowDetails | moduleCode : {} | moduleItemKey : {}", workflowDto.getModuleCode(), workflowDto.getModuleItemKey());
        return new ResponseEntity<>(businessRuleExtService.fetchWorkFlowDetails(workflowDto),HttpStatus.OK);
    }

    @PostMapping("/addSequentialStop")
    public ResponseEntity<String> addAlternativeStop(@RequestBody WorkflowDto vo) {
        log.info("Requesting for addSequentialStop");
        return businessRuleExtService.addSequentialStop(vo);
    }

    @PostMapping("/addAlternativeApprover")
    public ResponseEntity<String> addAlternativeApprover(@RequestBody WorkflowDto vo) {
        log.info("Requesting for addAlternativeApprover");
        return businessRuleExtService.addAlternativeApprover(vo);
    }
}
