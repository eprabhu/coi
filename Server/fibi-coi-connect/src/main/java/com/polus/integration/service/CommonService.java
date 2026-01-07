package com.polus.integration.service;

import java.security.GeneralSecurityException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@Service
public interface CommonService {

	/**
	 * This method is used to create encrypted password.
	 *
	 * @param valueToHide - Password to encrypt
	 * @return Encrypted password
	 * @throws GeneralSecurityException
	 */
	public String hash(Object valueToHide) throws GeneralSecurityException;

}
