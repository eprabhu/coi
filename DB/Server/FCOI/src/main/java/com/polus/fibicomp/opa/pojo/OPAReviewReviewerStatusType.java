package com.polus.fibicomp.opa.pojo;

import com.polus.core.util.JpaCharBooleanConversion;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.io.Serializable;
import java.sql.Timestamp;

@Entity
@Table(name = "OPA_REVIEW_REVIEWER_STATUS_TYPE")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class OPAReviewReviewerStatusType implements Serializable {
	
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "REVIEW_STATUS_CODE")
	private String reviewStatusCode;

	@Column(name = "DESCRIPTION")
	private String description;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATE_USER")
	private String updateUser;

	@Column(name = "IS_ACTIVE")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isActive;

	@Column(name = "SORT_ORDER")
	private String sortOrder;
	
}
