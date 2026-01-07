package com.polus.fibicomp.globalentity.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Convert;
//import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.polus.core.util.JpaCharBooleanConversion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@javax.persistence.Entity
@Data
@Table(name = "ENTITY_COMMENT")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EntityComment implements Serializable {

	private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ENTITY_COMMENT_ID")
    private Integer entityCommentId;

    @Column(name = "ENTITY_ID")
	private Integer entityId;

    @Column(name = "ENTITY_NUMBER")
	private Integer entityNumber;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_COMMENT_FK1"), name = "ENTITY_ID", referencedColumnName = "ENTITY_ID", insertable = false, updatable = false)
	private Entity entity;

	@Column(name = "COMMENT_TYPE_CODE")
    private String commentTypeCode;

    @ManyToOne(optional = true)
    @JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_COMMENT_FK2"), name = "COMMENT_TYPE_CODE", referencedColumnName = "COMMENT_TYPE_CODE", insertable = false, updatable = false)
    private EntityCommentType commentType;

    @Column(name = "IS_PRIVATE", length = 1)
    @Convert(converter = JpaCharBooleanConversion.class)
    private Boolean isPrivate;

    @Column(name = "COMMENT")
    private String comment;

    @Column(name = "PARENT_COMMENT_ID")
    private Integer parentCommentId;

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
