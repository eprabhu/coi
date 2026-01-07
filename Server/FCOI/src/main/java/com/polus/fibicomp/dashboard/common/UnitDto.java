package com.polus.fibicomp.dashboard.common;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class UnitDto {

    private String unitNumber;
    private String unitName;
    private String parentUnitNumber;
    private String displayName;
}
