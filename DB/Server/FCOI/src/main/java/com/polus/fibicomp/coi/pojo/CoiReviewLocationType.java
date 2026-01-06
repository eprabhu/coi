package com.polus.fibicomp.coi.pojo;

import com.polus.core.util.JpaCharBooleanConversion;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.io.Serializable;
import java.sql.Timestamp;

@Entity
@Table(name = "COI_REVIEW_LOCATION_TYPE")
@Getter
@Setter
public class CoiReviewLocationType implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "LOCATION_TYPE_CODE")
    private String locationTypeCode;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

    @Column(name = "UPDATE_USER")
    private String updateUser;

    @Column(name = "IS_ACTIVE")
    @Convert(converter = JpaCharBooleanConversion.class)
    private Boolean isActive;

}
