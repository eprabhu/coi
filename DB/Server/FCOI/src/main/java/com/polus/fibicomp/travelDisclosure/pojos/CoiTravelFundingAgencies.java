package com.polus.fibicomp.travelDisclosure.pojos;

import com.polus.fibicomp.coi.pojo.ValidPersonEntityRelType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import java.io.Serializable;
import java.sql.Timestamp;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@Table(name = "COI_TRAVEL_FUNDING_AGENCIES")
@EntityListeners(AuditingEntityListener.class)
public class CoiTravelFundingAgencies implements Serializable {
	
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "TRAVEL_FUNDING_AGENCY_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer travelTravelerId;
	
	@Column(name = "TRAVEL_DISCLOSURE_ID")
	private Integer travelDisclosureId;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_TRAVEL_FUNDING_AGENCIES_FK1"), name = "TRAVEL_DISCLOSURE_ID",
			referencedColumnName = "TRAVEL_DISCLOSURE_ID", insertable = false, updatable = false)
	private CoiTravelDisclosure coiTravelDisclosure;

	@Column(name = "FUNDING_AGENCY_CODE")
	private String travelStatusCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_TRAVEL_FUNDING_AGENCIES_FK2"), name = "FUNDING_AGENCY_CODE",
			referencedColumnName = "FUNDING_AGENCY_CODE", insertable = false, updatable = false)
	private CoiTravelFundingAgencyType validPersonEntityRelType;
	
	@LastModifiedBy
	@Column(name = "UPDATED_BY")
	private String updatedBy;
	
	@LastModifiedDate
	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

}
