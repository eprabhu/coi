package com.polus.fibicomp.globalentity.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
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

@javax.persistence.Entity
@Data
@Table(name = "ENTITY_SECTION_NOTE_REF")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EntitySectionNoteRef implements Serializable {

	private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ENTITY_SEC_NOTE_REF_ID")
    private Integer entitySecNoteRefId;

    @Column(name = "ENTITY_ID")
	private Integer entityId;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_SEC_NOTE_REF_FK1"), name = "ENTITY_ID", referencedColumnName = "ENTITY_ID", insertable = false, updatable = false)
	private Entity entity;

	@Column(name = "ENTITY_SECTION_CODE")
    private String sectionCode;

	@ManyToOne(optional = true)
    @JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_SEC_NOTE_REF_FK2"), name = "ENTITY_SECTION_CODE", referencedColumnName = "ENTITY_SECTION_CODE", insertable = false, updatable = false)
    private EntitySection entitySection;

	@Column(name = "ENTITY_NOTE_ID")
	private Integer entityNoteId;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_SEC_NOTE_REF_FK3"), name = "ENTITY_NOTE_ID", referencedColumnName = "NOTE_ID", insertable = false, updatable = false)
    private EntityNotes entityNotes;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

}
