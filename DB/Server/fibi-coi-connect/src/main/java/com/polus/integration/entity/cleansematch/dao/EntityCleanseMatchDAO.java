package com.polus.integration.entity.cleansematch.dao;

import java.sql.Types;
import java.util.Arrays;
import java.util.List;

import com.polus.integration.entity.cleansematch.dto.DnBEntityCleanseMatchRequestDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementCreator;
import org.springframework.jdbc.core.PreparedStatementCreatorFactory;
import org.springframework.jdbc.core.SqlParameter;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.polus.integration.entity.cleansematch.dto.EntityInfoDTO;

@Transactional
@Repository
public class EntityCleanseMatchDAO {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public EntityInfoDTO getEntityInfoByDUNS(String dunsNumber,  DnBEntityCleanseMatchRequestDTO request) {
        Integer entityId = request == null ? null : request.getEntityId();
        Integer entityNumber  = request == null ? null : request.getEntityNumber();
        PreparedStatementCreatorFactory factory = new PreparedStatementCreatorFactory("{call CLENSEMATCH_ENT_INFO_BY_DUNS(?,?,?)}");
        factory.addParameter(new SqlParameter(Types.VARCHAR));
        factory.addParameter(new SqlParameter(Types.INTEGER));
        factory.addParameter(new SqlParameter(Types.INTEGER));
        PreparedStatementCreator psc = factory.newPreparedStatementCreator(new Object[]{dunsNumber, entityId, entityNumber});
        List<EntityInfoDTO> results = jdbcTemplate.query(psc, new EntityInfoRowMapper());        
        return results.isEmpty() ? null : results.get(0);
    }
   
}
