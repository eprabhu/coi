package com.polus.fibicomp.opa.pojo;

import java.sql.Timestamp;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import com.polus.core.util.JpaCharBooleanConversion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "OPA_CYCLES")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OPACycles {

	@Id
	@Column(name = "OPA_CYCLE_NUMBER")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer opaCycleNumber;

	@Column(name = "PERIOD_START_DATE")
	private Date periodStartDate;

	@Column(name = "PERIOD_END_DATE")
	private Date periodEndDate;

	@Column(name = "OPA_CYCLE_STATUS")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean opaCycleStatus;

	@Column(name = "OPEN_DATE")
	private Date openDate;

	@Column(name = "CLOSE_DATE")
	private Date closeDate;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATE_USER")
	private String updateUser;

	@Column(name = "FREQUENCY")
	private String frequency;

}
