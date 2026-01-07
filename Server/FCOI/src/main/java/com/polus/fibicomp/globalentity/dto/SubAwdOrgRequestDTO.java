package com.polus.fibicomp.globalentity.dto;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

import com.polus.fibicomp.constants.Constants;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SubAwdOrgRequestDTO {

	private Integer id;
	private Integer entityId;
	private String organizationId;
	private String organizationTypeCode;
	private String feedStatusCode;
	private Date samExpirationDate;
	private Date subAwdRiskAssmtDate;
	private Map<SubAwardOrgField, Object> subAwardOrgFields;
	private Boolean isChangeInAddress;

	private static final SimpleDateFormat dateFormat = new SimpleDateFormat(Constants.DATE_FORMAT);

	public Date getDateFromMap(SubAwardOrgField fieldName) {
		Object dateObj = subAwardOrgFields.get(fieldName);
		if (dateObj != null) {
			if (dateObj instanceof String) {
				String dateStr = (String) dateObj;
				if (!dateStr.trim().isEmpty()) {
					try {
						return dateFormat.parse(dateStr);
					} catch (ParseException e) {
						throw new IllegalArgumentException("Unable to parse date for field: " + fieldName, e);
					}
				}
			} else if (dateObj instanceof Date) {
				return (Date) dateObj;
			}
		}
		return null;
	}

}
