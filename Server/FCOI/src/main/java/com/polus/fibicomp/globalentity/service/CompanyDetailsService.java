package com.polus.fibicomp.globalentity.service;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.polus.fibicomp.globalentity.dto.AddressDetailsRequestDTO;
import com.polus.fibicomp.globalentity.dto.ForeignNameRequestDTO;
import com.polus.fibicomp.globalentity.dto.ForeignNameResponseDTO;
import com.polus.fibicomp.globalentity.dto.IndustryDetailsRequestDTO;
import com.polus.fibicomp.globalentity.dto.OtherDetailsRequestDTO;
import com.polus.fibicomp.globalentity.dto.PriorNameRequestDTO;
import com.polus.fibicomp.globalentity.dto.PriorNameResponseDTO;
import com.polus.fibicomp.globalentity.dto.RegistrationDetailsRequestDTO;
import com.polus.fibicomp.globalentity.pojo.EntityIndustryClassification;
import com.polus.fibicomp.globalentity.pojo.IndustryCategoryCode;
import com.polus.fibicomp.globalentity.pojo.IndustryCategoryType;

@Service
public interface CompanyDetailsService extends GlobalEntityService {

	void saveIndustryDetails(IndustryDetailsRequestDTO dto);
	
	ResponseEntity<String> updateIndustryDetails(IndustryDetailsRequestDTO dto);

	ResponseEntity<String> deleteIndustryDetailsByClassId(Integer entityIndustryClassId);

	ResponseEntity<String> deleteIndustryDetailsByCatCode(String industryCatCode);

	ResponseEntity<List<EntityIndustryClassification>> fetchIndustryDetails(Integer entityId);

	ResponseEntity<List<IndustryCategoryCode>> fetchIndustryCategoryCode(String industryCategroyTypeCode);

	ResponseEntity<Map<String, Integer>> saveRegistrationDetails(RegistrationDetailsRequestDTO dto);

	ResponseEntity<String> updateRegistrationDetails(RegistrationDetailsRequestDTO dto);

	ResponseEntity<String> deleteRegistrationDetails(Integer entityRegistrationId);

	ResponseEntity<String> updateAdditionalAddresses(AddressDetailsRequestDTO dto);

	ResponseEntity<Map<String, Integer>> saveAdditionalAddresses(AddressDetailsRequestDTO dto);

	ResponseEntity<String> deleteAdditionalAddress(Integer entityMailingAddressId);

	ResponseEntity<String> updateOtherDetails(OtherDetailsRequestDTO dto);

	ResponseEntity<Map<String, Integer>> addPriorName(PriorNameRequestDTO dto);

	List<PriorNameResponseDTO> fetchPriorNames(Integer entityId);

	ResponseEntity<Map<String, Integer>> addForeignName(ForeignNameRequestDTO dto);

	List<ForeignNameResponseDTO> fetchForeignNames(Integer entityId);

	ResponseEntity<String> deleteForeignName(Integer id);

	ResponseEntity<String> deletePriorName(Integer id);

	List<IndustryCategoryType> fetchIndustryCategoryTypeBySource(String source);

}
