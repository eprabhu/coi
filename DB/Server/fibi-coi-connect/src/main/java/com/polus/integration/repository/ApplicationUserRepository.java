package com.polus.integration.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.polus.integration.pojo.Person;

@Repository
public interface ApplicationUserRepository extends JpaRepository<Person, String> {

	/**
	 * This method is used to validate user credentials.
	 * 
	 * @param principalName - Username of the login user.
	 * @return PrincipalBo - user Object.
	 */
	public Person findByPrincipalName(String principalName);

}
