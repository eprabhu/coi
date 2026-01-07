package com.polus.fibicomp.compliance.declaration.dao;

import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.fibicomp.compliance.declaration.pojo.CoiDeclActionLogType;

import lombok.RequiredArgsConstructor;

@Service(value = "declActionLogTypeDao")
@Transactional
@RequiredArgsConstructor
public class CoiDeclActionLogTypeDaoImpl implements CoiDeclActionLogTypeDao {

	private final HibernateTemplate hibernateTemplate;

	@Override
	public CoiDeclActionLogType findById(String actionTypeCode) {
		return hibernateTemplate.get(CoiDeclActionLogType.class, actionTypeCode);
	}

}
