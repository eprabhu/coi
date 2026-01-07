package com.polus.fibicomp.cmp.pojo;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "COI_MANAGEMENT_PLAN_TYPE")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoiManagementPlanType {

    @Id
    @Column(name = "CMP_TYPE_CODE")
    private String cmpTypeCode;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "UPDATED_TIMESTAMP")
    private Timestamp updatedTimestamp;

}
