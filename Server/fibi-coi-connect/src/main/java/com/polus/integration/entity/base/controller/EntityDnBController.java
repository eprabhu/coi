package com.polus.integration.entity.base.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.polus.integration.entity.base.dto.DnBOrganizationDetails;
import com.polus.integration.entity.base.dto.EntityDnBUpwardFamilyTreeResponse;
import com.polus.integration.entity.base.exception.DunsDnBSearchAPIException;
import com.polus.integration.entity.base.exception.UpwardFamilyTreeDnBAPIException;
import com.polus.integration.entity.base.service.EntityDnBService;

@RestController
@RequestMapping("/duns")
public class EntityDnBController {
	
	private final EntityDnBService dunsService;

    public EntityDnBController(EntityDnBService dunsService) {
        this.dunsService = dunsService;
    }

    @GetMapping("/{dunsNumber}/upwardFamilyTree")
    public ResponseEntity<?> getUpwardFamilyTree(@PathVariable String dunsNumber) {
        try {
            EntityDnBUpwardFamilyTreeResponse response = dunsService.getUpwardFamilyTree(dunsNumber);
            return ResponseEntity.ok(response);
        } catch (Exception e) {     
            throw new UpwardFamilyTreeDnBAPIException("Error in Upward Family Tree : "+ e.getMessage());
        }
    }

    @GetMapping("/{dunsNumber}/search")
    public ResponseEntity<?> searchDuns(@PathVariable String dunsNumber) {
        try {
        	DnBOrganizationDetails result = dunsService.searchDuns(dunsNumber);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
        	throw new DunsDnBSearchAPIException ("Error in searchDuns for D-U-N-S "+dunsNumber+ " - "+ e.getMessage());
        }
    }
	
}
