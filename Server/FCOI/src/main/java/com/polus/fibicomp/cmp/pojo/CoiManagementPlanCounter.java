package com.polus.fibicomp.cmp.pojo;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "COI_MANAGEMENT_PLAN_COUNTER")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoiManagementPlanCounter {

	@Id
	@Column(name = "COUNTER_NAME")
	private String counterName;

	@Column(name = "COUNTER_VALUE", nullable = false)
	private Integer counterValue;

}
