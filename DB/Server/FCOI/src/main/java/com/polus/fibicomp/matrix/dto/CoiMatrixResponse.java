package com.polus.fibicomp.matrix.dto;

import java.util.List;

import com.polus.fibicomp.coi.pojo.PersonEntityRelType;
import com.polus.fibicomp.matrix.pojo.CoiMatrixAnswer;
import com.polus.fibicomp.matrix.pojo.CoiMatrixQuestion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CoiMatrixResponse {

	private CoiMatrixQuestion coiMatrixQuestion;
    private List<PersonEntityRelType> relationships;
    private List<CoiMatrixAnswer> coiMatrixAnswer;

    public CoiMatrixResponse(CoiMatrixQuestion coiMatrixQuestion, List<PersonEntityRelType> relationships) {
        this.coiMatrixQuestion = coiMatrixQuestion;
        this.relationships = relationships;
    }

}
