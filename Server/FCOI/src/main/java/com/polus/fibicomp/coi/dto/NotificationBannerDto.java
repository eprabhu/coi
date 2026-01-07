package com.polus.fibicomp.coi.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationBannerDto {

	String personId;
	Integer numberOfDays;
	Integer moduleCode;
	String moduleItemKey;
	Integer subModuleCode;
	String subModuleItemKey;
	String alertType;
	private boolean isProcessed = false;
	List<Integer> moduleCodeList;

}
