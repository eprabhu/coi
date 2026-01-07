package com.polus.fibicomp.coi.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.polus.fibicomp.coi.dto.CoiEntityDto;
import com.polus.fibicomp.coi.dto.CommonRequestDto;
import com.polus.fibicomp.coi.service.ConflictOfInterestService;

@RestController
public class EntityController {

    @Autowired
    private ConflictOfInterestService conflictOfInterestService;

    @PostMapping("/entity/modifyRisk")
    public ResponseEntity<Object> modifyRisk(@RequestBody CoiEntityDto entityDto) {
        return conflictOfInterestService.modifyRisk(entityDto);
    }

    @PostMapping("/getEntityWithRelationShipInfo")
    public ResponseEntity<Object> getEntityWithRelationShipInfo(@RequestBody CommonRequestDto requestDto) {
        return conflictOfInterestService.getEntityWithRelationShipInfo(requestDto);
    }

    @PostMapping("/entity/riskStatus")
    public ResponseEntity<Object> checkEntityRiskStatus(@RequestBody CoiEntityDto entityDto) {
        return conflictOfInterestService.checkEntityRiskStatus(entityDto);
    }

}
