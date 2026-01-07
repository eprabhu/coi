package com.polus.kcintegration.security.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "USER_TOKENS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserTokens implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "ID")
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_tokens_seq")
	@SequenceGenerator(name = "user_tokens_seq", sequenceName = "user_tokens_seq", allocationSize = 1)
	private Long id;

	@Column(name = "USER_NAME")
	private String userName;

	@Column(name = "PASSWORD")
	private String password;

	@Column(name = "ACCESS_TOKEN", columnDefinition = "CLOB")
	private String accessToken;

	@Column(name = "SALT")
	private String salt;

	@Column(name = "PERSON_ID")
	private String personId;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	public UserTokens(String userName, String password, String accessToken, String salt, String personId) {
		this.userName = userName;
		this.password = password;
		this.accessToken = accessToken;
		this.personId = personId;
		this.salt = salt;
	}

}
