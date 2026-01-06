package com.polus.integration.entity.cleansematch.entity;

import com.polus.integration.config.JpaCharBooleanConversion;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Entity
@Table(name = "ENTITY_STAGE_ADMIN_ACTION_TYPE")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntityStageAdminActionType {

    @Id
    @Column(name = "ADMIN_ACTION_CODE")
    private Integer adminActionCode;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "UPDATE_TIMESTAMP", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    private Timestamp updateTimestamp;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "IS_ACTIVE")
    @Convert(converter = JpaCharBooleanConversion.class)
    private Boolean isActive;

}
