package com.polus.fibicomp.coi.hierarchy.controller;

import com.polus.fibicomp.coi.hierarchy.service.HierarchyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class HierarchyController {

    @Autowired
    private HierarchyService hierarchyService;

    @GetMapping("/hierarchy/projectTree/{moduleCode}/{projectNumber}")
    public ResponseEntity<Object> fetchProjectTree(@PathVariable("moduleCode") Integer moduleCode, @PathVariable("projectNumber") String projectNumber) {
        return hierarchyService.fetchProjectTree(moduleCode, projectNumber);
    }

    @GetMapping("/hierarchy/projectDetails/{moduleCode}/{projectNumber}")
    public ResponseEntity<Object> fetchProjectDetails(@PathVariable("moduleCode") Integer moduleCode, @PathVariable("projectNumber") String projectNumber) {
        return hierarchyService.fetchProjectDetails(moduleCode, projectNumber);
    }
  
}
