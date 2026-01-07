package com.polus.fibicomp.globalentity.pojo;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.Date;

import javax.persistence.Column;
//import javax.persistence.Entity;
import javax.persistence.Convert;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.polus.core.pojo.Country;
import com.polus.core.pojo.State;
import com.polus.core.util.JpaCharBooleanConversion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@javax.persistence.Entity
@Data
@Table(name = "ENTITY_SUB_ORG_INFO")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EntitySubOrgInfo implements Serializable {

	private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "ENTITY_ID")
	private Integer entityId;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_SUB_ORG_INFO_FK1"), name = "ENTITY_ID", referencedColumnName = "ENTITY_ID", insertable = false, updatable = false)
	private Entity entity;

    @Column(name = "ORGANIZATION_ID")
    private String organizationId;

    @Column(name = "ORGANIZATION_NAME")
    private String organizationName;
   
    @Column(name = "ORGANIZATION_TYPE_CODE")
    private String organizationTypeCode;

    @ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_SUB_ORG_INFO_FK2"), name = "ORGANIZATION_TYPE_CODE", referencedColumnName = "ORGANIZATION_TYPE_CODE", insertable = false, updatable = false)
	private EntityOrganizationType entityOrganizationType;

    @Column(name = "FEED_STATUS_CODE")
    private String feedStatusCode;

    @ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_SUB_ORG_INFO_FK3"), name = "FEED_STATUS_CODE", referencedColumnName = "FEED_STATUS_CODE", insertable = false, updatable = false)
	private EntityFeedStatusType entityFeedStatusType;

    @Column(name = "IRS_TAX_EXEMPTION")
    private String irsTaxExemption;

    @Column(name = "MASS_TAX_EXEMPT_NUM")
    private String massTaxExemptNum;

    @Column(name = "AGENCY_SYMBOL")
    private String agencySymbol;

    @Column(name = "VENDOR_CODE")
    private String vendorCode;

    @Column(name = "COM_GOV_ENTITY_CODE")
    private String comGovEntityCode;

    @Column(name = "MASS_EMPLOYEE_CLAIM")
    private String massEmployeeClaim;

    @Column(name = "SCIENCE_MISCONDUCT_COMPL_DATE")
    private Date scienceMisconductComplDate;

    @Column(name = "PHS_ACOUNT")
    private String phsAcount;

    @Column(name = "NSF_INSTITUTIONAL_CODE")
    private String nsfInstitutionalCode;

    @Column(name = "INDIRECT_COST_RATE_AGREEMENT")
    private String indirectCostRateAgreement;

    @Column(name = "COGNIZANT_AUDITOR")
    private String cognizantAuditor;

    @Column(name = "ONR_RESIDENT_REP")
    private String onrResidentRep;

    @Column(name = "LOBBYING_REGISTRANT")
    private String lobbyingRegistrant;

    @Column(name = "LOBBYING_INDIVIDUAL")
    private String lobbyingIndividual;

    @Column(name = "SAM_EXPIRATION_DATE")
    private Date samExpirationDate;

    @Column(name = "SUB_AWD_RISK_ASSMT_DATE")
    private Date subAwdRiskAssmtDate;

    @Column(name = "DUNS_NUMBER")
    private String dunsNumber;

    @Column(name = "UEI_NUMBER")
    private String ueiNumber;

    @Column(name = "CAGE_NUMBER")
    private String cageNumber;

    @Column(name = "PRIMARY_ADDRESS_LINE_1")
    private String primaryAddressLine1;

    @Column(name = "PRIMARY_ADDRESS_LINE_2")
    private String primaryAddressLine2;

    @Column(name = "CITY")
    private String city;

    @Column(name = "STATE")
    private String state;

    @ManyToOne(optional = true)
    @JoinColumn(name = "STATE", referencedColumnName = "STATE_CODE", insertable = false, updatable = false)
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private State stateDetails;

    @Column(name = "POST_CODE")
    private String postCode;

    @Column(name = "COUNTRY_CODE")
    private String countryCode;

    @ManyToOne
    @JoinColumn(foreignKey = @ForeignKey(name = "COUNTRY_CODE_FK4"), name = "COUNTRY_CODE", referencedColumnName = "COUNTRY_CODE", insertable = false, updatable = false)
    private Country country;

    @Column(name = "EMAIL_ADDRESS")
    private String emailAddress;

    @Column(name = "PHONE_NUMBER")
    private String phoneNumber;

    @Column(name = "HUMAN_SUB_ASSURANCE")
    private String humanSubAssurance;

    @Column(name = "ANIMAL_WELFARE_ASSURANCE")
    private String animalWelfareAssurance;

    @Column(name = "ANIMAL_ACCREDITATION")
    private String animalAccreditation;

    @Column(name = "CONGRESSIONAL_DISTRICT")
    private String congressionalDistrict;

    @Column(name = "INCORPORATED_IN")
    private String incorporatedIn;

    @Column(name = "INCORPORATED_DATE")
    private String incorporatedDate;

    @Column(name = "NUMBER_OF_EMPLOYEES")
    private Integer numberOfEmployees;

    @Column(name = "FEDERAL_EMPLOYER_ID")
    private String federalEmployerId;

    @Column(name = "IS_COPY")
    @Convert(converter = JpaCharBooleanConversion.class)
    private Boolean isCopy;

    @Column(name = "ROLODEX_ID")
    private Integer rolodexId;

    @Column(name = "IS_CREATED_FROM_IMPORT_ENTITY")
    @Convert(converter = JpaCharBooleanConversion.class)
    private Boolean isCreatedFromImportEntity;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

}
