package com.polus.fibicomp.cmp.pojo;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "COI_MGMT_PLAN_SEC_COMP_HIST")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoiMgmtPlanSecCompHist {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "SECTION_COMP_HISTORY_ID")
	private Integer sectionCompHistoryId;

	@Column(name = "SEC_COMP_ID")
	private Integer secCompId;

	@Column(name = "CMP_SECTION_REL_ID")
	private Integer cmpSectionRelId;

	@Column(name = "ACTION_TYPE")
	private String actionType;

	@Column(name = "OLD_DATA", columnDefinition = "json")
	private String oldData;

	@Column(name = "NEW_DATA", columnDefinition = "json")
	private String newData;

	@Column(name = "UPDATED_BY")
	private String updatedBy;

	@Column(name = "UPDATED_TIMESTAMP")
	private Timestamp updateTimestamp;

}
