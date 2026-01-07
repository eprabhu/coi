package com.polus.fibicomp.opa.pojo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.io.Serializable;
import java.sql.Timestamp;

@Entity
@Table(name = "OPA_ACTION_LOG")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OPAActionLog implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "ACTION_LOG_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer actionLogId;

	@Column(name = "OPA_DISCLOSURE_ID")
	private Integer opaDisclosureId;

	@Column(name = "OPA_DISCLOSURE_NUMBER")
	private String opaDisclosureNumber;

	@ManyToOne(optional = false)
	@JoinColumn(foreignKey = @ForeignKey(name = "OPA_ACTION_LOG_FK1"), name = "OPA_DISCLOSURE_ID", referencedColumnName = "OPA_DISCLOSURE_ID", insertable = false, updatable = false)
	private OPADisclosure opaDisclosure;

	@Column(name = "ACTION_TYPE_CODE")
	private String actionTypeCode;

	@ManyToOne
	@JoinColumn(foreignKey = @ForeignKey(name = "OPA_ACTION_LOG_FK2"), name = "ACTION_TYPE_CODE", referencedColumnName = "ACTION_TYPE_CODE", insertable = false, updatable = false)
	private OPAActionLogType opaActionLogType;

	@Column(name = "DESCRIPTION")
	private String description;
	
	@Column(name = "COMMENT")
	private String comment;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATE_USER")
	private String updateUser;

}
