package com.polus.fibicomp.globalentity.pojo;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import lombok.Data;

@Entity
@Data
@Table(name = "VALID_ENTITY_ATTACH_TYPE")
public class ValidEntityAttachType implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "VALID_ENTITY_ATTACH_TYPE_ID")
	private String validEntityAttachTypeId;

	@Column(name = "ATTACHMENT_TYPE_CODE")
	private String attachmentTypeCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "VALID_ENTITY_ATTACH_TYPE_FK1"), name = "ATTACHMENT_TYPE_CODE", referencedColumnName = "ATTACHMENT_TYPE_CODE", insertable = false, updatable = false)
	private EntityAttachmentType entityAttachmentType;

	@Column(name = "ENTITY_SECTION_CODE")
	private String entitySectionCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_SECTION_CODE"), name = "ENTITY_SECTION_CODE", referencedColumnName = "ENTITY_SECTION_CODE", insertable = false, updatable = false)
	private EntitySection entitySection;

}
