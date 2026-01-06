package com.polus.integration.entity.cleansematch.dto;

import lombok.Data;

@Data
public class DnBEntityCleanseMatchRequestDTO {

private String sourceDataName;

private String sourceDunsNumber;

private String emailAddress;

private String addressLine1;

private String addressLine2;

private String postalCode;

private String state;

private String countryCode;

private Integer entityNumber;

private Integer entityId;
  
}
