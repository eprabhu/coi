package com.polus.integration.entity.enrich.dao;

import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.integration.entity.base.dto.DnBOrganizationDetails.FamilyTreeRole;
import com.polus.integration.entity.cleansematch.dao.EntityCleanUpDao;
import com.polus.integration.entity.dunsRefresh.constants.DunsRefreshConstants;
import com.polus.integration.pojo.State;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.polus.integration.entity.enrich.dto.EntityEnrichAPIResponse;
import com.polus.integration.entity.enrich.dto.EntityEnrichAPIResponse.Organization;
import com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.DefaultType;
import com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.DetailedAddress;
import com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.DunsControlStatus;
import com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.IndustryCode;
import com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.MultilingualPrimaryName;
import com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.RegistrationNumber;
import com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.Telephone;

@Slf4j
@Transactional
@Repository
public class EntityEnrichDAO {

    @Autowired
    private JdbcTemplate jdbcTemplate;

	@Autowired
	private EntityManager entityManager;

	@Autowired
	private EntityCleanUpDao entityCleanUpDao;
    
        
   public void refreshEntityHeaderInfo(Integer entityId, String actionPersonId, Organization res) {

	   try {
	   String sql = "{call ENRICH_ENTITY_HEADER(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)}";

       jdbcTemplate.update(sql,
    		   entityId, 
    		   res.getPrimaryName(),    		   
    		   null, //  it will be removed res.getMultilingualPrimaryName(),
    		   res.getPriorName(),
    		   res.getTradeStyleNames(),
    		   res.getDuns(),
    		   res.getUei(),
    		   res.getCageNumber(),
    		   res.getFederalEmployerId(),    	
    		   res.getOwnershipType(),
    		   getOperatingStatusType(res.getDunsControlStatus()),
    		   getBusinessEntityType(res.getBusinessEntityType()),
    		   res.getWebsiteAddress(),
    		   res.getStartDate(), 
    		   res.getIncorporatedDate(),
    		   res.getNumberOfEmployees(),
    		   res.getCertifiedEmail(),
    		   res.getSummary(),
    		   res.getDefaultCurrency(),
    		   getPrimaryTelephone(res.getTelephone()),
    		   getLine1(res.getPrimaryAddress()),
    		   getLine2(res.getPrimaryAddress()),
    		   getCity(res.getPrimaryAddress()),
    		   getState(res.getPrimaryAddress()),
    		   getPostCode(res.getPrimaryAddress()),
    		   getCountry(res.getPrimaryAddress()),
    		   res.getHumanSubAssurance(),
    		   res.getAnimalWelfareAssurance(),
    		   res.getAnimalAccreditaion(),
    		   actionPersonId
    		   );
       
	   }catch(Exception e) {
		   e.printStackTrace();
	   }
              
   }

	public void refreshEntityIndustryCode(Integer entityId, String actionPersonId, List<IndustryCode> industryCodes) {
		try {
			if (industryCodes == null || industryCodes.isEmpty()) {
				return;
			}

			ObjectMapper objectMapper = new ObjectMapper();
			String industryCodesJsonData = objectMapper.writeValueAsString(industryCodes);

			String sql = "{call ENRICH_ENTITY_INDUSTRY_CATE_JSON(?, ?, ?)}";

			jdbcTemplate.update(sql, entityId, actionPersonId, industryCodesJsonData);

		} catch (Exception e) {
			e.printStackTrace();
		}

	}

   public void refreshEntityRegistration(Integer entityId, String actionPersonId, List<RegistrationNumber> registrationNumbers) {
	  try { 
	   			if (registrationNumbers == null || registrationNumbers.isEmpty()) {
					return;
				}
				String sql = "{call ENRICH_ENTITY_REGISTRATION(?,?,?,?,?)}";
				for (RegistrationNumber input : registrationNumbers) {

					jdbcTemplate.update(sql, 
							entityId,							
							input.getRegistrationNumber(),
							input.getTypeDescription(),							
							input.getTypeDnBCode(),
							actionPersonId);
				}
	   }catch(Exception e) {
		   e.printStackTrace();
	   }		
	   
   }

   public void refreshEntityTelephone(Integer entityId, String actionPersonId, List<Telephone> telephone) {
	   
	   try {
	   		if (telephone == null || telephone.isEmpty()) {
				return;
			}
			String sql = "{call ENRICH_ENTITY_TELEPHONE(?,?,?,?)}";
			for (Telephone input : telephone) {

				jdbcTemplate.update(sql, 
						entityId,							
						input.getTelephoneNumber(),
						input.getIsdCode(),
						actionPersonId);
			}
	   }catch(Exception e) {
		   e.printStackTrace();
	   }	
			
   }
   
   public void refreshEntityTradeName(Integer entityId, String actionPersonId, EntityEnrichAPIResponse response) {
   
   }
   
