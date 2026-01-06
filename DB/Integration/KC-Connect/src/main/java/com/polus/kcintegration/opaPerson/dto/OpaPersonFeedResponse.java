package com.polus.kcintegration.opaPerson.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class OpaPersonFeedResponse {

    private Timestamp lastUpdatedTimestamp;
    private Integer totalCount;
    private Integer pageNumber;
    private Integer limit;
    private List<OPAPersonDto> data;
}
