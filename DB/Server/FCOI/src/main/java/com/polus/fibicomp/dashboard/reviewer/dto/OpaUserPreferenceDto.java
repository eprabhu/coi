package com.polus.fibicomp.dashboard.reviewer.dto;

import com.polus.core.person.pojo.PersonPreference;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OpaUserPreferenceDto {

    private List<PersonPreference> personPreferences;
    private String unitDisplyName;
}
