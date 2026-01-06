package com.polus.fibicomp.compliance.declaration.dao;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.fibicomp.compliance.declaration.pojo.CoiDeclarationType;

@Transactional
@Service
public interface CoiDeclarationTypeDao {

	CoiDeclarationType findById(String typeCode);

	List<CoiDeclarationType> findAll();

	List<CoiDeclarationType> findActiveTypes();

}
