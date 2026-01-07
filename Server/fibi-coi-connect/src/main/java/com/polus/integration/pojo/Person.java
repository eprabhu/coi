package com.polus.integration.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "PERSON")
public class Person implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "PERSON_ID")
	private String personId;

	@Column(name = "LAST_NAME")
	private String lastName;

	@Column(name = "FIRST_NAME")
	private String firstName;

	@Column(name = "MIDDLE_NAME")
	private String middleName;

	@Column(name = "FULL_NAME")
	private String fullName;

	@Column(name = "USER_NAME", unique = true)
	private String principalName;

	@Column(name = "EMAIL_ADDRESS")
	private String emailAddress;

	@Column(name = "STATUS")
	private String status;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATE_USER")
	private String updateUser;

	@JsonProperty(access = Access.WRITE_ONLY)
	@Column(name = "PASSWORD")
	private String password;

}
