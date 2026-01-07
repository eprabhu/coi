package com.polus.kcintegration.person.vo;

import java.sql.Timestamp;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PersonFeedRequest {

	private String personId;

	private Timestamp requestDate;

	private List<String> personIds;

	private String errorPersonIds;

}
