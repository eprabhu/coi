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
@Table(name = "ENTITY_TELEPHONE")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EntityTelephone implements Serializable {

	private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ENTITY_TELEPHONE_ID")
    private int entityTelephoneId;

    @Column(name = "ENTITY_ID")
	private int entityId;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_TELEPHONE_FK1"), name = "ENTITY_ID", referencedColumnName = "ENTITY_ID", insertable = false, updatable = false)
	private Entity entity;

    @Column(name = "INT_DIALING_CODE")
    private String intDialingCode;

    @Column(name = "TELEPHONE_NUMBER")
    private Long telephoneNumber;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

}
