package com.polus.fibicomp.globalentity.dao;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.fibicomp.globalentity.dto.ExternalReferenceRequestDTO;
import com.polus.fibicomp.globalentity.pojo.EntityExternalIdMapping;

@Transactional
@Service
public interface EntityExternalReferenceDAO {

	int saveEntityExternalReference(EntityExternalIdMapping entity);

	void updatExternalReference(ExternalReferenceRequestDTO dto);


}
