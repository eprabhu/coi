package com.polus.fibicomp.globalentity.dto;


import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DnBEntityEnrichRequestDTO {

    private String duns;

    private Integer entityId;

    private String actionPersonId;

    private List<String> datablock;

    private Boolean fromFeed;

}
