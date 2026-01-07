package com.polus.fibicomp.opa.pojo;

import com.polus.core.util.JpaCharBooleanConversion;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.io.Serializable;
import java.sql.Timestamp;

@Entity
@Table(name = "OPA_REVIEW_LOCATION_TYPE")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class OPAReviewLocationType implements Serializable {

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
