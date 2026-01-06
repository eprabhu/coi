package com.polus.fibicomp.globalentity.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class EntityMandatoryFiledsDTO {

	@JsonProperty("Sponsor")
    private List<String> sponsor;

    @JsonProperty("Overview")
    private List<String> overview;

    @JsonProperty("Organization")
    private List<String> organization;

}
