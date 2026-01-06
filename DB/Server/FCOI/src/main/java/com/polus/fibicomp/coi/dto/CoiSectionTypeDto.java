package com.polus.fibicomp.coi.dto;

import java.util.List;

import com.polus.core.questionnaire.dto.QuestionnaireDataBus;
import com.polus.fibicomp.coi.pojo.CoiSectionsType;
import com.polus.fibicomp.coi.pojo.PersonEntity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoiSectionTypeDto {

	private List<PersonEntity> personEntities;

	private List<DisclosureProjectDto> projectList;

	private List<CoiSectionsType> coiSectionsTypeList;

	private QuestionnaireDataBus questionnaireDataBus;

}
