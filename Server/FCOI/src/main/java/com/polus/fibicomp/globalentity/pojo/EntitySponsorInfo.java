package com.polus.fibicomp.globalentity.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

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
import com.polus.core.pojo.SponsorType;

import com.polus.core.pojo.State;
import com.polus.core.util.JpaCharBooleanConversion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@javax.persistence.Entity
@Data
@Table(name = "ENTITY_SPONSOR_INFO")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EntitySponsorInfo implements Serializable {

	private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "ENTITY_ID")
	private int entityId;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_SPONSOR_INFO_FK1"), name = "ENTITY_ID", referencedColumnName = "ENTITY_ID", insertable = false, updatable = false)
	private Entity entity;

    @Column(name = "SPONSOR_CODE")
    private String sponsorCode;

    @Column(name = "SPONSOR_NAME")
    private String sponsorName;

    @Column(name = "TRANSLATED_NAME")
    private String translatedName;

    @Column(name = "FEED_STATUS_CODE")
    private String feedStatusCode;

    @ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_SPONSOR_INFO_FK2"), name = "FEED_STATUS_CODE", referencedColumnName = "FEED_STATUS_CODE", insertable = false, updatable = false)
	private EntityFeedStatusType entityFeedStatusType;

    @Column(name = "SPONSOR_TYPE_CODE")
    private String sponsorTypeCode;

    @ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_SPONSOR_INFO_FK3"), name = "SPONSOR_TYPE_CODE", referencedColumnName = "SPONSOR_TYPE_CODE", insertable = false, updatable = false)
	private SponsorType sponsorType;

    @Column(name = "ACRONYM")
    private String acronym;

    @Column(name = "DODAC_NUMBER")
    private String dodacNumber;

    @Column(name = "AUDIT_REPORT_SENT_FOR_FY")
    private String auditReportSentForFy;

    @Column(name = "DUNNING_CAMPAIGN_ID")
    private String dunningCampaignId;

    @Column(name = "CUSTOMER_NUMBER")
    private String customerNumber;

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

    @Column(name = "COMMENTS")
    private String comments;

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
