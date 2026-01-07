package com.polus.integration.entity.dunsRefresh.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class DnBUpdateWrapper {

    private String type;
    private OrganizationRef organization;
    private List<UpdateElement> elements;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class OrganizationRef {
        private String duns;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class UpdateElement {
        private String element;
        private Object previous;
        private Object current;
        private String timestamp;
    }
}

