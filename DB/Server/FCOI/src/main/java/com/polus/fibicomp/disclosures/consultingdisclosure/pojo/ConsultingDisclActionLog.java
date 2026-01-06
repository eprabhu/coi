package com.polus.fibicomp.disclosures.consultingdisclosure.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "CONSULTING_DISCL_ACTION_LOG")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultingDisclActionLog implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "ACTION_LOG_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer actionLogId;

	@Column(name = "DISCLOSURE_ID")
	private Integer disclosureId;

	@ManyToOne(optional = false)
	@JoinColumn(foreignKey = @ForeignKey(name = "CONSULTING_ACTION_LOG_FK1"), name = "DISCLOSURE_ID", referencedColumnName = "DISCLOSURE_ID", insertable = false, updatable = false)
	private ConsultingDisclosure consultingDisclosure;

	@Column(name = "ACTION_TYPE_CODE")
	private String actionTypeCode;

	@ManyToOne
	@JoinColumn(foreignKey = @ForeignKey(name = "CONSULTING_ACTION_LOG_FK2"), name = "ACTION_TYPE_CODE", referencedColumnName = "ACTION_TYPE_CODE", insertable = false, updatable = false)
	private ConsultingDisclActionLogType consultingDisclActionLogType;

	@Column(name = "DESCRIPTION")
	private String description;

	@Column(name = "COMMENT")
	private String comment;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATE_USER")
	private String updateUser;

}
