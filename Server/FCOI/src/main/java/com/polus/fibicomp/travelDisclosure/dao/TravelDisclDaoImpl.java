package com.polus.fibicomp.travelDisclosure.dao;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.persistence.Query;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import javax.transaction.Transactional;

import org.hibernate.Session;
import org.hibernate.internal.SessionImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.core.applicationexception.dto.ApplicationException;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.coi.pojo.PersonEntity;
import com.polus.fibicomp.coi.pojo.ValidPersonEntityRelType;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.travelDisclosure.dtos.CoiTravelDisclValidateDto;
import com.polus.fibicomp.travelDisclosure.dtos.CoiTravelDisclosureDto;
import com.polus.fibicomp.travelDisclosure.pojos.CoiTravelDestinations;
import com.polus.fibicomp.travelDisclosure.pojos.CoiTravelDisclosure;
import com.polus.fibicomp.travelDisclosure.pojos.CoiTravelDisclosureStatusType;
import com.polus.fibicomp.travelDisclosure.pojos.CoiTravelDocumentStatusType;
import com.polus.fibicomp.travelDisclosure.pojos.CoiTravelFundingAgencyType;
import com.polus.fibicomp.travelDisclosure.pojos.CoiTravelFundingType;
import com.polus.fibicomp.travelDisclosure.pojos.CoiTravelReviewStatusType;
import com.polus.fibicomp.travelDisclosure.pojos.TravelFormBuilderDetails;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Repository
@Transactional
public class TravelDisclDaoImpl implements TravelDisclDao {

    @Autowired
    private HibernateTemplate hibernateTemplate;

    @Autowired
    private CommonDao commonDao; 

