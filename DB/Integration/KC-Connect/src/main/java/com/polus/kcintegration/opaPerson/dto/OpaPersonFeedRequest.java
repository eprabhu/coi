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
public class OpaPersonFeedRequest {

    private Timestamp lastUpdatedTimestamp;
    private Integer limit;
    private Integer pageNumber;
    private Integer totalCount;
    private List<String> personIds;
}
