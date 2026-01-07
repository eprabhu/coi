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
@Table(name = "COI_MANAGEMENT_PLAN_SECTION")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoiManagementPlanSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SECTION_ID")
    private Integer sectionId;

    @Column(name = "SECTION_NAME")
    private String sectionName;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "UPDATED_TIMESTAMP")
    private Timestamp updateTimestamp;

}
