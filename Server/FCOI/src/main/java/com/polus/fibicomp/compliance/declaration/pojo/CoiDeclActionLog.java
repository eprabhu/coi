package com.polus.fibicomp.compliance.declaration.pojo;

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
@Table(name = "COI_DECL_ACTION_LOG")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoiDeclActionLog {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "ACTION_LOG_ID")
	private Integer actionLogId;

	@Column(name = "DECLARATION_ID")
	private Integer declarationId;

	@Column(name = "DECLARATION_NUMBER")
	private String declarationNumber;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_DECL_ACTION_LOG_FK1"), name = "DECLARATION_ID", referencedColumnName = "DECLARATION_ID", insertable = false, updatable = false)
	private CoiDeclaration declaration;

	@Column(name = "ACTION_TYPE_CODE")
	private String actionTypeCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_DECL_ACTION_LOG_FK2"), name = "ACTION_TYPE_CODE", referencedColumnName = "ACTION_TYPE_CODE", insertable = false, updatable = false)
	private CoiDeclActionLogType actionLogType;

	@Column(name = "ACTION_MESSAGE")
	private String actionMessage;

	@Column(name = "COMMENT")
	private String comment;

	@Column(name = "CREATED_BY")
	private String createdBy;

	@Column(name = "CREATE_TIMESTAMP")
	private Timestamp createTimestamp;

}
