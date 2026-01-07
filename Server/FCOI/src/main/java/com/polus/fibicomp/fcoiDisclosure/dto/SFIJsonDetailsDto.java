package com.polus.fibicomp.fcoiDisclosure.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

/**
 * While the package is changing, change it on corresponding query also
 */
public class SFIJsonDetailsDto {

    @JsonProperty("PERSON_ENTITY_ID")
    private Integer personEntityId;
    @JsonProperty("PERSON_ENTITY_NUMBER")
    private Integer personEntityNumber;
    @JsonProperty("ENTITY_ID")
    private Integer entityId;

    public SFIJsonDetailsDto() {
    }

    public SFIJsonDetailsDto(Integer personEntityId, Integer personEntityNumber, Integer entityId) {
        this.personEntityId = personEntityId;
        this.personEntityNumber = personEntityNumber;
        this.entityId = entityId;
    }

    // Getters and Setters
    public Integer getPersonEntityId() {
        return personEntityId;
    }

    public void setPersonEntityId(Integer personEntityId) {
        this.personEntityId = personEntityId;
    }

    public Integer getPersonEntityNumber() {
        return personEntityNumber;
    }

    public void setPersonEntityNumber(Integer personEntityNumber) {
        this.personEntityNumber = personEntityNumber;
    }

    public Integer getEntityId() {
        return entityId;
    }

    public void setEntityId(Integer entityId) {
        this.entityId = entityId;
    }
}
