package com.polus.integration.pojo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.io.Serializable;
import java.sql.Timestamp;

@Entity
@Table(name = "STATES")
@Data
public class State implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "STATE_CODE")
    private String stateCode;

    @Column(name = "COUNTRY_CODE")
    private String countryCode;

    @Column(name = "STATE_NAME")
    private String stateName;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimeStamp;

    @Column(name = "UPDATE_USER")
    private String updateUser;
}
