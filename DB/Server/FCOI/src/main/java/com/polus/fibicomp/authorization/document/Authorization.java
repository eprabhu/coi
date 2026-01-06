package com.polus.fibicomp.authorization.document;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.SQLException;

import org.hibernate.Session;
import org.hibernate.internal.SessionImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import oracle.jdbc.OracleTypes;

@Transactional
@Service(value = "userDocumentAuthorization")
public class Authorization implements UserDocumentAuthorization{

	@Autowired
	private HibernateTemplate hibernateTemplate;
	
	public boolean checkAuthorized(Integer moduleCode,String moduleItemKey,String loggedInPerson, Integer subModuleCode, String subModuleItemKey) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		SessionImpl sessionImpl = (SessionImpl) session;
		Connection connection = sessionImpl.connection();
		CallableStatement statement = null;
		try {
			String functionName = "FN_COI_PERSON_HAS_AUTHORIZATION";
			String functionCall = "{ ? = call " + functionName + "(?,?,?,?,?) }";
			statement = connection.prepareCall(functionCall);
			statement.registerOutParameter(1, OracleTypes.INTEGER);
			statement.setInt(2, moduleCode);
			statement.setString(3, moduleItemKey);
			statement.setString(4, loggedInPerson);
			statement.setInt(5, subModuleCode != null ? subModuleCode : 0  );
			statement.setString(6, subModuleItemKey != null ? subModuleItemKey : "" );
			statement.execute();
			int result = statement.getInt(1);
			if (result == 1) {
				return true;
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
		return false;
	}

	@Override
	public boolean isAuthorized(Integer moduleCode, String moduleItemKey, String loggedInPerson) {
		return checkAuthorized(moduleCode, moduleItemKey, loggedInPerson, null,null);
	}

	@Override
	public boolean isAuthorized(Integer moduleCode, String moduleItemKey, String loggedInPerson, Integer subModuleCode, String subModuleItemKey) {
		return checkAuthorized(moduleCode, moduleItemKey, loggedInPerson, subModuleCode,subModuleItemKey);
	}
}
