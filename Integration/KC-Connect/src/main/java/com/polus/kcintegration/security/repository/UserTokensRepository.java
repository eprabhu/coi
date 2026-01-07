package com.polus.kcintegration.security.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.polus.kcintegration.security.pojo.UserTokens;

@Repository
public interface UserTokensRepository extends JpaRepository<UserTokens, Long> {

	UserTokens findByUserName(String userName);

}
