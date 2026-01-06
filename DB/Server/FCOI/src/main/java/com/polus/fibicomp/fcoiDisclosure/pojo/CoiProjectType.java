package com.polus.fibicomp.fcoiDisclosure.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.polus.core.util.JpaCharBooleanConversion;

@Entity
@Table(name = "COI_PROJECT_TYPE")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CoiProjectType implements Serializable {
	
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "COI_PROJECT_TYPE_CODE")
	private String coiProjectTypeCode;

	@Column(name = "DESCRIPTION")
	private String description;

	@Column(name = "BADGE_COLOR")
	private String badgeColor;

	@Column(name = "PROJECT_ICON")
	private String projectIcon;

	@Column(name = "FCOI_NEEDED")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean fcoiNeeded;

	@Column(name = "PROJECT_DISCLOSURE_NEEDED")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean projectDisclosureNeeded;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATE_USER")
	private String updateUser;

}
