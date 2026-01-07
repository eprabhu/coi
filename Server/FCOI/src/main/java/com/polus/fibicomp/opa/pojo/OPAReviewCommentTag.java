package com.polus.fibicomp.opa.pojo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.io.Serializable;
import java.sql.Timestamp;

@Entity
@Table(name = "OPA_REVIEW_COMMENT_TAGS")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OPAReviewCommentTag implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "OPA_REVIEW_COMMENT_TAGS_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer opaReviewCommentTagsId;

	@Column(name = "OPA_REVIEW_COMMENT_ID")
	private Integer opaReviewCommentId;

	@Column(name = "TAG_REF")
	private String tagRef;

	@Column(name = "TAGGED_PERSON_ID")
	private String tagPersonId;

	@Column(name = "TAGGED_GROUP_ID")
	private Integer tagGroupId;
	
	@Column(name = "OPA_REVIEW_ID")
	private Integer opaReviewId;

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
