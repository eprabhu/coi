package com.polus.kcintegration.security.vo;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthRequest {

	private String userName;

	private String password;

	private String personId;

	private Boolean generateUserDetails = Boolean.FALSE;

}
