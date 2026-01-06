package com.polus.fibicomp.coi.hierarchy.dao;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.Session;
import org.hibernate.internal.SessionImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.applicationexception.dto.ApplicationException;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.coi.hierarchy.dto.DisclosureDto;
import com.polus.fibicomp.coi.hierarchy.dto.HierarchyProjResponseDto;
import com.polus.fibicomp.coi.hierarchy.dto.ProjectHierarchyDto;
import com.polus.fibicomp.coi.hierarchy.dto.ProjectPersonDto;
import com.polus.fibicomp.constants.Constants;

import lombok.extern.slf4j.Slf4j;
import oracle.jdbc.OracleTypes;

@Repository
@Transactional
@Slf4j
public class HierarchyDao {

	@Autowired
	private HibernateTemplate hibernateTemplate;

	@Value("${oracledb}")
	private String oracledb;

	public List<ProjectHierarchyDto> getProjectRelations(Integer moduleCode, String projectNumber) {
	    Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
	    SessionImpl sessionImpl = (SessionImpl) session;
	    Connection connection = sessionImpl.connection();
	    CallableStatement statement = null;
	    ResultSet rset = null;
	    List<ProjectHierarchyDto> dtos = new ArrayList<>();
	    try {
	        if (oracledb.equalsIgnoreCase("N")) {
	            statement = connection.prepareCall("{call GET_HEIR_PROJECT_TREE(?,?)}");
	            statement.setInt(1, moduleCode);
	            statement.setString(2, projectNumber);
	            statement.execute();
	            rset = statement.getResultSet();
	        } else if (oracledb.equalsIgnoreCase("Y")) {
	            String functionCall = "{call GET_HEIR_PROJECT_TREE(?,?,?)}";
	            statement = connection.prepareCall(functionCall);
	            statement.registerOutParameter(1, OracleTypes.CURSOR);
	            statement.setInt(2, moduleCode);
	            statement.setString(3, projectNumber);
	            statement.execute();
	            rset = (ResultSet) statement.getObject(1);
	        }
	        while (rset != null && rset.next()) {
	        	ProjectHierarchyDto dto = new ProjectHierarchyDto();
                dto.setAwardNumber(rset.getString("AWARD_NUMBER"));
                dto.setIpNumber(rset.getString("IP_NUMBER"));
                dto.setProposalNumber(rset.getString("PROPOSAL_NUMBER"));
                dtos.add(dto);
	        }
	    } catch (Exception e) {
	        log.error("Exception on getProjectRelations {}", e.getMessage());
	        throw new ApplicationException("Unable to getProjectRelations", e, Constants.DB_PROC_ERROR);
	    }
	    return dtos;
	}

