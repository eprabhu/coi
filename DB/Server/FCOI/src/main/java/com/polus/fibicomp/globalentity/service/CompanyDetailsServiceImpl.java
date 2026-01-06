package com.polus.fibicomp.globalentity.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.globalentity.dao.CompanyDetailsDAO;
import com.polus.fibicomp.globalentity.dto.AddressDetailsRequestDTO;
import com.polus.fibicomp.globalentity.dto.ForeignNameRequestDTO;
import com.polus.fibicomp.globalentity.dto.ForeignNameResponseDTO;
import com.polus.fibicomp.globalentity.dto.IndustryDetailsRequestDTO;
import com.polus.fibicomp.globalentity.dto.OtherDetailsRequestDTO;
import com.polus.fibicomp.globalentity.dto.PriorNameRequestDTO;
import com.polus.fibicomp.globalentity.dto.PriorNameResponseDTO;
import com.polus.fibicomp.globalentity.dto.RegistrationDetailsRequestDTO;
import com.polus.fibicomp.globalentity.pojo.EntityForeignName;
import com.polus.fibicomp.globalentity.pojo.EntityIndustryClassification;
import com.polus.fibicomp.globalentity.pojo.EntityMailingAddress;
import com.polus.fibicomp.globalentity.pojo.EntityPriorName;
import com.polus.fibicomp.globalentity.pojo.EntityRegistration;
import com.polus.fibicomp.globalentity.pojo.IndustryCategoryCode;
import com.polus.fibicomp.globalentity.pojo.IndustryCategoryType;
import com.polus.fibicomp.globalentity.repository.EntityForeignNameRepository;
import com.polus.fibicomp.globalentity.repository.EntityIndustryClassificationRepository;
import com.polus.fibicomp.globalentity.repository.EntityMailingAddressRepository;
import com.polus.fibicomp.globalentity.repository.EntityPriorNameRepository;
import com.polus.fibicomp.globalentity.repository.EntityRegistrationRepository;
import com.polus.fibicomp.globalentity.repository.IndustryCategoryCodeRepository;

@Service(value = "companyDetailsService")
@Transactional
public class CompanyDetailsServiceImpl implements CompanyDetailsService {

	@Autowired
	private CompanyDetailsDAO comapanyDetailsDAO;

	@Autowired
	private CommonDao commonDao;

	@Autowired
	private EntityIndustryClassificationRepository entityIndustryClassificationRepository;

	@Autowired
	private IndustryCategoryCodeRepository industryCategoryCodeRepository;

	@Autowired
	private EntityRegistrationRepository entityRegistrationRepository;

	@Autowired
	private EntityMailingAddressRepository entityMailingAddressRepository;

	@Autowired
	private EntityForeignNameRepository entityForeignNameRepository;

	@Autowired
	private EntityPriorNameRepository entityPriorNameRepository;

	@Override
	public ResponseEntity<List<IndustryCategoryCode>> fetchIndustryCategoryCode(String industryCategroyTypeCode) {
		return new ResponseEntity<>(
				industryCategoryCodeRepository.fetchIndustryCategoryDetailsByCode(industryCategroyTypeCode),
				HttpStatus.OK);
	}

	@Override
	public void saveIndustryDetails(IndustryDetailsRequestDTO dto) {
		if(dto.getPrimaryCatId()!=null){
			removeCurrentPrimaryCatId(dto.getEntityId());
		}
		dto.getEntityIndustryCatIds().forEach(id -> {
			EntityIndustryClassification entity = mapDTOToEntity(dto.getEntityId(), id);
			entity.setIsPrimary(id.equals(dto.getPrimaryCatId()) ? true : false);
			comapanyDetailsDAO.saveIndustryDetails(entity);
		});
	}

	private void removeCurrentPrimaryCatId(Integer entityId) {
		comapanyDetailsDAO.removeCurrentPrimaryCatId(entityId);
	}

	private EntityIndustryClassification mapDTOToEntity(Integer entityId, Integer industryCategoryId) {
		return EntityIndustryClassification.builder().entityId(entityId).industryCategoryId(industryCategoryId)
				.updatedBy(AuthenticatedUser.getLoginPersonId()).updateTimestamp(commonDao.getCurrentTimestamp())
				.build();
	}

