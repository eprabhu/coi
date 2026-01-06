package com.polus.fibicomp.coi.repository;

import java.util.List;

import com.polus.fibicomp.cmp.pojo.CoiManagementPlanActionType;
import com.polus.fibicomp.cmp.pojo.CoiMgmtPlanActionLog;
import com.polus.fibicomp.coi.dto.DisclosureActionLogDto;
import com.polus.fibicomp.coi.dto.PersonEntityDto;
import com.polus.fibicomp.coi.pojo.DisclosureActionLog;
import com.polus.fibicomp.coi.pojo.PersonEntityActionLog;
import com.polus.fibicomp.coi.pojo.PersonEntityActionType;
import com.polus.fibicomp.coi.pojo.TravelDisclosureActionLog;
import com.polus.fibicomp.compliance.declaration.pojo.CoiDeclActionLogType;
import com.polus.fibicomp.disclosures.consultingdisclosure.pojo.ConsultingDisclActionLog;
import com.polus.fibicomp.disclosures.consultingdisclosure.pojo.ConsultingDisclActionLogType;
import com.polus.fibicomp.opa.pojo.OPAActionLog;
import com.polus.fibicomp.opa.pojo.OPAActionLogType;
import com.polus.fibicomp.travelDisclosure.dtos.TravelDisclosureActionLogDto;

public interface ActionLogDao {

    public List<DisclosureActionLog> fetchDisclosureActionLogsBasedOnDisclosureId(Integer disclosureId, List<String> reviewActionTypeCodes);

    List<TravelDisclosureActionLog> fetchTravelDisclosureActionLog(Integer travelDisclosureId, String actionTypeCode);

    void saveObject(Object e);

    /**
     * This method is used to fetch disclosure action log
     * @param actionLogDto
     * @return
     */
    List<DisclosureActionLog> fetchDisclosureActionLog(DisclosureActionLogDto actionLogDto);

    public List<TravelDisclosureActionLog> fetchTravelDisclosureActionLogsBasedOnId(Integer travelDisclosureId);

    List<TravelDisclosureActionLog> fetchTravelDisclosureActionLog(TravelDisclosureActionLogDto actionLogDto);

    /**
     * This method is used to fetch review action log
     * @param disclosureId
     * @param actionTypeCodes
     * @return
     */
	List<DisclosureActionLog> fetchReviewActionLogs(Integer disclosureId, List<String> actionTypeCodes);

    /**
     * This method is used to get PersonEntityActionType by actionLogTypeCode
     * @param actionLogTypeCode String
     * @return PersonEntityActionType
     */
    PersonEntityActionType getPersonEntityActionType(String actionLogTypeCode);

    /**
     * This method is fetches all the Person Entity action logs of current version and of previous versions
     * @param personEntityDto
     * @return List<PersonEntityActionLog>
     */
    List<PersonEntityActionLog> fetchPersonEntityActionLog(PersonEntityDto personEntityDto);

    /**
     * This method deletes person entity action log by person entity id
     * @param personEntityId
     */
    void deletePersonEntityActionLog(Integer personEntityId);

    /**
     * This method is used to fetch OPA Action Log Type
     * @param actionLogTypeCode
     * @return OPAActionLogType
     */
    OPAActionLogType getOPAActionType(String actionLogTypeCode);

    /**
     * This method is used to fetch OPA disclosure action logs based on id and isStatusIn
     * @param opaDisclosureId
     * @param actionTypeCodes
     * @param isStatusIn
     * @return
     */
    List<OPAActionLog> fetchOpaDisclosureActionLogsBasedOnId(Integer opaDisclosureId, List<String> actionTypeCodes, boolean isStatusIn);

    /**
     * This method is used to fetch Consulting disclosure Action Log Type
     * @param actionLogTypeCode
     * @return ConsultingDisclActionLogType
     */
	ConsultingDisclActionLogType getConsultDisclActionType(String actionLogTypeCode);

	/**
     * This method is used to fetch Consulting disclosure action logs based on id
     * @param disclosureId
     * @return list of ConsultingDisclActionLog
     */
	List<ConsultingDisclActionLog> fetchConsultDisclActionLogsBasedOnId(Integer disclosureId);


    /**
     * This method is used to fetch coi disclosure action logs based on id and action log codes
     * @param disclosureId
     * @param actionTypeCodes
     * @param isStatusIn
     * @return
     */
    List<DisclosureActionLog> fetchCoiDisclosureActionLogsBasedOnId(Integer disclosureId, List<String> actionTypeCodes, boolean isStatusIn);

    /**
     * Get Coi Declaration Action Type
     * @param actionTypeCode
     * @return
     */
    CoiDeclActionLogType getCoiDeclarationActionType(String actionTypeCode);

    CoiManagementPlanActionType getCmpActionType(String actionTypeCode);

	public List<CoiMgmtPlanActionLog> fetchCmpActionLogsByCmpId(Integer cmpId, List<String> actionTypeCodes, boolean isStatusIn);

}
