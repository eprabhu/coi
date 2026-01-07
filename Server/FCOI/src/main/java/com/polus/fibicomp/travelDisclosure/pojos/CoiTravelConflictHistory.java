package com.polus.fibicomp.travelDisclosure.pojos;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "COI_TRAVEL_CONFLICT_HISTORY")
@EntityListeners(AuditingEntityListener.class)
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class CoiTravelConflictHistory implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "COI_TRAVEL_CONFLICT_HISTORY_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer coiTravelConflictHistoryId;

	@Column(name = "TRAVEL_DISCLOSURE_ID")
	private Integer travelDisclosureId;

	@Column(name = "COMMENT")
	private String comment;

	@Column(name = "CONFLICT_STATUS_CODE")
	private String conflictStatusCode;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@LastModifiedBy
	@Column(name = "UPDATE_USER")
	private String updateUser;

	@Transient
	private String updateUserFullName;

	@Transient
	private String conflictStatusDescription;

}
