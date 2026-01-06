package com.polus.fibicomp.fcoiDisclosure.service;

import com.polus.fibicomp.coi.dto.DisclosureProjectDto;

import java.util.List;

public interface FCOIDisclProjectService {

    /**
     * Fetching project details from disclosure project snapshot
     * @param disclosureId
     * @return
     */
    List<DisclosureProjectDto> getDisclProjectDetailsFromSnapshot(Integer disclosureId);
}
