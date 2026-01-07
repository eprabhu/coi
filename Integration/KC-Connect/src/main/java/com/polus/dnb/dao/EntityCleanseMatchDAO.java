package com.polus.dnb.dao;

import java.sql.Types;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementCreator;
import org.springframework.jdbc.core.PreparedStatementCreatorFactory;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.polus.dnb.dto.EntityInfoDTO;

@Transactional
@Repository
public class EntityCleanseMatchDAO {

	@Autowired
	private JdbcTemplate jdbcTemplate;

	public EntityInfoDTO getEntityInfoByDUNS(String dunsNumber) {

		PreparedStatementCreatorFactory factory = new PreparedStatementCreatorFactory(
				"{call CLENSEMATCH_ENT_INFO_BY_DUNS(?)}", Types.VARCHAR);

		PreparedStatementCreator psc = factory.newPreparedStatementCreator(new Object[] { dunsNumber });
		List<EntityInfoDTO> results = jdbcTemplate.query(psc, new EntityInfoRowMapper());
		return results.isEmpty() ? null : results.get(0);
	}

}
