package com.polus.integration.entity.dunsRefresh.pojos;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.sql.Timestamp;

@Data
@Entity
@Table(name = "ENTITY_DUNS_REFRESH_STATUS_TYPE")
public class EntityRefreshStatusType {

    @Id
    @Column(name = "REFRESH_STATUS_TYPE_CODE")
    private String refreshTypeCode;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;
}
