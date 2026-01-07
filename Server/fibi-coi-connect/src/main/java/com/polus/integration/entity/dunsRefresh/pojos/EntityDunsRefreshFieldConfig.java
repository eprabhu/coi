package com.polus.integration.entity.dunsRefresh.pojos;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.io.Serializable;
import java.sql.Timestamp;

@Data
@Entity
@Table(name = "ENTITY_DUNS_REFRESH_FIELD_CONFIG")
public class EntityDunsRefreshFieldConfig implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "REFRESH_FIELD_CONFIG_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer refreshFieldConfigId;

    @Column(name = "FIELD_NAME")
    private String fieldName;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "IS_MANDATORY")
    private String isMandatory;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

}
