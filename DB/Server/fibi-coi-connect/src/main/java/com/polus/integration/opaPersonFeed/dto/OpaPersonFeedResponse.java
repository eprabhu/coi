package com.polus.integration.opaPersonFeed.dto;

import com.polus.integration.opaPersonFeed.pojo.OPAPerson;
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
    private List<OPAPerson> data;

}
