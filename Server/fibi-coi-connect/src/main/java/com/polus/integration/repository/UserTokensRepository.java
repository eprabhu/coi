package com.polus.integration.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.polus.integration.pojo.UserTokens;

@Repository
public interface UserTokensRepository extends JpaRepository<UserTokens, Long> {

	UserTokens findByUserName(String userName);

}
