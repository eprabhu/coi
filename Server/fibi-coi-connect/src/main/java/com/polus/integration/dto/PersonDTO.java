package com.polus.integration.dto;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonDTO {

	private String personID = "";

	private String firstName = "";

	private String lastName = "";

	private String fullName = "";

	private String email = "";

	private String userName = "";

	private boolean isLogin = false;

	private Collection<? extends GrantedAuthority> jwtRoles;

}
