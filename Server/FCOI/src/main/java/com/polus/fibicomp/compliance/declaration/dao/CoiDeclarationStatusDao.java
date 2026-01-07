package com.polus.fibicomp.compliance.declaration.dao;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.fibicomp.compliance.declaration.pojo.CoiDeclarationStatus;

@Transactional
@Service
public interface CoiDeclarationStatusDao {

	CoiDeclarationStatus findById(String statusCode);

}
