package com.polus.fibicomp.authorization.document;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@Service(value = "userDocumentAuthorization")
public interface UserDocumentAuthorization {

	public boolean isAuthorized(Integer moduleCode,String moduleItemKey,String loggedInPerson);

	/**
	 * isAuthorized
	 * @param moduleCode
	 * @param moduleItemKey
	 * @param loggedInPerson
	 * @param subModuleCode
	 * @param subModuleItemKey
	 * @return
	 */
	boolean isAuthorized(Integer moduleCode, String moduleItemKey,String loggedInPerson, Integer subModuleCode, String subModuleItemKey);
	
}
