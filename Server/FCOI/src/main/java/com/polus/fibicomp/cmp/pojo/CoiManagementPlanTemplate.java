package com.polus.fibicomp.cmp.pojo;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "COI_MANAGEMENT_PLAN_TEMPLATE")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoiManagementPlanTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TEMPLATE_ID")
    private Integer templateId;

    @Column(name = "TEMPLATE_NAME")
    private String templateName;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "UPDATED_TIMESTAMP")
    private Timestamp updatedTimestamp;

}