	public HierarchyProjResponseDto fetchProjectDetails(Integer moduleCode, String projectNumber) {
	    Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
	    SessionImpl sessionImpl = (SessionImpl) session;
	    Connection connection = sessionImpl.connection();
	    CallableStatement statement = null;
	    ResultSet rset = null;
	    HierarchyProjResponseDto dto = new HierarchyProjResponseDto();
	    List<ProjectPersonDto> projectPersons = new ArrayList<>();
	    try {
	        if (oracledb.equalsIgnoreCase("N")) {
	            statement = connection.prepareCall("{call GET_HEIR_PROJECT_DETAIL(?,?)}");
	            statement.setInt(1, moduleCode);
	            statement.setString(2, projectNumber);
	            statement.execute();
	            rset = statement.getResultSet();
	        } else if (oracledb.equalsIgnoreCase("Y")) {
	            String functionCall = "{call GET_HEIR_PROJECT_DETAIL(?,?,?)}";
	            statement = connection.prepareCall(functionCall);
	            statement.registerOutParameter(1, OracleTypes.CURSOR);
	            statement.setInt(2, moduleCode);
	            statement.setString(3, projectNumber);
	            statement.execute();
	            rset = (ResultSet) statement.getObject(1);
	        }
	        while (rset != null && rset.next()) {
				ProjectPersonDto projectPerson = new ProjectPersonDto();
                projectPerson.setKeyPersonId(rset.getString("KEY_PERSON_ID"));
                projectPerson.setKeyPersonName(rset.getString("KEY_PERSON_NAME"));
                projectPerson.setKeyPersonRole(rset.getString("KEY_PERSON_ROLE_NAME"));
                projectPerson.setHomeUnitName(rset.getString("KEY_PERSON_UNIT_NAME"));
                projectPerson.setHomeUnitNumber(rset.getString("KEY_PERSON_UNIT"));
                projectPerson.setNonEmployeeFlag(rset.getString("NON_EMPLOYEE_FLAG"));
                projectPerson.setDisclosureRequired(rset.getString("DISCLOSURE_REQUIRED_FLAG"));
                projectPersons.add(projectPerson);
                if (dto.getSponsorName() == null) {
                	dto.setProjectNumber(projectNumber);
                	dto.setSponsorCode(rset.getString("SPONSOR_CODE"));
                	dto.setPrimeSponsorCode(rset.getString("PRIME_SPONSOR_CODE"));
                	dto.setSponsorName(rset.getString("SPONSOR_NAME"));
    	        	dto.setHomeUnitName(rset.getString("LEAD_UNIT_NAME"));
    	        	dto.setHomeUnitNumber(rset.getString("LEAD_UNIT_NUMBER"));
    	        	dto.setPrimeSponsorName(rset.getString("PRIME_SPONSOR_NAME"));
    	        	dto.setProjectStatus(rset.getString("PROJECT_STATUS"));
    	        	dto.setPiName(rset.getString("PI_NAME"));
    	        	dto.setProjectId(rset.getString("PROJECT_ID"));
    	        	dto.setProjectNumber(rset.getString("PROJECT_NUMBER"));
    	        	dto.setProjectStartDate(rset.getTimestamp("PROJECT_START_DATE"));
    	        	dto.setProjectEndDate(rset.getTimestamp("PROJECT_END_DATE"));
    	        	dto.setPrimeSponsorName(rset.getString("PRIME_SPONSOR_NAME"));
    	        	dto.setProjectBadgeColour(rset.getString("BADGE_COLOR"));
    	        	dto.setProjectIcon(rset.getString("PROJECT_ICON"));
    	        	dto.setProjectType(rset.getString("PROJECT_TYPE"));
    	        	dto.setProjectTypeCode(rset.getString("COI_PROJECT_TYPE_CODE"));
    	        	dto.setProjectTitle(rset.getString("TITLE"));
    	        	dto.setDocumentNumber(rset.getString("DOCUMENT_NUMBER"));
    	        	dto.setAccountNumber(rset.getString("ACCOUNT_NUMBER"));
                }
	        }
	        dto.setProjectPersons(projectPersons);
	    } catch (Exception e) {
	        log.error("Exception on fetchProjectTree {}", e.getMessage());
	        throw new ApplicationException("Unable to fetch project tree details", e, Constants.DB_PROC_ERROR);
	    }
	    return dto;
	}

	public List<DisclosureDto> getPersonDisclosures(Integer moduleCode, String projectNumber, String keyPersonId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
	    SessionImpl sessionImpl = (SessionImpl) session;
	    Connection connection = sessionImpl.connection();
	    CallableStatement statement = null;
	    ResultSet rset = null;
	    List<DisclosureDto> dtos = new ArrayList<>();
	    String loginPersonId = AuthenticatedUser.getLoginPersonId();
	    try {
	        if (oracledb.equalsIgnoreCase("N")) {
	            statement = connection.prepareCall("{call GET_HEIR_PERSON_DISCLOSURES(?,?,?,?)}");
	            statement.setInt(1, moduleCode);
	            statement.setString(2, projectNumber);
	            statement.setString(3, keyPersonId);
	            statement.setString(4, loginPersonId);
	            statement.execute();
	            rset = statement.getResultSet();
	        } else if (oracledb.equalsIgnoreCase("Y")) {
	            String functionCall = "{call GET_HEIR_PERSON_DISCLOSURES(?,?,?,?,?)}";
	            statement = connection.prepareCall(functionCall);
	            statement.registerOutParameter(1, OracleTypes.CURSOR);
	            statement.setInt(2, moduleCode);
	            statement.setString(3, projectNumber);
	            statement.setString(4, keyPersonId);
	            statement.setString(5, loginPersonId);
	            statement.execute();
	            rset = (ResultSet) statement.getObject(1);
	        }
	        while (rset != null && rset.next()) {
	        	DisclosureDto dto = new DisclosureDto();
	        	Integer disclosureId = rset.getInt("DISCLOSURE_ID");
	        	dto.setDisclosureId(disclosureId);
				dto.setDisclosureStatus(rset.getString("CONFLICT_STATUS")); 
				dto.setReviewStatus(rset.getString("REVIEW_STATUS")); 
				dto.setDisclosureType(rset.getString("DISCLOSURE_TYPE"));
				dto.setCertificationDate(rset.getTimestamp("CERTIFIED_AT"));
				dto.setDispositionStatus(rset.getString("DISPOSITION_STATUS"));
				dto.setCanOpenDisclosure(rset.getBoolean("PERSON_HAS_RIGHT"));
				dto.setCreateTimestamp(rset.getTimestamp("CREATE_TIMESTAMP"));
				dtos.add(dto);
	        }
	    } catch (Exception e) {
	        log.error("Exception on fetch person disclosures {}", e.getMessage());
	        throw new ApplicationException("Unable to fetch person disclosure details", e, Constants.DB_PROC_ERROR);
	    }
	    return dtos;
	}

}
