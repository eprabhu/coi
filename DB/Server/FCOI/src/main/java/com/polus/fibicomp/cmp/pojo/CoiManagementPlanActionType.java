package com.polus.fibicomp.cmp.pojo;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "COI_MGMT_PLAN_ACTION_TYPE")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoiManagementPlanActionType {

	@Id
    @Column(name = "ACTION_TYPE_CODE")
    private String actionTypeCode;

    @Column(name = "MESSAGE")
    private String message;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "STATUS_CODE")
    private String statusCode;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

    @Column(name = "UPDATE_USER")
    private String updateUser;

    @ManyToOne
    @JoinColumn(name = "STATUS_CODE", insertable = false, updatable = false)
    private CoiManagementPlanStatusType statusType;

}
