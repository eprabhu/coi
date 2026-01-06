package com.polus.fibicomp.mig.eng.dto;

import java.util.List;

import com.polus.fibicomp.coi.pojo.PersonEntityRelType;
import com.polus.fibicomp.matrix.pojo.CoiMatrixAnswer;
import com.polus.fibicomp.mig.eng.pojo.LegacyCoiMatrixQuestion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EngMigMatrixResonse {
	private LegacyCoiMatrixQuestion coiMatrixQuestion;
    private List<PersonEntityRelType> relationships;
    private List<CoiMatrixAnswer> coiMatrixAnswer;

    public EngMigMatrixResonse(LegacyCoiMatrixQuestion legacyCoiMatrixQuestion, List<PersonEntityRelType> relationships) {
        this.coiMatrixQuestion = legacyCoiMatrixQuestion;
        this.relationships = relationships;
    }
}
