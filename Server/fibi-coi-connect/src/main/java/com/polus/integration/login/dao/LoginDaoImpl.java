package com.polus.integration.login.dao;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.integration.dto.PersonDTO;
import com.polus.integration.pojo.Person;

import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;

@Transactional
@Service(value = "loginDao")
public class LoginDaoImpl implements LoginDao {

	protected static Logger logger = LogManager.getLogger(LoginDaoImpl.class.getName());

	@Autowired
	private EntityManager entityManager;

	public PersonDTO readPersonData(String userName) {
		PersonDTO personDTO = new PersonDTO();
		try {
			logger.info("readPersonData : {}", userName);
			Session session = entityManager.unwrap(Session.class);
			CriteriaBuilder builder = session.getCriteriaBuilder();
			CriteriaQuery<Person> query = builder.createQuery(Person.class);
			Root<Person> personRoot = query.from(Person.class);
			query.where(builder.equal(personRoot.get("principalName"), userName));
			Person person = session.createQuery(query).uniqueResult();
			logger.info("Person Detail : {}", person);
			if (person != null && person.getStatus() != null && person.getStatus().equals("A")) {
				personDTO.setPersonID(person.getPersonId());
				personDTO.setFirstName(person.getFirstName());
				personDTO.setLastName(person.getLastName());
				personDTO.setFullName(person.getFullName());
				personDTO.setUserName(userName);
				personDTO.setLogin(true);
			}
		} catch (Exception e) {
			logger.error("Error in method readPersonData", e);
		}
		return personDTO;
	}

}
