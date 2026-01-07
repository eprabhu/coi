package com.polus.fibicomp.travelDisclosure.pojos;

import java.io.Serializable;
import java.sql.Timestamp;

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

import com.polus.fibicomp.coi.pojo.ValidPersonEntityRelType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@Table(name = "COI_TRAVEL_DISCLOSURE_TRAVELER")
@EntityListeners(AuditingEntityListener.class)
public class CoiTravelDisclosureTraveler implements Serializable {
	
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "TRAVEL_TRAVELER_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer travelTravelerId;
	
	@Column(name = "TRAVEL_DISCLOSURE_ID")
	private Integer travelDisclosureId;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_TRAVEL_DISCLOSURE_TRAVELER_FK1"), name = "TRAVEL_DISCLOSURE_ID",
			referencedColumnName = "TRAVEL_DISCLOSURE_ID", insertable = false, updatable = false)
	private CoiTravelDisclosure coiTravelDisclosure;

	@Column(name = "VALID_PERS_ENTITY_REL_TYP_CODE")
	private Integer validPersonEntityRelTypeCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_TRAVEL_DISCLOSURE_TRAVELER_FK2"), name = "VALID_PERS_ENTITY_REL_TYP_CODE",
			referencedColumnName = "VALID_PERS_ENTITY_REL_TYP_CODE", insertable = false, updatable = false)
	private ValidPersonEntityRelType validPersonEntityRelType;
	
	@LastModifiedBy
	@Column(name = "UPDATED_BY")
	private String updatedBy;
	
	@LastModifiedDate
	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

}
