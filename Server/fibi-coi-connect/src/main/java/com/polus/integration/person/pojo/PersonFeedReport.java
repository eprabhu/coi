package com.polus.integration.person.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "FIBI_COI_PERSON_FEED_REPORT")
@DynamicInsert
@DynamicUpdate
public class PersonFeedReport implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "PERSON_FEED_ID")
	private Integer personFeedId;

	@Column(name = "PERSON_ID")
	private String personId;

	@Column(name = "REQUEST_DATE")
	private Timestamp requestDate;

	@Column(name = "START_TIMESTAMP")
	private Timestamp startTimestamp;

	@Column(name = "END_TIMESTAMP")
	private Timestamp endTimestamp;

	@Column(name = "DURATION")
	private Long duration;

	@Column(name = "TOTAL_USER_COUNT")
	private Integer totalUserCount;

	@Column(name = "NEW_USER_COUNT")
	private Integer newUserCount;

	@Column(name = "UPDATED_USER_COUNT")
	private Integer updatedUserCount;

	@Lob
	@Column(name = "EXCEPTION_DETAILS")
	private String exceptionDetails;

	@Column(name = "FEED_STATUS")
	private String feedStatus;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATED_BY")
	private String updatedBy;

}
