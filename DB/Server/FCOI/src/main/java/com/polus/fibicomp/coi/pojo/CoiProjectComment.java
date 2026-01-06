package com.polus.fibicomp.coi.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.polus.core.person.pojo.Person;
import com.polus.core.util.JpaCharBooleanConversion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "COI_PROJECT_COMMENT")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoiProjectComment implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "COMMENT_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer commentId;

	@Column(name = "COMMENT_BY")
	private String commentBy;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_PROJECT_COMMENT_FK1"), name = "COMMENT_BY", referencedColumnName = "PERSON_ID", insertable = false, updatable = false)
	private Person person;
	
	@Column(name = "PARENT_COMMENT_ID")
	private Integer parentCommentId;

	@Column(name = "COMMENT")
	private String comment;

	@Column(name = "COMMENT_TYPE_CODE")
	private String commentTypeCode;

	@ManyToOne
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_PROJECT_COMMENT_FK2"), name = "COMMENT_TYPE_CODE", referencedColumnName = "COMMENT_TYPE_CODE", insertable = false, updatable = false)
	private CoiProjectCommentType commentType;

	@Column(name = "MODULE_CODE")
	private Integer moduleCode;

	@Column(name = "IS_PRIVATE")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isPrivate;

	@Column(name = "MODULE_ITEM_KEY")
	private String moduleItemKey;

	@Column(name = "IS_RESOLVED")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isResolved;

	@Column(name = "RESOLVED_BY")
	private String resolvedBy;

	@Column(name = "RESOLVED_TIMESTAMP")
	private Timestamp resolvedTimestamp;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATED_BY")
	private String updatedBy;

}