    public Object save(Object entity) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        session.save(entity);
        return entity;
    }

    public CoiTravelDisclosure findByTravelDisclosureId(Integer travelDisclosureId) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        Query query = session.createQuery("SELECT c FROM CoiTravelDisclosure c WHERE c.travelDisclosureId = :travelDisclosureId ");
        query.setParameter("travelDisclosureId", travelDisclosureId);
        List<CoiTravelDisclosure> resultList = query.getResultList();
        if (resultList != null && !resultList.isEmpty()) {
            return resultList.get(0);
        }
        return null;
    }

    @Override
    public boolean isAdminAlreadyAssigned(Integer adminGroupId, String adminPersonId,
                                                         Integer travelDisclosureId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT case when (count(c.travelDisclosureId) > 0) then true else false end ");
        hqlQuery.append("FROM CoiTravelDisclosure c WHERE  c.adminPersonId IS NOT NULL AND c.adminPersonId = :adminPersonId ");
        if (adminGroupId != null)
            hqlQuery.append("AND c.adminGroupId  IS NOT NULL AND c.adminGroupId = :adminGroupId ") ;
        hqlQuery.append("AND c.travelDisclosureId = : travelDisclosureId");
        TypedQuery<Boolean> query = session.createQuery(hqlQuery.toString(), Boolean.class);
        if (adminGroupId != null)
            query.setParameter("adminGroupId", adminGroupId);
        query.setParameter("adminPersonId", adminPersonId);
        query.setParameter("travelDisclosureId", travelDisclosureId);
        return query.getSingleResult();
    }

    @Override
    public List<CoiTravelDisclosureStatusType> getAllCoiTravelDisclosureStatusType() {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        Query query = session.createQuery("SELECT c FROM CoiTravelDisclosureStatusType c");
        return query.getResultList();
    }

    @Override
    public List<CoiTravelDocumentStatusType> getAllCoiTravelDocumentStatusType() {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        Query query = session.createQuery("SELECT c FROM CoiTravelDocumentStatusType c");
        return query.getResultList();
    }

    @Override
    public List<CoiTravelFundingAgencyType> getAllCoiTravelFundingAgencyType() {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        Query query = session.createQuery("SELECT c FROM CoiTravelFundingAgencyType c");
        return query.getResultList();
    }

    @Override
    public List<CoiTravelFundingType> getAllCoiTravelFundingType() {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        Query query = session.createQuery("SELECT c FROM CoiTravelFundingType c");
        return query.getResultList();
    }

    @Override
    public List<CoiTravelReviewStatusType> getAllCoiTravelReviewStatusType() {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        Query query = session.createQuery("SELECT c FROM CoiTravelReviewStatusType c");
        return query.getResultList();
    }

    @Override
    public List<ValidPersonEntityRelType> getTravelRelationshipTypes() {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        Query query = session.createQuery("SELECT c FROM ValidPersonEntityRelType c WHERE c.disclosureTypeCode = :disclosureTypeCode");
        query.setParameter("disclosureTypeCode", Constants.DISCLOSURE_TYPE_CODE_TRAVEL);
        return query.getResultList();
    }

    @Override
    public List<CoiTravelDisclValidateDto> getReimbursementValidatedDetails(Integer personEntityNumber) {
        List<CoiTravelDisclValidateDto> travelDisclValidateDtos = new ArrayList<>();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        try {
            CallableStatement statement = connection.prepareCall("{call TRAVEL_VALIDATE_REIMBURSEMENT_COST(?)}");
            statement.setInt(1, personEntityNumber);
            statement.execute();
            ResultSet rset = statement.getResultSet();
            while (rset.next()) {
                CoiTravelDisclValidateDto travelDisclValidateDto = CoiTravelDisclValidateDto.builder()
                        .personEntityNumber(rset.getInt(1))
                        .personId(rset.getString(2))
                        .reimbursedCost(rset.getBigDecimal(3))
                        .noOfTravels(rset.getInt(4))
                        .build();
                travelDisclValidateDtos.add(travelDisclValidateDto);
            }
            return travelDisclValidateDtos;
        } catch (Exception e) {
            log.error("Exception on getReimbursementValidatedDetails {}", e.getMessage());
            throw new ApplicationException("error in getReimbursementValidatedDetails ", e, Constants.DB_FN_ERROR);
        }
    }

    @Override
    public Integer maxDisclosureNumber() {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        TypedQuery<Integer> query = session.createQuery("SELECT MAX(travelNumber) FROM CoiTravelDisclosure", Integer.class);
        return query.getSingleResult();
    }

    @Override
    public Boolean isReviewStatusIsNotIn(Integer travelDisclosureId, List<String> reviewStatusCodes) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        TypedQuery<Boolean> query = session.createQuery("SELECT CASE WHEN count(t.travelDisclosureId) > 0 THEN TRUE ELSE FALSE END FROM CoiTravelDisclosure t " +
                " WHERE t.travelDisclosureId = :travelDisclosureId AND t.reviewStatusCode NOT IN :reviewStatusCodes", Boolean.class);
        query.setParameter("travelDisclosureId", travelDisclosureId);
        query.setParameter("reviewStatusCodes", reviewStatusCodes);
        return query.getSingleResult();
    }

    @Override
    public Boolean isReviewStatusIsIn(Integer travelDisclosureId, List<String> reviewStatusCodes) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        TypedQuery<Boolean> query = session.createQuery("SELECT CASE WHEN count(t.travelDisclosureId) > 0 THEN TRUE ELSE FALSE END FROM CoiTravelDisclosure t " +
                "WHERE t.travelDisclosureId = :travelDisclosureId AND t.reviewStatusCode IN :reviewStatusCodes ", Boolean.class);
        query.setParameter("travelDisclosureId", travelDisclosureId);
        query.setParameter("reviewStatusCodes", reviewStatusCodes);
        return query.getSingleResult();
    }

    @Override
    public void assignAdmin(String adminPersonId, Integer adminGroupId, String updatedBy,
                     Timestamp updateTimestamp, String reviewStatusCode, Integer travelDisclosureId) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        Query query = session.createQuery("UPDATE CoiTravelDisclosure t SET t.adminPersonId = :adminPersonId, t.adminGroupId = :adminGroupId, t.updatedBy = :updatedBy, " +
                "t.updateTimestamp = :updateTimestamp, t.reviewStatusCode = :reviewStatusCode WHERE t.travelDisclosureId = :travelDisclosureId");
        query.setParameter("adminPersonId", adminPersonId);
        query.setParameter("adminGroupId", adminGroupId);
        query.setParameter("updatedBy", updatedBy);
        query.setParameter("updateTimestamp", updateTimestamp);
        query.setParameter("reviewStatusCode", reviewStatusCode);
        query.setParameter("travelDisclosureId", travelDisclosureId);
        query.executeUpdate();
    }

    @Override
    public String findAdminPersonIdByTravelDisclosureId(Integer travelDisclosureId) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        TypedQuery<String> query = session.createQuery("SELECT t.adminPersonId FROM CoiTravelDisclosure t WHERE t.travelDisclosureId = :travelDisclosureId");
        query.setParameter("travelDisclosureId", travelDisclosureId);
        return query.getSingleResult();
    }

    @Override
    public void certify(String certifiedBy, Timestamp currentTimestamp, String certificationText,
                 String reviewStatusCode, Integer travelDisclosureId, Timestamp expirationDate) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        Query query = session.createQuery("UPDATE CoiTravelDisclosure t SET t.certifiedBy = :certifiedBy, t.certifiedAt = :currentTimestamp, t.certificationText = :certificationText, " +
                "t.updateTimestamp = :currentTimestamp, t.updatedBy = :certifiedBy, t.reviewStatusCode = :reviewStatusCode, " +
                "t.expirationDate = :expirationDate WHERE t.travelDisclosureId = :travelDisclosureId");
        query.setParameter("certifiedBy", certifiedBy);
        query.setParameter("currentTimestamp", currentTimestamp);
        query.setParameter("certificationText", certificationText);
        query.setParameter("reviewStatusCode", reviewStatusCode);
        query.setParameter("travelDisclosureId", travelDisclosureId);
        query.setParameter("expirationDate", expirationDate);
        query.executeUpdate();

    }

    @Override
    public String findPersonIdByTravelDisclosureId(Integer travelDisclosureId) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        TypedQuery<String> query = session.createQuery("SELECT t.personId FROM CoiTravelDisclosure t WHERE t.travelDisclosureId = :travelDisclosureId");
        query.setParameter("travelDisclosureId", travelDisclosureId);
        return query.getSingleResult();
    }

    @Override
    public Boolean isAlreadyCertified(Integer travelDisclosureId) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        TypedQuery<Boolean> query = session.createQuery("SELECT CASE WHEN count(t.travelDisclosureId) > 0 THEN TRUE ELSE FALSE END FROM CoiTravelDisclosure t " +
                "WHERE t.travelDisclosureId = :travelDisclosureId AND t.certifiedBy IS NOT NULL ", Boolean.class);
        query.setParameter("travelDisclosureId", travelDisclosureId);
        return query.getSingleResult();
    }

    @Override
    public void changeReviewStatus(String reviewStatusCode, Timestamp updateTimestamp,
                            String updatedBy, Integer travelDisclosureId) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        Query query = session.createQuery("UPDATE CoiTravelDisclosure t SET t.reviewStatusCode = :reviewStatusCode, " +
                "t.updateTimestamp = :updateTimestamp, t.expirationDate = null, t.certifiedAt = null, t.certificationText = null, t.certifiedBy =null," +
                " t.updatedBy = :updatedBy WHERE t.travelDisclosureId = :travelDisclosureId");
        query.setParameter("reviewStatusCode", reviewStatusCode);
        query.setParameter("updateTimestamp", updateTimestamp);
        query.setParameter("updatedBy", updatedBy);
        query.setParameter("travelDisclosureId", travelDisclosureId);
        query.executeUpdate();
    }

    @Override
    public void changeReviewStatusAndDocumentStatusCode(String reviewStatusCode, String documentStatusCode,
                                                Timestamp updateTimestamp, String updatedBy, Integer travelDisclosureId) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        Query query = session.createQuery("UPDATE CoiTravelDisclosure t SET t.reviewStatusCode = :reviewStatusCode, t.documentStatusCode = :documentStatusCode, " +
                "t.updateTimestamp = :updateTimestamp, t.updatedBy = :updatedBy WHERE t.travelDisclosureId = :travelDisclosureId");
        query.setParameter("reviewStatusCode", reviewStatusCode);
        query.setParameter("documentStatusCode", documentStatusCode);
        query.setParameter("updatedBy", updatedBy);
        query.setParameter("updateTimestamp", updateTimestamp);
        query.setParameter("travelDisclosureId", travelDisclosureId);
        query.executeUpdate();
    }

    @Override
    public List<CoiTravelDisclosureDto> findCoiTravelDisclosureByPersonEntityNumber(Integer personEntityNumber) {
        List<CoiTravelDisclosureDto> travelDisclDtos = new ArrayList<>();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        try {
            CallableStatement statement = connection.prepareCall("{call GET_TRAVEL_DETAILS_OF_ENGAGEMENT(?)}");
            statement.setInt(1, personEntityNumber);
            statement.execute();
            ResultSet rset = statement.getResultSet();
            while (rset.next()) {
            	List<CoiTravelDestinations> travelDestinations = parseTravelDestinationsJson(rset.getString("travelDestinations"));
            	Date travelStartDate = travelDestinations.stream()
                        .map(CoiTravelDestinations::getStayStartDate)
                        .filter(Objects::nonNull)
                        .min(Date::compareTo)
                        .orElse(null);
                Date travelEndDate = travelDestinations.stream()
                        .map(CoiTravelDestinations::getStayEndDate)
                        .filter(Objects::nonNull)
                        .max(Date::compareTo)
                        .orElse(null);
                List<String> countryNames = travelDestinations.stream()
                        .map(CoiTravelDestinations::getCountryName)
                        .filter(Objects::nonNull)
                        .distinct()
                        .collect(Collectors.toList());
                CoiTravelDisclosureDto travelDisclDto = CoiTravelDisclosureDto.builder()
                        .travelNumber(rset.getInt("TRAVEL_NUMBER"))
                        .travelDisclosureId(rset.getInt("TRAVEL_DISCLOSURE_ID"))
                        .purposeOfTheTrip(rset.getString("PURPOSE_OF_THE_TRIP"))
                        .travelTitle(rset.getString("TRIP_TITLE"))
                        .reimbursedCost(rset.getBigDecimal("REIMBURSED_AMOUNT"))
                        .travelDestinations(parseTravelDestinationsJson(rset.getString("travelDestinations")))
                        .travelStartDate(travelStartDate)
                        .travelEndDate(travelEndDate)
                        .destinations(countryNames)
                        .reviewStatusCode(rset.getString("REVIEW_STATUS_CODE"))
                        .reviewStatus(rset.getString("REVIEW_STATUS_DESCRIPTION"))
                        .documentStatusCode(rset.getString("DOCUMENT_STATUS_CODE"))
                        .documentStatusDescription(rset.getString("DOCUMENT_STATUS_DESCRIPTION"))
                        .travellers(rset.getString("TRAVELLER"))
                        .certifiedAt(rset.getTimestamp("CERTIFIED_AT"))
						.adminGroupId(rset.getInt("ADMIN_GROUP_ID") != 0 ? rset.getInt("ADMIN_GROUP_ID") : null)
                        .adminGroupName(rset.getString("ADMIN_GROUP_NAME"))
                        .adminPersonName(rset.getString("ADMIN_FULL_NAME"))
                        .adminPersonId(rset.getString("ADMIN_PERSON_ID"))
                        .updateUserFullName(rset.getString("UPDATE_USER_FULL_NAME"))
                        .updateTimestamp(rset.getTimestamp("UPDATE_TIMESTAMP"))
                        .build();
                travelDisclDtos.add(travelDisclDto);
            }
            return travelDisclDtos;
        } catch (Exception e) {
            log.error("Exception on getReimbursementValidatedDetails {}", e.getMessage());
            throw new ApplicationException("error in getReimbursementValidatedDetails ", e, Constants.DB_FN_ERROR);
        }
    }

    public List<CoiTravelDestinations> parseTravelDestinationsJson(String travelDestinationsJson) {
        try {
            if (travelDestinationsJson == null || travelDestinationsJson.isEmpty()) {
                return new ArrayList<>();
            }
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.readValue(travelDestinationsJson, new TypeReference<List<CoiTravelDestinations>>() {});
        } catch (Exception e) {
            log.error("Exception on parseTravelDestinationsJson {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    @Override
    public TravelFormBuilderDetails findTravelFormBuilderDetailsByTravelDisclosureId(Integer travelDisclosureId) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        TypedQuery<TravelFormBuilderDetails> query = session.createQuery("SELECT t FROM TravelFormBuilderDetails t WHERE t.travelDisclosureId = :travelDisclosureId", TravelFormBuilderDetails.class);
        query.setParameter("travelDisclosureId", travelDisclosureId);
        return query.getResultList().get(0);
    }

    @Override
    public CoiTravelDocumentStatusType findTravelDocumentStatusTypeById(String documentStatusCode) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        TypedQuery<CoiTravelDocumentStatusType> query = session.createQuery("SELECT t FROM CoiTravelDocumentStatusType t " +
                "WHERE t.documentStatusCode = :documentStatusCode", CoiTravelDocumentStatusType.class);
        query.setParameter("documentStatusCode", documentStatusCode);
        return query.getSingleResult();
    }

    @Override
    public CoiTravelReviewStatusType findTravelReviewStatusTypeById(String reviewStatusCode) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        TypedQuery<CoiTravelReviewStatusType> query = session.createQuery("SELECT t FROM CoiTravelReviewStatusType t " +
                "WHERE t.reviewStatusCode = :reviewStatusCode", CoiTravelReviewStatusType.class);
        query.setParameter("reviewStatusCode", reviewStatusCode);
        return query.getSingleResult();
    }

    @Override
    public void removeRelationShipIfNotUsed(Integer personEntityId, Integer travelSelfRelationship, Boolean isSystemCreated, Integer travelDisclosureId) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        StringBuilder queryBuilder = new StringBuilder("DELETE t1, t2 FROM PERSON_ENTITY t0 LEFT JOIN PER_ENT_DISCL_TYPE_SELECTION t1 ON t1.PERSON_ENTITY_ID = t0.PERSON_ENTITY_ID ");
        queryBuilder.append("LEFT JOIN PERSON_ENTITY_RELATIONSHIP t2 ON t2.PERSON_ENTITY_ID = t0.PERSON_ENTITY_ID ");
        queryBuilder.append("WHERE t0.PERSON_ENTITY_ID NOT IN(SELECT PERSON_ENTITY_ID FROM COI_TRAVEL_DISCLOSURE WHERE ");
        queryBuilder.append("PERSON_ENTITY_ID = :PERSON_ENTITY_ID AND TRAVEL_DISCLOSURE_ID != :TRAVEL_DISCLOSURE_ID) AND t0.PERSON_ENTITY_ID = :PERSON_ENTITY_ID ");
        queryBuilder.append("AND t1.DISCLOSURE_TYPE_CODE = :DISCLOSURE_TYPE_CODE AND t2.VALID_PERS_ENTITY_REL_TYP_CODE = :VALID_PERS_ENTITY_REL_TYP_CODE AND t2.IS_SYSTEM_CREATED = :IS_SYSTEM_CREATED ");
        Query query = session.createNativeQuery( queryBuilder.toString());
        query.setParameter("PERSON_ENTITY_ID", personEntityId);
        query.setParameter("VALID_PERS_ENTITY_REL_TYP_CODE", travelSelfRelationship);
        query.setParameter("IS_SYSTEM_CREATED", isSystemCreated ? "Y" : "N");
        query.setParameter("DISCLOSURE_TYPE_CODE", Constants.DISCLOSURE_TYPE_CODE_TRAVEL);
        query.setParameter("TRAVEL_DISCLOSURE_ID", travelDisclosureId);
        query.executeUpdate();

    }

	@Override
	public Timestamp updateDisclosureUpdateDetails(Integer disclosureId) {
		Timestamp updateTimestamp = commonDao.getCurrentTimestamp();
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("UPDATE CoiTravelDisclosure ctd SET ctd.updateTimestamp = :updateTimestamp, ctd.updatedBy = :updatedBy where ctd.travelDisclosureId = :disclosureId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("disclosureId", disclosureId);
        query.setParameter("updateTimestamp", updateTimestamp);
        query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
        query.executeUpdate();
        return updateTimestamp;
	}

	@Override
	public Boolean isTravelDisclosureCreated(Integer personEntityId, String personId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		TypedQuery<Long> query = session.createQuery(
				"SELECT COUNT(t) FROM CoiTravelDisclosure t WHERE t.personId = :personId AND t.personEntityNumber = (SELECT t1.personEntityNumber FROM PersonEntity t1 WHERE t1.personEntityId = :personEntityId)",
				Long.class);
		query.setParameter("personEntityId", personEntityId);
		query.setParameter("personId", personId);
		return query.getSingleResult() > 0;
	}

	@Override
	public void syncEngagementDetails(CoiTravelDisclosure coiTravelDisclosure) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		Integer personEntityNumber = coiTravelDisclosure.getPersonEntityNumber();
		PersonEntity entity = session
				.createQuery("FROM PersonEntity p WHERE p.personEntityNumber = :num AND p.versionStatus = :status",
						PersonEntity.class)
				.setParameter("num", personEntityNumber).setParameter("status", Constants.COI_ACTIVE_STATUS)
				.uniqueResult();
		if (entity == null && Constants.COI_PENDING_STATUS.equals(coiTravelDisclosure.getVersionStatus())) {
			entity = session.createQuery(
	                "FROM PersonEntity p WHERE p.personEntityNumber = :num ORDER BY p.versionNumber DESC",
	                PersonEntity.class)
	            .setParameter("num", personEntityNumber)
	            .setMaxResults(1)
	            .uniqueResult();
		}
        coiTravelDisclosure.setPersonEntityId(entity.getPersonEntityId());
        coiTravelDisclosure.setEntityId(entity.getEntityId());
	}

}
