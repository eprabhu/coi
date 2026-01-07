package com.polus.integration.entity.cleansematch.dto;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Builder
@Data
public class CountryDto {
    private String countryCode;
    private String countryName;
}
