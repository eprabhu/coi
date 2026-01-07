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

import com.polus.fibicomp.coi.pojo.CoiEntityType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@javax.persistence.Entity
@Data
@Table(name = "ENTITY_COMPLIANCE_INFO")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EntityComplianceInfo implements Serializable {

	private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "ENTITY_ID")
    private Integer entityId;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_COMPLIANCE_INFO_FK1"), name = "ENTITY_ID", referencedColumnName = "ENTITY_ID", insertable = false, updatable = false)
	private Entity entity;

	@Column(name = "ENTITY_TYPE_CODE")
	private String entityTypeCode;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_COMPLIANCE_INFO_FK2"), name = "ENTITY_TYPE_CODE", referencedColumnName = "ENTITY_TYPE_CODE", insertable = false, updatable = false)
	private CoiEntityType coiEntityType;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

}
