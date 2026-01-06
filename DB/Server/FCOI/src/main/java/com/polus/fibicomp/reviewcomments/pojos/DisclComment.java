package com.polus.fibicomp.reviewcomments.pojos;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.polus.core.util.JpaCharBooleanConversion;
import com.polus.fibicomp.coi.dto.ProjectCommentDto;
import com.polus.fibicomp.coi.pojo.CoiReviewAttachment;
import com.polus.fibicomp.reviewcomments.dto.ModuleSectionDetailsDto;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "DISCL_COMMENT")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class DisclComment implements Serializable {
	
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "COMMENT_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer commentId;

	@Column(name = "DOCUMENT_OWNER_PERSON_ID")
	private String documentOwnerPersonId;

	@Column(name = "COMMENT_BY_PERSON_ID")
	private String commentPersonId;

	@Column(name = "COMMENT_TYPE_CODE")
	private String commentTypeCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "DISCL_COMMENT_FK2"), name = "COMMENT_TYPE_CODE",
			referencedColumnName = "COMMENT_TYPE_CODE", insertable = false, updatable = false)
	private DisclCommentType commentType;

	@Column(name = "COMPONENT_TYPE_CODE")
	private String componentTypeCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "DISCL_COMMENT_FK1"), name = "COMPONENT_TYPE_CODE",
			referencedColumnName = "COMPONENT_TYPE_CODE", insertable = false, updatable = false)
	private DisclComponentType componentType;

	@Column(name = "PARENT_COMMENT_ID")
	private Integer parentCommentId;

	@JsonManagedReference
	@OneToMany(mappedBy="disclComment", orphanRemoval = true, cascade = {CascadeType.ALL}, fetch = FetchType.EAGER)
	private List<CoiReviewCommentTag> commentTags;

	@Column(name = "IS_Private")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isPrivate;

	@Column(name = "COMMENT")
	private String comment;

	@Column(name = "MODULE_ITEM_KEY")
	private Integer moduleItemKey;

	@Column(name = "MODULE_ITEM_NUMBER")
	private String moduleItemNumber;

	@Column(name = "SUB_MODULE_ITEM_KEY")
	private String subModuleItemKey;

	@Column(name = "SUB_MODULE_ITEM_NUMBER")
	private String subModuleItemNumber;

	@NotNull
	@Column(name = "MODULE_CODE")
	private Integer moduleCode;

	@Column(name = "SUB_MODULE_CODE")
	private Integer subModuleCode;

	@Column(name = "FORM_BUILDER_ID")
	private Integer formBuilderId;

	@Column(name = "FORM_BUILDER_SECTION_ID")
	private Integer formBuilderSectionId;

	@Column(name = "FORM_BUILDER_COMPONENT_ID")
	private Integer formBuilderComponentId;

	@Column(name = "IS_RESOLVED")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isResolved;

	@Column(name = "RESOLVED_BY")
	private String resolvedBy;

	@Column(name = "RESOLVED_TIMESTAMP")
	private Timestamp resolvedTimestamp;

	@LastModifiedBy
	@Column(name = "UPDATE_USER")
	private String updateUser;
	
	@LastModifiedDate
	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Transient
	private String updateUserFullName;

	@Transient
	private List<DisclComment> childComments;

	@Transient
	private List<CoiReviewAttachment> reviewAttachments;

	@Transient
	private ModuleSectionDetailsDto moduleSectionDetails;

	@Transient
	private Boolean isSectionDetailsNeeded;

	@Transient
	private List<ProjectCommentDto> projectComments;

	@Transient
	private String resolvedUserFullName;

	@Transient
	private Boolean isParentCommentResolved;

}
