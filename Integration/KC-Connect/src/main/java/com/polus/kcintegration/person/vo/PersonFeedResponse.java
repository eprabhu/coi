package com.polus.kcintegration.person.vo;

import java.util.List;

import com.polus.kcintegration.person.pojo.FibiCoiPerson;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PersonFeedResponse {

	private List<String> personIds;

	private Integer noOfSyncedInserted;

	private Integer noOfSyncedUpdated;

	private String status;

	private List<FibiCoiPerson> persons;

}
