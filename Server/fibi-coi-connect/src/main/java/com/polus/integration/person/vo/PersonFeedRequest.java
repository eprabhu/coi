package com.polus.integration.person.vo;

import java.sql.Timestamp;
import java.util.List;

import com.polus.integration.person.pojo.FibiCoiPerson;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonFeedRequest {

	private String personId;

	private Timestamp requestDate;

	private List<String> personIds;

	private List<FibiCoiPerson> persons;

	private String errorPersonIds;

}
