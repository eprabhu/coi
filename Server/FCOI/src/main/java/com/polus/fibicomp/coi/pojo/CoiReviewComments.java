package com.polus.fibicomp.coi.pojo;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclosure;
import com.polus.fibicomp.reviewcomments.pojos.CoiReviewCommentTag;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.polus.core.util.JpaCharBooleanConversion;

@Entity
@Table(name = "COI_REVIEW_COMMENT")
@EntityListeners(AuditingEntityListener.class)
public class CoiReviewComments implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "COI_REVIEW_COMMENT_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer coiReviewCommentId;
	
	@Column(name = "COI_REVIEW_ID")
	private Integer coiReviewId;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_REVIEW_COMMENT_FK1"), name = "COI_REVIEW_ID", referencedColumnName = "COI_REVIEW_ID", insertable = false, updatable = false)
	private CoiReview coiReview;

	@Column(name = "COI_SECTIONS_TYPE_CODE")
	private String coiSectionsTypeCode;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_REVIEW_COMMENT_FK2"), name = "COI_SECTIONS_TYPE_CODE", referencedColumnName = "COI_SECTIONS_TYPE_CODE", insertable = false, updatable = false)
	private CoiSectionsType coiSectionsType;

	@Column(name = "COI_SUB_SECTIONS_ID")
	private Integer coiSubSectionsId;

	@Column(name = "COI_REVIEW_ACTIVITY_ID")
	private String coiReviewActivityId;
	
	@Column(name = "DISCLOSURE_ID")
	private Integer disclosureId;
	
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_REVIEW_COMMENT_FK6"), name = "DISCLOSURE_ID", referencedColumnName = "DISCLOSURE_ID", insertable = false, updatable = false)
	private CoiDisclosure coiDisclosure;
	
	@Column(name = "COMMENTED_BY_PERSON_ID")
	private String commentedByPersonId;
	
	@Convert(converter = JpaCharBooleanConversion.class)
	@Column(name = "IS_PRIVATE")
	private Boolean isPrivate = false;

	@Column(name = "COI_PARENT_COMMENT_ID")
	private Integer coiParentCommentId;
	
	@Column(name = "COMMENT")
	private String comment;

	@LastModifiedBy
	@Column(name = "UPDATE_USER")
	private String updateUser;
	
	@LastModifiedDate
	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Transient
	private List<CoiReviewCommentAttachment> coiReviewCommentAttachment;
	
	@Transient
	private String updateUserFullName;
	
	@Transient
	private List<CoiReviewCommentTag> coiReviewCommentTag;

	@Transient
	private PersonEntity personEntity;
	
	public Integer getCoiReviewCommentId() {
		return coiReviewCommentId;
	}

	public void setCoiReviewCommentId(Integer coiReviewCommentId) {
		this.coiReviewCommentId = coiReviewCommentId;
	}

	public Integer getCoiReviewId() {
		return coiReviewId;
	}

	public void setCoiReviewId(Integer coiReviewId) {
		this.coiReviewId = coiReviewId;
	}

	public CoiReview getCoiReview() {
		return coiReview;
	}

	public void setCoiReview(CoiReview coiReview) {
		this.coiReview = coiReview;
	}

	public String getCoiSectionsTypeCode() {
		return coiSectionsTypeCode;
	}

	public void setCoiSectionsTypeCode(String coiSectionsTypeCode) {
		this.coiSectionsTypeCode = coiSectionsTypeCode;
	}

	public CoiSectionsType getCoiSectionsType() {
		return coiSectionsType;
	}

	public void setCoiSectionsType(CoiSectionsType coiSectionsType) {
		this.coiSectionsType = coiSectionsType;
	}

	public Integer getCoiSubSectionsId() {
		return coiSubSectionsId;
	}

	public void setCoiSubSectionsId(Integer coiSubSectionsId) {
		this.coiSubSectionsId = coiSubSectionsId;
	}

	public String getUpdateUser() {
		return updateUser;
	}

	public void setUpdateUser(String updateUser) {
		this.updateUser = updateUser;
	}

	public Timestamp getUpdateTimestamp() {
		return updateTimestamp;
	}

	public void setUpdateTimestamp(Timestamp updateTimestamp) {
		this.updateTimestamp = updateTimestamp;
	}

	public Integer getCoiParentCommentId() {
		return coiParentCommentId;
	}

	public void setCoiParentCommentId(Integer coiParentCommentId) {
		this.coiParentCommentId = coiParentCommentId;
	}

	public String getCoiReviewActivityId() {
		return coiReviewActivityId;
	}

	public void setCoiReviewActivityId(String coiReviewActivityId) {
		this.coiReviewActivityId = coiReviewActivityId;
	}

	public String getCommentedByPersonId() {
		return commentedByPersonId;
	}

	public void setCommentedByPersonId(String commentedByPersonId) {
		this.commentedByPersonId = commentedByPersonId;
	}

	public Boolean getIsPrivate() {
		return isPrivate;
	}

	public void setIsPrivate(Boolean isPrivate) {
		this.isPrivate = isPrivate;
	}

	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}

	public Integer getDisclosureId() {
		return disclosureId;
	}

	public void setDisclosureId(Integer disclosureId) {
		this.disclosureId = disclosureId;
	}

	public List<CoiReviewCommentAttachment> getCoiReviewCommentAttachment() {
		return coiReviewCommentAttachment;
	}

	public void setCoiReviewCommentAttachment(List<CoiReviewCommentAttachment> coiReviewCommentAttachment) {
		this.coiReviewCommentAttachment = coiReviewCommentAttachment;
	}

	public String getUpdateUserFullName() {
		return updateUserFullName;
	}

	public void setUpdateUserFullName(String updateUserFullName) {
		this.updateUserFullName = updateUserFullName;
	}

	public List<CoiReviewCommentTag> getCoiReviewCommentTag() {
		return coiReviewCommentTag;
	}

	public void setCoiReviewCommentTag(List<CoiReviewCommentTag> coiReviewCommentTag) {
		this.coiReviewCommentTag = coiReviewCommentTag;
	}

	public CoiDisclosure getCoiDisclosure() {
		return coiDisclosure;
	}

	public void setCoiDisclosure(CoiDisclosure coiDisclosure) {
		this.coiDisclosure = coiDisclosure;
	}

	public PersonEntity getPersonEntity() {
		return personEntity;
	}

	public void setPersonEntity(PersonEntity personEntity) {
		this.personEntity = personEntity;
	}

}
