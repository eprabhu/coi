package com.polus.fibicomp.compliance.declaration.dao;

import java.util.List;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;

import org.hibernate.Session;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.fibicomp.compliance.declaration.pojo.CoiDeclarationType;

import lombok.RequiredArgsConstructor;

@Service(value = "declarationTypeDao")
@Transactional
@RequiredArgsConstructor
public class CoiDeclarationTypeDaoImpl implements CoiDeclarationTypeDao {

	private final HibernateTemplate hibernateTemplate;

	@Override
	public CoiDeclarationType findById(String typeCode) {
		return hibernateTemplate.get(CoiDeclarationType.class, typeCode);
	}

	@Override
	public List<CoiDeclarationType> findAll() {
		return hibernateTemplate.loadAll(CoiDeclarationType.class);
	}

	@Override
	public List<CoiDeclarationType> findActiveTypes() {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder cb = session.getCriteriaBuilder();
		CriteriaQuery<CoiDeclarationType> cq = cb.createQuery(CoiDeclarationType.class);
		Root<CoiDeclarationType> root = cq.from(CoiDeclarationType.class);
		cq.select(root).where(cb.equal(root.get("isActive"), true));
		return session.createQuery(cq).getResultList();
	}

}
