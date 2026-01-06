package com.polus.integration.entity.cleansematch.entity;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;


import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.Predicate;


public class StageDnBEntityMatchSpecification {

    public static Specification<EntityStageDetails> getSpecifications(Map<String, String> filters) {
        return (root, query, criteriaBuilder) -> {
        	
            List<Predicate> predicates = new ArrayList<>();
            filters.forEach((key, value) -> {
                if (StringUtils.hasText(value)) {
                    predicates.add(criteriaBuilder.equal(root.get(key), value));
                }
            });

            // Combine all predicates with 'AND'. If no predicates, return 'null' (no filtering)
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
