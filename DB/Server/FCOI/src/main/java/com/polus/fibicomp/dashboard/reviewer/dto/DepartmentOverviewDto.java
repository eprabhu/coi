package com.polus.fibicomp.dashboard.reviewer.dto;

import com.polus.fibicomp.dashboard.common.UnitDto;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class DepartmentOverviewDto extends UnitDto {

    private List<Map<Object, Object>> departmentOverviewCountDetails;
}
