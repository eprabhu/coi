package com.polus.integration.award.pojo;

import java.io.Serializable;
import java.util.Objects;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class COIIntAwardPersonCompositeKey implements Serializable {

	private static final long serialVersionUID = 1L;

	private String projectNumber;

	private String keyPersonId;

	@Override
	public boolean equals(Object o) {
		if (this == o)
			return true;
		if (o == null || getClass() != o.getClass())
			return false;
		COIIntAwardPersonCompositeKey that = (COIIntAwardPersonCompositeKey) o;
		return Objects.equals(projectNumber, that.projectNumber) && Objects.equals(keyPersonId, that.keyPersonId);
	}

	@Override
	public int hashCode() {
		return Objects.hash(projectNumber, keyPersonId);
	}

}
