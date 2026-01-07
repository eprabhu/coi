package com.polus.integration.dnb.referencedata.service;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.polus.integration.constant.Constant;
import com.polus.integration.dnb.referencedata.dao.DnBReferenceDataDAO;
import com.polus.integration.dnb.referencedata.dto.DnBReferenceDataDTO;
import com.polus.integration.dnb.referencedata.entity.EntityBusinessType;
import com.polus.integration.dnb.referencedata.entity.EntityFamilyRoleType;
import com.polus.integration.dnb.referencedata.entity.EntityOperatingStatusType;
import com.polus.integration.dnb.referencedata.entity.IndustryCategoryCode;
import com.polus.integration.dnb.referencedata.entity.IndustryCategoryType;
import com.polus.integration.dnb.referencedata.entity.RegistrationType;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class ReferenceDataService {

	@Autowired
	private ReferenceDataUrlBuilder urlBuilder;

	@Autowired
	private DnBReferenceDataAPIService apiService;

	@Autowired
	private DnBReferenceDataDAO industryRefDataDAO;

	public void loadIndustryCodeType(String code) {
		try {
			String apiUrl = buildApiUrl(code);
			ArrayList<DnBReferenceDataDTO> responseReferenceData = callDnBReferenceAPI(apiUrl);
			// responseReferenceData = filteredRequiredIndustryType(responseReferenceData);
			saveIndustryType(responseReferenceData);

			saveIndustryCodeForType(responseReferenceData);

		} catch (Exception e) {
			log.error("<---- ERDNB Reference Data ---> : Error Loading loadIndustryCodeType. " + e.getMessage());
		}

	}

	private ArrayList<DnBReferenceDataDTO> filteredRequiredIndustryType(
			ArrayList<DnBReferenceDataDTO> responseReferenceData) {

		ArrayList<DnBReferenceDataDTO> newFilteredList = new ArrayList<>();
		for (DnBReferenceDataDTO type : responseReferenceData) {
			if (Constant.REQUIRED_DnB_INDUSTRY_TYPE.containsKey(type.getCode())) {
				DnBReferenceDataDTO dataObj = new DnBReferenceDataDTO();
				dataObj.setCode(type.getCode());
				dataObj.setDescription(type.getDescription());
				newFilteredList.add(dataObj);
			}
		}

		return newFilteredList;
	}

	public void loadRegistrationNumberType(String code) {
		try {
			String apiUrl = buildApiUrl(code);
			ArrayList<DnBReferenceDataDTO> responseReferenceData = callDnBReferenceAPI(apiUrl);
			saveRegistrationNumberType(responseReferenceData);

		} catch (Exception e) {
			log.error("<---- ERDNB Reference Data ---> : Error Loading loadRegistrationNumberType. " + e.getMessage());
		}

	}

	public void loadBusinessEntityType(String code) {
		try {
			String apiUrl = buildApiUrl(code);
			ArrayList<DnBReferenceDataDTO> responseReferenceData = callDnBReferenceAPI(apiUrl);
			saveBusinessEntityType(responseReferenceData);

		} catch (Exception e) {
			log.error("<---- ERDNB Reference Data ---> : Error Loading loadBusinessEntityType. " + e.getMessage());
		}

	}

	public void loadFamilyRoleType(String code) {
		try {
			String apiUrl = buildApiUrl(code);
			ArrayList<DnBReferenceDataDTO> responseReferenceData = callDnBReferenceAPI(apiUrl);
			saveFamilyRoleType(responseReferenceData);

		} catch (Exception e) {
			log.error("<---- ERDNB Reference Data ---> : Error Loading loadFamilyRoleType. " + e.getMessage());
		}

	}

	public void loadOperatingStatusType(String code) {
		try {
			String apiUrl = buildApiUrl(code);
			ArrayList<DnBReferenceDataDTO> responseReferenceData = callDnBReferenceAPI(apiUrl);
			saveOperatingStatusType(responseReferenceData);

		} catch (Exception e) {
			log.error("<---- ERDNB Reference Data ---> : Error Loading loadOperatingStatusType. " + e.getMessage());
		}

	}

	private void saveFamilyRoleType(ArrayList<DnBReferenceDataDTO> responseReferenceData) {

		List<EntityFamilyRoleType> entityList = new ArrayList<>();
		for (DnBReferenceDataDTO type : responseReferenceData) {
			EntityFamilyRoleType dataObj = new EntityFamilyRoleType();
			dataObj.setFamilyRoleTypeCode(type.getCode());
			dataObj.setDescription(type.getDescription());
			dataObj.setIsActive(Constant.DEFAULT_IS_ACTIVE_VALUE);
			dataObj.setUpdateTimestamp(LocalDateTime.now());
			dataObj.setUpdatedBy(Constant.UPDATE_BY);
			entityList.add(dataObj);
		}
		if (!entityList.isEmpty()) {
			industryRefDataDAO.saveFamilyRoleTypeList(entityList);
		}

	}

	private void saveOperatingStatusType(ArrayList<DnBReferenceDataDTO> responseReferenceData) {
		List<EntityOperatingStatusType> entityList = new ArrayList<>();
		for (DnBReferenceDataDTO type : responseReferenceData) {
			EntityOperatingStatusType dataObj = new EntityOperatingStatusType();
			dataObj.setOperatingStatusTypeCode(type.getCode());
			dataObj.setDescription(type.getDescription());
			dataObj.setIsActive(Constant.DEFAULT_IS_ACTIVE_VALUE);
			dataObj.setUpdateTimestamp(LocalDateTime.now());
			dataObj.setUpdatedBy(Constant.UPDATE_BY);
			entityList.add(dataObj);
		}
		if (!entityList.isEmpty()) {
			industryRefDataDAO.saveOperatingStatusTypeList(entityList);
		}
	}

	private void saveBusinessEntityType(ArrayList<DnBReferenceDataDTO> responseReferenceData) {

		List<EntityBusinessType> entityList = new ArrayList<>();
		for (DnBReferenceDataDTO type : responseReferenceData) {
			EntityBusinessType dataObj = new EntityBusinessType();
			dataObj.setBusinessTypeCode(type.getCode());
			dataObj.setDescription(type.getDescription());
			dataObj.setIsActive(Constant.DEFAULT_IS_ACTIVE_VALUE);
			dataObj.setUpdateTimestamp(Timestamp.from(Instant.now()));
			dataObj.setUpdatedBy(Constant.UPDATE_BY);
			entityList.add(dataObj);
		}
		if (!entityList.isEmpty()) {
			industryRefDataDAO.saveBusinessTypeList(entityList);
		}

	}

	private void saveRegistrationNumberType(ArrayList<DnBReferenceDataDTO> responseReferenceData) {

		List<RegistrationType> entityList = new ArrayList<>();
		for (DnBReferenceDataDTO type : responseReferenceData) {
			RegistrationType dataObj = new RegistrationType();
			dataObj.setRegTypeCode(type.getCode());
			dataObj.setDescription(type.getDescription());
			dataObj.setIsActive(Constant.DEFAULT_IS_ACTIVE_VALUE);
			dataObj.setUpdateTimestamp(LocalDateTime.now());
			dataObj.setUpdatedBy(Constant.UPDATE_BY);
			entityList.add(dataObj);
		}
		if (!entityList.isEmpty()) {
			industryRefDataDAO.saveRegistrationTypeList(entityList);
		}
	}

	private void saveIndustryType(ArrayList<DnBReferenceDataDTO> responseIndustryType) {

		List<IndustryCategoryType> entityList = new ArrayList<>();
		for (DnBReferenceDataDTO type : responseIndustryType) {

			IndustryCategoryType dataObj = new IndustryCategoryType();
			dataObj.setIndustryCategoryTypeCode(type.getCode());
			dataObj.setDescription(type.getDescription());
			dataObj.setIsActive(Constant.DEFAULT_IS_ACTIVE_VALUE);
			dataObj.setIsPrimary(
					Constant.PRIMARY_DnB_INDUSTRY_TYPE.equalsIgnoreCase(type.getCode()) ? Constant.IS_PRIMARY_YES
							: Constant.IS_PRIMARY_NO);
			dataObj.setUpdateTimestamp(LocalDateTime.now());
			dataObj.setUpdatedBy(Constant.UPDATE_BY);
			entityList.add(dataObj);

		}
		if (!entityList.isEmpty()) {
			industryRefDataDAO.saveIndustryCategoryTypeList(entityList);
		}
	}

	private void saveIndustryCodeForType(ArrayList<DnBReferenceDataDTO> responseIndustryType) {

		for (DnBReferenceDataDTO type : responseIndustryType) {

			String apiUrl = buildApiUrl(type.getCode());
			ArrayList<DnBReferenceDataDTO> responseIndustryCode = callDnBReferenceAPI(apiUrl);
			if (responseIndustryCode != null) {				
				try {
					saveIndustryCode(type.getCode(), responseIndustryCode);
				} catch (Exception e) {
					log.error("<---- ERDNB Reference Data ---> : Error Loading saveIndustryCodeForType. "
							+ e.getMessage());
				}
			}
		}

	}

 private void saveIndustryCode(String typeCode, ArrayList<DnBReferenceDataDTO> responseIndustryCode) {

		if (responseIndustryCode == null || responseIndustryCode.isEmpty()) {
			return;
		}

		try {
			// Collect all codes from responseIndustryCode
			Set<String> existingIndustryCodes = industryRefDataDAO.getExistingIndustryCodes(typeCode);

			// Filter out codes that already exist
			List<IndustryCategoryCode> newEntries = responseIndustryCode.stream()
					.filter(code -> !existingIndustryCodes.contains(code.getCode())).map(code -> {
						IndustryCategoryCode dataObj = new IndustryCategoryCode();
						dataObj.setIndustryCategoryCode(code.getCode());
						dataObj.setIndustryCategoryTypeCode(typeCode);
						dataObj.setDescription(code.getDescription());
						dataObj.setIsActive(Constant.DEFAULT_IS_ACTIVE_VALUE);
						dataObj.setUpdateTimestamp(LocalDateTime.now());
						dataObj.setUpdatedBy(Constant.UPDATE_BY);
						return dataObj;
					}).collect(Collectors.toList());

			// Save new entries in bulk if there are any
			if (!newEntries.isEmpty()) {
				industryRefDataDAO.saveIndustryCategoryCodeList(newEntries);
			}

		} catch (Exception e) {
			e.printStackTrace();
			log.error("<---- ERDNB Reference Data ---> : Error Loading saveIndustryCode. " + e.getMessage());
		}
	}


	private String buildApiUrl(String code) {
		return urlBuilder.buildApiUrl(code);
	}

	private ArrayList<DnBReferenceDataDTO> callDnBReferenceAPI(String apiUrl) {
		return apiService.callDnBReferenceAPI(apiUrl);
	}
}
