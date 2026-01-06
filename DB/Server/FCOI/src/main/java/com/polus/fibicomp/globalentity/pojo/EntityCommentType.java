package com.polus.fibicomp.globalentity.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.polus.core.util.JpaCharBooleanConversion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "ENTITY_COMMENT_TYPE")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EntityCommentType implements Serializable {

	private static final long serialVersionUID = 1L;

	 	@Id
	    @Column(name = "COMMENT_TYPE_CODE")
	    private String commentTypeCode;

	    @Column(name = "SECTION_CODE")
	    private String sectionCode;

	    @Column(name = "DESCRIPTION")
	    private String description;

	    @Column(name = "IS_SYSTEM_COMMENT_TYPE")
	    @Convert(converter = JpaCharBooleanConversion.class)
	    private Boolean isSystemCommentType;

	    @Column(name = "IS_PRIVATE")
	    @Convert(converter = JpaCharBooleanConversion.class)
	    private Boolean isPrivate;

	    @Column(name = "IS_ACTIVE")
	    @Convert(converter = JpaCharBooleanConversion.class)
	    private Boolean isActive;

	    @Column(name = "UPDATE_TIMESTAMP")
	    private Timestamp updateTimestamp;

	    @Column(name = "UPDATED_BY")
	    private String updatedBy;

	    @ManyToOne(optional = true)
	    @JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_COMMENT_TYPE_FK1"), name = "SECTION_CODE", referencedColumnName = "ENTITY_SECTION_CODE", insertable = false, updatable = false)
	    private EntitySection entitySection;

}
