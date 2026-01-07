package com.polus.integration.person.vo;

import java.util.List;

import com.polus.integration.person.pojo.FibiCoiPerson;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PersonFeedResponse {

	private Integer noOfSyncedInserted;

	private Integer noOfSyncedUpdated;

	private String status;

	private List<String> personIds;

	private List<FibiCoiPerson> persons;

}
