package com.polus.fibicomp.travelDisclosure.dtos;

import com.polus.fibicomp.coi.pojo.ValidPersonEntityRelType;
import com.polus.fibicomp.travelDisclosure.pojos.CoiTravelDisclosureStatusType;
import com.polus.fibicomp.travelDisclosure.pojos.CoiTravelDocumentStatusType;
import com.polus.fibicomp.travelDisclosure.pojos.CoiTravelFundingAgencyType;
import com.polus.fibicomp.travelDisclosure.pojos.CoiTravelFundingType;
import com.polus.fibicomp.travelDisclosure.pojos.CoiTravelReviewStatusType;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CoiTravelDisclLookups {

    List<CoiTravelDisclosureStatusType> travelDisclosureStatusTypes;
    List<CoiTravelDocumentStatusType> travelDocumentStatusTypes;
    List<CoiTravelFundingAgencyType> travelFundingAgencyTypes;
    List<CoiTravelFundingType> travelFundingTypes;
    List<CoiTravelReviewStatusType> travelReviewStatusTypes;
    List<ValidPersonEntityRelType> travelRelationshipTypes;

}
