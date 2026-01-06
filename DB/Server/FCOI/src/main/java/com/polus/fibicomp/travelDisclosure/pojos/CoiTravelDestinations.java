package com.polus.fibicomp.travelDisclosure.pojos;

import com.polus.core.pojo.Country;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

import javax.persistence.Column;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;
import java.io.Serializable;
import java.sql.Date;
import java.sql.Timestamp;

@javax.persistence.Entity
@Table(name = "COI_TRAVEL_DESTINATIONS")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoiTravelDestinations implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "TRAVEL_DESTINATION_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer travelDestinationId;

    @Column(name = "TRAVEL_DISCLOSURE_ID")
    private Integer travelDisclosureId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(foreignKey = @ForeignKey(name = "COI_TRAVEL_FUNDING_AGENCIES_FK1"), name = "TRAVEL_DISCLOSURE_ID",
            referencedColumnName = "TRAVEL_DISCLOSURE_ID", insertable = false, updatable = false)
    private CoiTravelDisclosure coiTravelDisclosure;

    @Column(name = "PLACE_OF_STAY")
    private String placeOfStay;

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

    @Column(name = "TRAVEL_MEDIUM_DETAIL")
    private String travelMediumDetail;

    @Column(name = "STAY_START_DATE")
    private Date stayStartDate;

    @Column(name = "STAY_END_DATE")
    private Date stayEndDate;

    @LastModifiedDate
    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

    @LastModifiedBy
    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Transient
    private String countryName;

}
