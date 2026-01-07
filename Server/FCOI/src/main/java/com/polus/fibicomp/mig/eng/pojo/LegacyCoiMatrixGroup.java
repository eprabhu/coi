package com.polus.fibicomp.mig.eng.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.Data;

@Entity
@Data
@Table(name = "LEGACY_COI_MATRIX_GROUP")
public class LegacyCoiMatrixGroup implements Serializable {

	private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "GROUP_ID")
    private Integer groupId;

    @Column(name = "GROUP_NAME")
    private String groupName;

    @Column(name = "SORT_ID")
    private Integer sortId;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

}
