package com.polus.integration.entity.cleansematch.dto;

import com.polus.integration.dnb.referencedata.entity.EntityBusinessType;
import com.polus.integration.entity.cleansematch.entity.Country;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class validateDuplicateResponseDTO {

	private Integer entityId;
	private String entityName;
	private String primaryAddressLine1;
	private String primaryAddressLine2;
	private String city;
	private String state;
	private String dunsNumber;
	private String ueiNumber;
	private String cageNumber;
	private String website;
	private String email;
	private String sponsorCode;
	private String organizationId;
	private String postalCode;
	private String phone;
	private String foreignName;
	private String priorName;
	private String ownershipType;
	private Country country;
	List<ForeignNameResponseDTO> foreignNames;
	private EntityBusinessType entityBusinessType;
	private List<EntityFamilyTreeRoleDto> entityFamilyTreeRoles;
	private Boolean isForeign;
}
