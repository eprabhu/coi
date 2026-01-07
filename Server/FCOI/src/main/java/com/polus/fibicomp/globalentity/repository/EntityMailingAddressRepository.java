package com.polus.fibicomp.globalentity.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.polus.fibicomp.globalentity.pojo.EntityMailingAddress;

@Repository
public interface EntityMailingAddressRepository extends JpaRepository<EntityMailingAddress, Integer> {

    @Query(value = "SELECT * FROM ENTITY_MAILING_ADDRESS WHERE ENTITY_ID = :entityId ORDER BY UPDATE_TIMESTAMP DESC", nativeQuery = true)
    List<EntityMailingAddress> findByEntityId(@Param("entityId") Integer entityId);

    @Modifying
    @Query(value = "DELETE FROM ENTITY_MAILING_ADDRESS WHERE ENTITY_MAILING_ADDRESS_ID = :entityMailingAddressId", nativeQuery = true)
    void deleteByEntityMailingAddressId(@Param("entityMailingAddressId") Integer entityMailingAddressId);

    @Query(value = "SELECT * FROM ENTITY_MAILING_ADDRESS WHERE ENTITY_ID = :entityId AND ADDRESS_TYPE_CODE = :addressTypeCode ORDER BY UPDATE_TIMESTAMP DESC", nativeQuery = true)
    List<EntityMailingAddress> findByEntityIdAndAddressTypeCode(@Param("entityId") Integer entityId, @Param("addressTypeCode") String addressTypeCode);
}
