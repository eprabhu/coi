package com.polus.fibicomp.globalentity.dao;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.fibicomp.globalentity.dto.AddressDetailsRequestDTO;
import com.polus.fibicomp.globalentity.dto.IndustryDetailsRequestDTO;
import com.polus.fibicomp.globalentity.dto.OtherDetailsRequestDTO;
import com.polus.fibicomp.globalentity.dto.RegistrationDetailsRequestDTO;
import com.polus.fibicomp.globalentity.pojo.EntityForeignName;
import com.polus.fibicomp.globalentity.pojo.EntityIndustryClassification;
import com.polus.fibicomp.globalentity.pojo.EntityMailingAddress;
import com.polus.fibicomp.globalentity.pojo.EntityPriorName;
import com.polus.fibicomp.globalentity.pojo.EntityRegistration;
import com.polus.fibicomp.globalentity.pojo.IndustryCategoryType;

@Transactional
@Service
public interface CompanyDetailsDAO {

	public int saveIndustryDetails(EntityIndustryClassification entity);

	public void updateIndustryDetails(IndustryDetailsRequestDTO dto);

	public int saveRegistrationDetails(EntityRegistration entity);

	public void updateRegistrationDetails(RegistrationDetailsRequestDTO dto);

	public int saveAdditionalAddresses(EntityMailingAddress entity);

	public void updateAdditionalAddresses(AddressDetailsRequestDTO dto);

	public void updateOtherDetails(OtherDetailsRequestDTO dto);

	public int savePriorName(EntityPriorName entity);

	public int saveForeignName(EntityForeignName entity);

	public void deleteIndustryDetailsByCatCode(String industryCatCode);

	public void removeCurrentPrimaryCatId(Integer entityId);

	public void setNewPrimaryCatId(Integer entityId, Integer primaryCatId);

	public List<IndustryCategoryType> fetchIndustryCategoryTypeBySource(String source);

}