	@Override
	public ResponseEntity<String> updateIndustryDetails(IndustryDetailsRequestDTO dto) {
		dto.getRemovedEntityIndustryClassIds().stream().forEach(id -> {
			deleteIndustryDetailsByClassId(id);
		});
		dto.getAddedEntityIndustryCatIds().stream().forEach(id -> {
			EntityIndustryClassification entity = mapDTOToEntity(dto.getEntityId(), id);
			entity.setIsPrimary(false);
			comapanyDetailsDAO.saveIndustryDetails(entity);
		});
		if (Boolean.TRUE.equals(dto.getUpdatePrimaryCatId())) {
			removeCurrentPrimaryCatId(dto.getEntityId());
			if (dto.getPrimaryCatId() != null) {
				updateIndustryDetailsPrimaryFlag(dto.getPrimaryCatId(), dto.getEntityId());
			}
		}
		return new ResponseEntity<>(commonDao.convertObjectToJSON("Industry details updated successfully"),
				HttpStatus.OK);
	}

	private void updateIndustryDetailsPrimaryFlag(Integer primaryCatId, Integer entityId) {
		comapanyDetailsDAO.setNewPrimaryCatId(entityId, primaryCatId);
	}

	@Override
	public ResponseEntity<String> deleteIndustryDetailsByClassId(Integer entityIndustryClassId) {
		entityIndustryClassificationRepository.deleteByEntityIndustryClassId(entityIndustryClassId);
		return new ResponseEntity<>(commonDao.convertObjectToJSON("Industry details deleted successfully"),
				HttpStatus.OK);
	}

	@Override
	public ResponseEntity<String> deleteIndustryDetailsByCatCode(String industryCatCode) {
		comapanyDetailsDAO.deleteIndustryDetailsByCatCode(industryCatCode);
		return new ResponseEntity<>(commonDao.convertObjectToJSON("Industry details deleted successfully"),
				HttpStatus.OK);
	}

