package com.polus.fibicomp.cmp.pojo;

import com.polus.core.util.JpaCharBooleanConversion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.io.Serializable;
import java.sql.Timestamp;

@Entity
@Table(name = "COI_MGMT_PLAN_STATUS_TYPE")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class CoiManagementPlanStatusType implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "STATUS_CODE")
    private String statusCode;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "BADGE_COLOR")
    private String badgeColor;

    @Column(name = "IS_ACTIVE")
    @Convert(converter = JpaCharBooleanConversion.class)
    private Boolean isActive;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "SORT_ORDER")
    private Integer sortOrder;

}