   private String getLine1(DetailedAddress address) {
	   if(address != null && address.getStreetAddress() != null) {
		   return address.getStreetAddress().getLine1();
	   }
	   return null;
   }
   
   private String getLine2(DetailedAddress address) {
	   if(address != null && address.getStreetAddress() != null) {
		   return address.getStreetAddress().getLine2();
	   }
	   return null;
   }
   
   private String getCity(DetailedAddress address) {
	   if(address != null && address.getAddressLocality() != null) {
		   return address.getAddressLocality().getName();
	   }
	   return null;
   }
   
   private String getState(DetailedAddress address) {
	   if (address != null && address.getAddressRegion() != null) {
		   State state = entityCleanUpDao.findStateByStateCodeCountryCode(getCountry(address), address.getAddressRegion().getAbbreviatedName());
		   return state != null ? state.getStateCode() :
				   (address.getAddressRegion().getAbbreviatedName() != null ? address.getAddressRegion().getAbbreviatedName() :
						   address.getAddressRegion().getName());
	   }
	   return null;
   }
   
   
   private String getCountry(DetailedAddress address) {
	   if(address != null && address.getAddressCountry() != null) {
		   return address.getAddressCountry().getIsoAlpha2Code();
	   }
	   return null;
   }
   private String getPostCode(DetailedAddress address) {
	   if(address != null && address.getPostalCode() != null) {
		   return address.getPostalCode();
	   }
	   return null;
   }   
   private String getPrimaryTelephone(List<Telephone> telephone) {
	   if(telephone == null) {
		   return null;
	   }
	   
	   if(telephone != null && telephone.isEmpty()) {
		   return null;
	   }
	   
	   if(telephone != null && telephone.get(0) != null) {
		   return telephone.get(0).getTelephoneNumber();
	   }	   
	   return null;
   }
   
  
   private Integer getOperatingStatusType(DunsControlStatus dunsControlStatus) {
	   if(dunsControlStatus != null && dunsControlStatus.getOperatingStatus()!= null) {
		   return dunsControlStatus.getOperatingStatus().getDnbCode();
	   }
	   return null;
   }
   private Integer getBusinessEntityType(DefaultType businessEntityType) {
	   if(businessEntityType != null ) {
		   
		   if(businessEntityType.getDnbCode()== 0) {
			   return null;
		   }
		   
		   return businessEntityType.getDnbCode();
	   }
	   return null;
   }  
   
   
	public void refreshForiegnName(Integer entityId, String actionPersonId,
			List<MultilingualPrimaryName> multilingualPrimaryName) {

		try {
			if (multilingualPrimaryName == null || multilingualPrimaryName.isEmpty()) {
				return;
			}		
			
			
			String sql = "{call ENRICH_FOREIGN_NAME(?,?,?)}";
			for (MultilingualPrimaryName input : multilingualPrimaryName) {
				
				if(input.getLanguage() != null && input.getLanguage().getDnbCode() == DunsRefreshConstants.LANGUAGE_DNBCODE_ENGLISH) { //English name not need to add
					continue;
				}
					
				jdbcTemplate.update(sql, entityId, input.getName(), actionPersonId);
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

	}

	public void refreshEntityCorporateLinkage(Integer entityId, String actionPersonId, List<FamilyTreeRole> familyRoleTypeCodes) {
		try {
			if (familyRoleTypeCodes == null || familyRoleTypeCodes.isEmpty()) {
				return;
			}
			String sql = "{call ENRICH_ENTITY_CORPORATE_LINKAGE(?,?,?)}";
			for (FamilyTreeRole familyRoleType : familyRoleTypeCodes) {
				jdbcTemplate.update(sql, entityId, familyRoleType.getDnbCode(), actionPersonId);
			}
		} catch(Exception e) {
			e.printStackTrace();
		}

	}

	public void refreshEntityMailingAddress(Integer entityId, String actionPersonId, DetailedAddress mailingAddress) {
		try {
			if (mailingAddress == null || mailingAddress.getAddressCountry() == null) {
				Query query = entityManager.createNativeQuery("DELETE FROM ENTITY_MAILING_ADDRESS WHERE ENTITY_ID = :entityId AND ADDRESS_TYPE_CODE = 2");
				query.setParameter("entityId", entityId);
				query.executeUpdate();
				return;
			}
			String sql = "{call ENRICH_ENTITY_MAILING_ADDRESS(?,?,?,?,?,?,?,?)}";
			jdbcTemplate.update(sql,
					entityId,
					getCountry(mailingAddress),
					getCity(mailingAddress),
					getState(mailingAddress),
					getPostCode(mailingAddress),
					getLine1(mailingAddress),
					getLine2(mailingAddress),
					actionPersonId
					);
		} catch (Exception e) {
			log.warn("Exception on refreshEntityMailingAddress : {}", e.getMessage());
		}
	}
}
