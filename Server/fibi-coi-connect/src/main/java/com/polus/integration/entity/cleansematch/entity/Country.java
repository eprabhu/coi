package com.polus.integration.entity.cleansematch.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Entity
@Table(name = "COUNTRY")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Country implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "COUNTRY_CODE")
    private String countryCode;

    @Column(name = "COUNTRY_NAME")
    private String countryName;

    @Column(name = "COUNTRY_CODE_ISO2")
    private String countryTwoCode;

}
