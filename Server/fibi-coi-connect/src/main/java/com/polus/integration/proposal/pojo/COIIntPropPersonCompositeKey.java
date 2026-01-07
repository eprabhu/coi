package com.polus.integration.proposal.pojo;

import java.io.Serializable;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class COIIntPropPersonCompositeKey implements Serializable {

	private static final long serialVersionUID = 1L;

	private String proposalNumber;

	private String keyPersonId;

	@Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        COIIntPropPersonCompositeKey that = (COIIntPropPersonCompositeKey) o;
        return Objects.equals(proposalNumber, that.proposalNumber) &&
                Objects.equals(keyPersonId, that.keyPersonId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(proposalNumber, keyPersonId);
    }

}