	@Override
	public ResponseEntity<List<EntityIndustryClassification>> fetchIndustryDetails(Integer entityId) {
		return new ResponseEntity<>(entityIndustryClassificationRepository.findByEntityId(entityId),
				HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Map<String, Integer>> saveRegistrationDetails(RegistrationDetailsRequestDTO dto) {
		EntityRegistration entity = mapDTOToEntity(dto);
		comapanyDetailsDAO.saveRegistrationDetails(entity);
		return new ResponseEntity<>(Map.of("entityRegistrationId", comapanyDetailsDAO.saveRegistrationDetails(entity)),
				HttpStatus.OK);
	}

	private EntityRegistration mapDTOToEntity(RegistrationDetailsRequestDTO dto) {
		return EntityRegistration.builder().entityId(dto.getEntityId()).isActive(dto.getIsActive())
				.regNumber(dto.getRegNumber()).regTypeCode(dto.getRegTypeCode())
				.updatedBy(AuthenticatedUser.getLoginPersonId()).updateTimestamp(commonDao.getCurrentTimestamp())
				.build();
	}

	@Override
	public ResponseEntity<String> updateRegistrationDetails(RegistrationDetailsRequestDTO dto) {
		comapanyDetailsDAO.updateRegistrationDetails(dto);
		return new ResponseEntity<>(commonDao.convertObjectToJSON("Registration details updated successfully"),
				HttpStatus.OK);
	}

	@Override
	public ResponseEntity<String> deleteRegistrationDetails(Integer entityRegistrationId) {
		entityRegistrationRepository.deleteByEntityRegistrationId(entityRegistrationId);
		return new ResponseEntity<>(commonDao.convertObjectToJSON("Registration details deleted successfully"),
				HttpStatus.OK);
	}

	@Override
	public ResponseEntity<String> updateAdditionalAddresses(AddressDetailsRequestDTO dto) {
		comapanyDetailsDAO.updateAdditionalAddresses(dto);
		return new ResponseEntity<>(commonDao.convertObjectToJSON("Additional address details updated successfully"),
				HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Map<String, Integer>> saveAdditionalAddresses(AddressDetailsRequestDTO dto) {
		EntityMailingAddress entity = mapDTOToEntity(dto);
		return new ResponseEntity<>(
				Map.of("entityMailingAddressId", comapanyDetailsDAO.saveAdditionalAddresses(entity)), HttpStatus.OK);
	}

	private EntityMailingAddress mapDTOToEntity(AddressDetailsRequestDTO dto) {
		return EntityMailingAddress.builder().entityId(dto.getEntityId()).addressTypeCode(dto.getAddressTypeCode())
				.addressLine1(dto.getAddressLine1()).addressLine2(dto.getAddressLine2()).city(dto.getCity())
				.state(dto.getState()).postCode(dto.getPostCode()).countryCode(dto.getCountryCode())
				.county(dto.getCounty()).locality(dto.getLocality()).region(dto.getRegion()).isCopy(dto.getIsCopy())
				.updatedBy(AuthenticatedUser.getLoginPersonId()).updateTimestamp(commonDao.getCurrentTimestamp())
				.build();
	}

	@Override
	public ResponseEntity<String> deleteAdditionalAddress(Integer entityMailingAddressId) {
		entityMailingAddressRepository.deleteByEntityMailingAddressId(entityMailingAddressId);
		return new ResponseEntity<>(commonDao.convertObjectToJSON("Additional address details deleted successfully"),
				HttpStatus.OK);
	}

	@Override
	public ResponseEntity<String> updateOtherDetails(OtherDetailsRequestDTO dto) {
		comapanyDetailsDAO.updateOtherDetails(dto);
		return new ResponseEntity<>(commonDao.convertObjectToJSON("Other details updated successfully"), HttpStatus.OK);
	}

	@Override
	public ResponseEntity<Map<String, Integer>> addPriorName(PriorNameRequestDTO dto) {
		EntityPriorName entity = mapDTOToEntity(dto);
		return new ResponseEntity<>(Map.of("id", comapanyDetailsDAO.savePriorName(entity)), HttpStatus.OK);
	}

	private EntityPriorName mapDTOToEntity(PriorNameRequestDTO dto) {
		return EntityPriorName.builder().entityId(dto.getEntityId()).priorName(dto.getPriorName())
				.updatedBy(AuthenticatedUser.getLoginPersonId()).updateTimestamp(commonDao.getCurrentTimestamp())
				.build();
	}

	@Override
	public List<PriorNameResponseDTO> fetchPriorNames(Integer entityId) {
		return mapPriorNameEntityToDTO(entityPriorNameRepository.findByEntityId(entityId));
	}

	private List<PriorNameResponseDTO> mapPriorNameEntityToDTO(List<EntityPriorName> entityPriorNames) {
		return entityPriorNames.stream()
	            .map(entityPriorName -> PriorNameResponseDTO.builder()
	                .id(entityPriorName.getId())
	                .priorNames(entityPriorName.getPriorName())
	                .build())
	            .collect(Collectors.toList());
	}

	@Override
	public ResponseEntity<Map<String, Integer>> addForeignName(ForeignNameRequestDTO dto) {
		EntityForeignName entity = mapDTOToEntity(dto);
		return new ResponseEntity<>(Map.of("id", comapanyDetailsDAO.saveForeignName(entity)), HttpStatus.OK);
	}

	private EntityForeignName mapDTOToEntity(ForeignNameRequestDTO dto) {
		return EntityForeignName.builder().entityId(dto.getEntityId()).foreignName(dto.getForeignName())
				.updatedBy(AuthenticatedUser.getLoginPersonId()).updateTimestamp(commonDao.getCurrentTimestamp())
				.build();
	}

	@Override
	public List<ForeignNameResponseDTO> fetchForeignNames(Integer entityId) {
		return mapForeignNameEntityToDTO(entityForeignNameRepository.findByEntityId(entityId));
	}

	private List<ForeignNameResponseDTO> mapForeignNameEntityToDTO(List<EntityForeignName> entityForeignNames) {
		return entityForeignNames.stream()
	            .map(entityForeignName -> ForeignNameResponseDTO.builder()
	                .id(entityForeignName.getId())
	                .foreignName(entityForeignName.getForeignName())
	                .build())
	            .collect(Collectors.toList());
	}

	@Override
	public ResponseEntity<String> deleteForeignName(Integer id) {
		entityForeignNameRepository.deleteByForeignNameId(id);
		return new ResponseEntity<>(commonDao.convertObjectToJSON("Foreign Name deleted successfully"), HttpStatus.OK);
	}

	@Override
	public ResponseEntity<String> deletePriorName(Integer id) {
		entityPriorNameRepository.deleteByPriorNameId(id);
		return new ResponseEntity<>(commonDao.convertObjectToJSON("Prior Name deleted successfully"), HttpStatus.OK);
	}

	@Override
	public List<IndustryCategoryType> fetchIndustryCategoryTypeBySource(String source) {
		return comapanyDetailsDAO.fetchIndustryCategoryTypeBySource(source);
	}

}
