package com.polus.fibicomp.reviewcomments.pojos;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
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

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.polus.fibicomp.reviewcomments.pojos.DisclComment;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "COI_REVIEW_COMMENT_TAGS")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoiReviewCommentTag implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "COI_REVIEW_COMMENT_TAGS_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer reviewCommentTagId;

	@Column(name = "COI_REVIEW_COMMENT_ID")
	private Integer commentId;

	@JsonBackReference
	@ManyToOne
	@JoinColumn(foreignKey = @ForeignKey(name = "DISCL_COMMENT_FK1"), name = "COI_REVIEW_COMMENT_ID",
			referencedColumnName = "COMMENT_ID", insertable = false, updatable = false)
	private DisclComment disclComment;

	@Column(name = "TAG_REF")
	private String tagRef;

	@Column(name = "TAGGED_PERSON_ID")
	private String tagPersonId;

	@Column(name = "TAGGED_GROUP_ID")
	private Integer tagGroupId;

	@LastModifiedDate
	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@LastModifiedBy
	@Column(name = "UPDATE_USER")
	private String updateUser;

	@Transient
	private String tagPersonFullName;

	@Transient
	private String tagGroupName;

}
