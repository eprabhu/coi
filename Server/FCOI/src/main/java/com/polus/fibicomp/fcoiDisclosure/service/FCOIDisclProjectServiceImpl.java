package com.polus.fibicomp.fcoiDisclosure.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.fibicomp.coi.dto.DisclosureProjectDto;
import com.polus.fibicomp.fcoiDisclosure.dao.FcoiDisclosureDao;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiProjectType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class FCOIDisclProjectServiceImpl implements FCOIDisclProjectService {

    @Autowired
    private FcoiDisclosureDao disclosureDao;

    @Override
    public List<DisclosureProjectDto> getDisclProjectDetailsFromSnapshot(Integer disclosureId) {
        List<DisclosureProjectDto> projectDtos = new ArrayList<>();
        List<CoiProjectType> coiProjectTypes = disclosureDao.getCoiProjectTypes();
        disclosureDao.getCoiDisclProjects(disclosureId).forEach(disclProj -> {
            // Parsing JSON string to a JsonNode (JSON tree)
            ObjectMapper objectMapper = new ObjectMapper();
            try {
                JsonNode jsonNode = objectMapper.readTree(disclProj.getProjectSnapshot());
                DisclosureProjectDto projectDto = new DisclosureProjectDto();
                projectDto.setProjectId(jsonNode.get("PROJECT_ID").asText());
                projectDto.setCoiDisclProjectId(disclProj.getCoiDisclProjectId());
                projectDto.setModuleCode(jsonNode.get("COI_PROJECT_TYPE_CODE").asInt());
                projectDto.setProjectNumber(jsonNode.get("PROJECT_NUMBER").asText());
                projectDto.setTitle(jsonNode.get("PROJECT_TITLE").asText());
                projectDto.setProjectStatus(jsonNode.get("PROJECT_STATUS").asText());
                if (jsonNode.has("DOCUMENT_NUMBER") && !jsonNode.get("DOCUMENT_NUMBER").isNull())
                projectDto.setDocumentNumber(jsonNode.get("DOCUMENT_NUMBER").asText());
                if (jsonNode.has("PROJECT_START_DATE") && !jsonNode.get("PROJECT_START_DATE").isNull())
                    projectDto.setProjectStartDate(convertToTimestamp(jsonNode.get("PROJECT_START_DATE").asText()));
                if (jsonNode.has("PROJECT_END_DATE") && !jsonNode.get("PROJECT_END_DATE").isNull())
                    projectDto.setProjectEndDate(convertToTimestamp(jsonNode.get("PROJECT_END_DATE").asText()));
                projectDto.setHomeUnitName(jsonNode.get("LEAD_UNIT_NAME").asText());
                projectDto.setHomeUnitNumber(jsonNode.get("LEAD_UNIT_NUMBER").asText());
                if (jsonNode.has("SPONSOR_CODE") && !jsonNode.get("SPONSOR_CODE").isNull())
                    projectDto.setSponsorCode(jsonNode.get("SPONSOR_CODE").asText());
                if (jsonNode.has("SPONSOR_NAME") && !jsonNode.get("SPONSOR_NAME").isNull())
                    projectDto.setSponsorName(jsonNode.get("SPONSOR_NAME").asText());
                if (jsonNode.has("PRIME_SPONSOR_NAME") && !jsonNode.get("PRIME_SPONSOR_NAME").isNull())
                    projectDto.setPrimeSponsorName(jsonNode.get("PRIME_SPONSOR_NAME").asText());
                if (jsonNode.has("PRIME_SPONSOR_CODE") && !jsonNode.get("PRIME_SPONSOR_CODE").isNull())
                    projectDto.setPrimeSponsorCode(jsonNode.get("PRIME_SPONSOR_CODE").asText());
                projectDto.setPiName(jsonNode.get("PI_NAME").asText());
                projectDto.setKeyPersonId(jsonNode.get("KEY_PERSON_ID").asText());
                projectDto.setKeyPersonName(jsonNode.get("KEY_PERSON_NAME").asText());
                projectDto.setReporterRole(jsonNode.get("KEY_PERSON_ROLE_NAME").asText());
                if (jsonNode.has("ACCOUNT_NUMBER") && !jsonNode.get("ACCOUNT_NUMBER").isNull())
                    projectDto.setAccountNumber(jsonNode.get("ACCOUNT_NUMBER").asText());
                Optional<CoiProjectType> coiProjectType = coiProjectTypes.stream().filter(obj -> obj.getCoiProjectTypeCode().equals(projectDto.getModuleCode().toString())).findFirst();
                projectDto.setProjectType(coiProjectType.get().getDescription());
                projectDto.setProjectTypeCode(coiProjectType.get().getCoiProjectTypeCode());
                projectDto.setProjectBadgeColour(coiProjectType.get().getBadgeColor());
                projectDto.setProjectIcon(coiProjectType.get().getProjectIcon());
                projectDtos.add(projectDto);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
        return projectDtos;
    }

    Timestamp convertToTimestamp(String date) {
        Timestamp startDateTimestamp;
        try {
            startDateTimestamp = Timestamp.valueOf(date);
        } catch (IllegalArgumentException e) {
            LocalDate formatedDate = LocalDate.parse(date);
            startDateTimestamp = Timestamp.valueOf(formatedDate.atStartOfDay());
        }
        return startDateTimestamp;
    }
}
