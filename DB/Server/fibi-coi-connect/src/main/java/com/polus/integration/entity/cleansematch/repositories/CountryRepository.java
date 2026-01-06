package com.polus.integration.entity.cleansematch.repositories;

import com.polus.integration.entity.cleansematch.entity.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CountryRepository extends JpaRepository<Country, String> {

    Country findByCountryCode(String countryCode);

    Country findByCountryTwoCode(String countryCode);

}
