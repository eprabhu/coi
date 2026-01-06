package com.polus.fibicomp.coi.pojo;

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
@Table(name = "PERSON_FILE_DATA")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PersonFileData implements Serializable {
	
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "FILE_DATA_ID")
	private String fileDataId;

	@Column(name = "MODULE_CODE")
	private String moduleCode;

	@Column(name= "SUB_MODULE_CODE")
	private String subModuleCode;

	@Column(name = "FILE_PATH")
	private String filePath;
	 
    @Column(name = "ORIGINAL_FILE_NAME")
    private String originalFileName;
    
    @Column(name = "FILE_NAME")
    private String fileName;
    
    @Column(name = "DATA")
	private byte[] data;
    
    @Column(name = "IS_ARCHIVED")
    private String isArchived;
    
    @Column(name = "UPDATE_TIMESTAMP")
    private Instant updateTimeStamp;
    
    @Column(name = "UPDATE_USER")
    private String updateUser;
	
}
