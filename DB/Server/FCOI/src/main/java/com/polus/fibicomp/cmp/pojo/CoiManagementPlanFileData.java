package com.polus.fibicomp.cmp.pojo;

import java.io.Serializable;
import java.time.Instant;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "COI_MANAGEMENT_PLAN_FILE_DATA")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CoiManagementPlanFileData implements Serializable {

	private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "FILE_DATA_ID")
    private String fileDataId;

    @Column(name = "FILE_PATH")
    private String filePath;

    @Column(name = "ORIGINAL_FILE_NAME")
    private String originalFileName;

    @Column(name = "FILE_NAME")
    private String fileName;

    @Column(name = "IS_ARCHIVED")
    private String isArchived;

    @Column(name = "FILE")
    private byte[] file;

    @Column(name = "UPDATE_TIMESTAMP")
    private Instant updateTimestamp;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

}
