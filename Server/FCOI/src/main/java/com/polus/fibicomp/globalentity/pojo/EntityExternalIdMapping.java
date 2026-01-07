package com.polus.fibicomp.globalentity.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
//import javax.persistence.Entity;
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
@Table(name = "ENTITY_EXTERNAL_ID_MAPPING")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EntityExternalIdMapping implements Serializable {

	private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ENTITY_EXTERNAL_MAPPING_ID")
    private int entityExternalMappingId;

    @Column(name = "ENTITY_ID")
	private int entityId;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_EXTERNAL_MAPPING_FK1"), name = "ENTITY_ID", referencedColumnName = "ENTITY_ID", insertable = false, updatable = false)
	private Entity entity;

	@Column(name = "EXTERNAL_ID_TYPE_CODE")
    private String externalIdTypeCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_EXTERNAL_MAPPING_FK2"), name = "EXTERNAL_ID_TYPE_CODE", referencedColumnName = "EXTERNAL_ID_TYPE_CODE", insertable = false, updatable = false)
	private EntityExternalIdType entityExternalIdType;

	@Column(name = "EXTERNAL_ID")
    private String externalId;

	@Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "SPONSOR_CODE")
    private String sponsorCode;

    @Column(name = "ORGANIZATION_ID")
    private String organizationId;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

}
