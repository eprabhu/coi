package com.polus.integration.dnb.referencedata.dao;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.polus.integration.dnb.referencedata.entity.EntityBusinessType;
import com.polus.integration.dnb.referencedata.entity.EntityFamilyRoleType;
import com.polus.integration.dnb.referencedata.entity.EntityOperatingStatusType;
import com.polus.integration.dnb.referencedata.entity.IndustryCategoryCode;
import com.polus.integration.dnb.referencedata.entity.IndustryCategoryType;
import com.polus.integration.dnb.referencedata.entity.RegistrationType;
import com.polus.integration.dnb.referencedata.repository.EntityBusinessTypeRepository;
import com.polus.integration.dnb.referencedata.repository.EntityFamilyRoleTypeRepository;
import com.polus.integration.dnb.referencedata.repository.EntityOperatingStatusTypeRepository;
import com.polus.integration.dnb.referencedata.repository.IndustryCateCodeRepository;
import com.polus.integration.dnb.referencedata.repository.IndustryCateTypeRepository;
import com.polus.integration.dnb.referencedata.repository.RegistrationTypeRepository;

@Transactional
@Repository
public class DnBReferenceDataDAO {

	@Autowired
	private IndustryCateTypeRepository typeRepository;
	
	@Autowired
	private IndustryCateCodeRepository codeRepository;
	
	@Autowired
	private EntityBusinessTypeRepository businessTypeRepository;
	
	@Autowired
	private RegistrationTypeRepository registrationTypeRepository;
	
	@Autowired
	private EntityFamilyRoleTypeRepository familyRoleTypeRepository;
	
	@Autowired
	private EntityOperatingStatusTypeRepository operatingStatusTypeRepository;
		
	public Integer getIndustryCodeId(String typeCode, String code) {		
		return codeRepository.getId(typeCode,code);
	}
	
	
	public void saveIndustryCategoryCode(IndustryCategoryCode entity) {		
		codeRepository.save(entity);
	}
	
	public void saveIndustryCategoryCodeList(List<IndustryCategoryCode> entityList) {		
		codeRepository.saveAll(entityList);
	}
	
	public Set<String> getExistingIndustryCodes(String typeCode) {	  
	    return codeRepository.findExistingCodes(typeCode);
	}

	
	public void saveIndustryCategoryType(IndustryCategoryType entity) {		
		typeRepository.save(entity);
	}
	
	public void saveIndustryCategoryTypeList(List<IndustryCategoryType> entityList) {		
		typeRepository.saveAll(entityList);
	}	
	
	public void deleteIndustryCodeForType(String typeCode) {		
		codeRepository.deleteByIndustryCategoryTypeCode(typeCode);
	}
	
	public void saveBusinessTypeList(List<EntityBusinessType> entityList) {		
		businessTypeRepository.saveAll(entityList);
	}
	
	public void saveRegistrationTypeList(List<RegistrationType> entityList) {		
		registrationTypeRepository.saveAll(entityList);
	}
	
	public void saveFamilyRoleTypeList(List<EntityFamilyRoleType> entityList) {		
		familyRoleTypeRepository.saveAll(entityList);
	}
	
	public void saveOperatingStatusTypeList(List<EntityOperatingStatusType> entityList) {		
		operatingStatusTypeRepository.saveAll(entityList);
	}
}
