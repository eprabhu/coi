package com.polus.integration.dnb.referencedata.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "ENTITY_REGISTRATION_TYPE")
@Data
public class RegistrationType {

    @Id
    @Column(name = "REG_TYPE_CODE", nullable = false, length = 10)
    private String regTypeCode;

    @Column(name = "DESCRIPTION", length = 500)
    private String description;

    @Column(name = "IS_ACTIVE", length = 1)
    private String isActive;

    @Column(name = "UPDATE_TIMESTAMP")
    private LocalDateTime updateTimestamp;

    @Column(name = "UPDATED_BY", length = 60)
    private String updatedBy;
   
}

