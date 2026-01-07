package com.polus.integration.dnb.referencedata.dto;

import java.util.ArrayList;

import lombok.Data;

@Data
public class DnBReferenceDataAPIResponse {
    private String httpStatusCode;
    private String fullResponse;
    private String transactionID;
    private String errorCode;
    private String errorMessage;
    private String errorDetails;
    private ArrayList<DnBReferenceDataDTO> referenceData;
}
