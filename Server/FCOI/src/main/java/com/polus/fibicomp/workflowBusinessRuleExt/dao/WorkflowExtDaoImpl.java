package com.polus.fibicomp.workflowBusinessRuleExt.dao;

import com.polus.fibicomp.workflowBusinessRuleExt.dto.WorkflowDto;
import lombok.extern.log4j.Log4j2;
import oracle.jdbc.OracleTypes;
import org.hibernate.Session;
import org.hibernate.internal.SessionImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;

@Repository
@Transactional
@Log4j2
public class WorkflowExtDaoImpl implements WorkflowExtDao {

    @Value("${oracledb}")
    private String oracledb;

    @Autowired
    private HibernateTemplate hibernateTemplate;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Integer addAlternativeApprover(WorkflowDto vo) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        CallableStatement statement = null;
        ResultSet resultSet = null;
        Integer result = 0;
        try {
            if (oracledb.equalsIgnoreCase("N")) {
                statement = connection.prepareCall("{call INSERT_WORKFLOW_ALTER_APPROVER(?,?,?,?,?,?,?,?,?,?,?,?)}");
                statement.setInt(1, vo.getWorkFlowId());
                statement.setInt(2, vo.getMapId());
                statement.setInt(3, vo.getMapNumber());
                statement.setInt(4, vo.getApprovalStopNumber());
                statement.setInt(5, vo.getApproverNumber());
                statement.setString(6, vo.getApproverPersonId());
                statement.setString(7, vo.getUpdateUser());
                statement.setString(8, vo.getApproverFlag());
                statement.setString(9, vo.getMapName());
                statement.setString(10, vo.getMapDescription());
                statement.setString(11, vo.getStopName());
                statement.setString(12, vo.getNote());
                statement.execute();
                resultSet = statement.getResultSet();
            } else if (oracledb.equalsIgnoreCase("Y")) {
                String procedureName = "INSERT_WORKFLOW_ALTER_APPROVER";
                String functionCall = "{call " + procedureName + "(?,?,?,?,?,?,?,?,?,?,?,?,?)}";
                statement = connection.prepareCall(functionCall);
                statement.setInt(1, vo.getWorkFlowId());
                statement.setInt(2, vo.getMapId());
                statement.setInt(3, vo.getMapNumber());
                statement.setInt(4, vo.getApprovalStopNumber());
                statement.setInt(5, vo.getApproverNumber());
                statement.setString(6, vo.getApproverPersonId());
                statement.setString(7, vo.getUpdateUser());
                statement.setString(8, vo.getApproverFlag());
                statement.setString(9, vo.getMapName());
                statement.setString(10, vo.getMapDescription());
                statement.setString(11, vo.getStopName());
                statement.setString(12, vo.getNote());
                statement.registerOutParameter(13, OracleTypes.CURSOR);
                statement.execute();
                resultSet = (ResultSet) statement.getObject(13);
            }
            while (resultSet.next()) {
                result = Integer.parseInt(resultSet.getString(1));
            }
        } catch (Exception e) {
            log.error("Exception on addAlternativeApprover : {}", e);
        }
        return result;
    }
}
