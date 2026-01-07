package com.polus.fibicomp.cmp.pojo;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.Data;

@Entity
@Table(name = "COI_CMP_TYPE_PROJECT_TYPE_REL")
@Data
public class CoiCmpTypeProjectTypeRel {

    @Id
    @Column(name = "CMP_PROJ_TYPE_REL_ID")
    private String cmpProjTypeRelId;

    @Column(name = "CMP_TYPE_CODE")
    private String cmpTypeCode;

    @Column(name = "COI_PROJECT_TYPE_CODE")
    private String coiProjectTypeCode;

    @Column(name = "IS_INCLUDED")
    private String isIncluded;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;
}
