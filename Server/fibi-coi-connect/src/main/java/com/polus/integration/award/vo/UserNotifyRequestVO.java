package com.polus.integration.award.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserNotifyRequestVO {

	private Integer moduleCode;
	private Integer subModuleCode;
	private Integer moduleItemId;
	private String moduleItemKey;
	private String subModuleItemKey;
	private String title;
	private List<String> personIds;
	private List<String> inactivePersonIds;

}
