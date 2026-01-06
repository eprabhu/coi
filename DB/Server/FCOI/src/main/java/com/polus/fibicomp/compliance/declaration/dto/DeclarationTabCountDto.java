package com.polus.fibicomp.compliance.declaration.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class DeclarationTabCountDto {

    private Integer newSubmissionTabCount;
    private Integer myReviewsTabCount;
    private Integer allReviewsTabCount;
}
