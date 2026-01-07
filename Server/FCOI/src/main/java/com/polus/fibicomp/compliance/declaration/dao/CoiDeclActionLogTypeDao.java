package com.polus.fibicomp.compliance.declaration.dao;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.fibicomp.compliance.declaration.pojo.CoiDeclActionLogType;

@Transactional
@Service
public interface CoiDeclActionLogTypeDao {

	CoiDeclActionLogType findById(String actionTypeCode);

}
