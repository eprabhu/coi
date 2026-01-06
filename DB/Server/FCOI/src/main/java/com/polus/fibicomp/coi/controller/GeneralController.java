package com.polus.fibicomp.coi.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.polus.core.person.pojo.Person;
import com.polus.core.pojo.Organization;
import com.polus.core.security.AuthenticatedUser;
import com.polus.core.vo.CommonVO;
import com.polus.fibicomp.coi.dto.LookupRequestDto;
import com.polus.fibicomp.coi.dto.LookupResponseDto;
import com.polus.fibicomp.coi.service.GeneralService;
import com.polus.fibicomp.opa.dto.OPACommonDto;

import lombok.extern.slf4j.Slf4j;

/**
 * General Controller
 * Api other than modular functionalities
 * @created on 17-05-2023
 * @updated on 18-05-2023
 */
@Slf4j
@RestController
@RequestMapping("/coiCustom")
public class GeneralController {

    @Autowired
    private GeneralService generalService;

    @GetMapping("/fetchAllCoiRights")
    public ResponseEntity<Object> fetchAllCoiRights(){
        return generalService.fetchAllCoiOpaRights();
    }

    @GetMapping(value = "/fetchRequiredParams")
    public ResponseEntity<Object> fetchRequiredParams() throws Exception {
        return generalService.fetchRequiredParams();
    }

    @PostMapping("/getLookupValues")
	public List<LookupResponseDto> getLookupValues(@RequestBody LookupRequestDto requestDto) {
		return generalService.getLookupValues(requestDto);
	}
    
	@PostMapping("/isDeptLevelRightsAvailable")
	public ResponseEntity<Boolean> isDeptLevelRightsAvailable(@RequestBody OPACommonDto OPACommonDto) {
		boolean hasPermission = generalService.isDeptLevelRightsAvailable(OPACommonDto.getUnitNumber(), OPACommonDto.getRights());
		return ResponseEntity.ok(hasPermission);
	}

	@PostMapping("/getDeptLevelAvailableRights")
	public ResponseEntity<Map<String, Boolean>> getDeptLevelAvailableRights(@RequestBody CommonVO vo) {
		log.info("Requesting getDeptLevelAvailableRights, unit: {}, rights: {}", vo.getUnitNumber(), vo.getRightName());
		Map<String, Boolean> deptLevelRights = generalService.getDeptLevelAvailableRights(vo.getUnitNumber(), vo.getRightName());
		return ResponseEntity.ok(deptLevelRights);
	}

	@PostMapping(value = "/findContractAdministrators")
	public List<Person> findContractAdministrators(@RequestBody CommonVO vo) {
	    log.info("Requesting for findContractAdministrators " + "SearchString: " + vo.getSearchString());
	    return generalService.findContractAdministrators(vo.getSearchString());
	}
	
	@GetMapping(value = "/getPendingActionItemsCount")
	public Object getPendingActionItemsCount() {
	    log.info("Requesting for getPendingActionItemsCount");
	    int count = generalService.getPendingActionItemsCount(AuthenticatedUser.getLoginPersonId());
	    return Map.of("count", count);
	}

    @GetMapping("/letterTemplate/{moduleCode}/{subModuleCode}")
    public ResponseEntity<Object> getAllLetterTemplateTypes(@PathVariable("moduleCode") Integer moduleCode, @PathVariable("subModuleCode") Integer subModuleCode) {
        log.info("Requesting for /letterTemplate/{}/{}", moduleCode, subModuleCode);
        if (subModuleCode == null || subModuleCode == 0) {
            return generalService.getAllLetterTemplateTypes(moduleCode);
        }
        return generalService.getAllLetterTemplateTypes(moduleCode, subModuleCode);
    }

    @PostMapping(value = "/findOrganizations")
	public List<Organization> findAllOrganizations(@RequestBody CommonVO vo) {
    	log.info("Requesting for findOrganizations");
    	log.info("searchString : {}", vo.getSearchString());
		return generalService.findOrganizationList(vo);
	}

}
