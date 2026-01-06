package com.polus.fibicomp.compliance.declaration.dao;

import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.fibicomp.compliance.declaration.pojo.CoiDeclarationStatus;

import lombok.RequiredArgsConstructor;

@Service(value = "declarationStatusDao")
@Transactional
@RequiredArgsConstructor
public class CoiDeclarationStatusDaoImpl implements CoiDeclarationStatusDao {

	private final HibernateTemplate hibernateTemplate;

	@Override
	public CoiDeclarationStatus findById(String statusCode) {
		return hibernateTemplate.get(CoiDeclarationStatus.class, statusCode);
	}

}
