package com.polus.fibicomp.cmp.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CmpReviewActionLogDto {

    private Integer cmpId;
    private Integer cmpNumber;
    private Integer cmpReviewId;
    private String reviewerName;
    private String reviewLocation;
    private String reviewStatus;
    private String adminName;
    private String comment;

}
