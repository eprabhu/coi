package com.polus.fibicomp.globalentity.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Convert;
//import javax.persistence.Entity;
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
@Table(name = "ENTITY_MAILING_ADDRESS")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EntityMailingAddress implements Serializable {

	private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ENTITY_MAILING_ADDRESS_ID")
    private int entityMailingAddressId;

    @Column(name = "ENTITY_ID")
	private int entityId;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_MAILING_ADDRESS_FK1"), name = "ENTITY_ID", referencedColumnName = "ENTITY_ID", insertable = false, updatable = false)
	private Entity entity;

    @Column(name = "ADDRESS_TYPE_CODE")
    private String addressTypeCode;

    @ManyToOne(optional = true)
    @JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_MAILING_ADDRESS_FK3"), name = "ADDRESS_TYPE_CODE", referencedColumnName = "ADDRESS_TYPE_CODE", insertable = false, updatable = false)
    private EntityAddressType entityAddressType;

    @Column(name = "ADDRESS_LINE_1")
    private String addressLine1;

    @Column(name = "ADDRESS_LINE_2")
    private String addressLine2;

    @Column(name = "CITY")
    private String city;

    @Column(name = "STATE")
    private String state;

    @Column(name = "POST_CODE")
    private String postCode;

    @Column(name = "COUNTRY_CODE")
    private String countryCode;

    @ManyToOne(optional = true)
    @JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_MAILING_ADDRESS_FK2"), name = "COUNTRY_CODE", referencedColumnName = "COUNTRY_CODE", insertable = false, updatable = false)
    private Country country;

    @Column(name = "LOCALITY")
    private String locality;

    @Column(name = "REGION")
    private String region;

    @Column(name = "COUNTY")
    private String county;

    @Column(name = "IS_COPY")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isCopy;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @ManyToOne(optional = true)
    @JoinColumn(name = "STATE", referencedColumnName = "STATE_CODE", insertable = false, updatable = false)
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private State stateDetails;

}
