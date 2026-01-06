package com.polus.fibicomp.compliance.declaration.pojo;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "COI_DECLARATION_NUMBER_COUNTER")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoiDeclarationNumberCounter {

	@Id
	@Column(name = "COUNTER_NAME")
	private String counterName;

	@Column(name = "COUNTER_VALUE")
	private Integer counterValue;

}
