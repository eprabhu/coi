package com.polus.fibicomp.globalentity.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
//import javax.persistence.Entity;
import javax.persistence.Convert;
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
@Table(name = "ENTITY_FAMILY_TREE")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EntityFamilyTree implements Serializable {

	private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ENTITY_FAMILY_TREE_ID")
    private Integer entityFamilyTreeId;

    @Column(name = "ENTITY_NUMBER")
    private Integer entityNumber;

    @Column(name = "PARENT_ENTITY_NUMBER")
    private Integer parentEntityNumber;

    @Column(name = "GLOBAL_ULTIMATE_ENTITY_NUMBER")
    private Integer globalUltimateEntityNumber;

    @Column(name = "IS_SYSTEM_CREATED")
    @Convert(converter = JpaCharBooleanConversion.class)
    private Boolean isSystemCreated;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

}
