package com.polus.fibicomp.globalentity.pojo;

import com.polus.core.pojo.Country;
import com.polus.core.util.JpaCharBooleanConversion;
import lombok.Data;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import java.io.Serializable;
import java.sql.Timestamp;

@Entity
@Data
@Table(name = "ENTITY_NON_FOREIGN_COUNTRIES")
public class EntityNonForeignCountries implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ENTITY_NON_FOREIGN_COUNTRY_ID")
    private Integer entityNonForeignCountryId;

    @Column(name = "NON_FOREIGN_COUNTRY_CODE")
    private String nonForeignCountryCode;

    @ManyToOne
    @JoinColumn(foreignKey = @ForeignKey(name = "NON_FOREIGN_COUNTRY_CODE_FK_1"), name = "NON_FOREIGN_COUNTRY_CODE", referencedColumnName = "COUNTRY_CODE", insertable = false, updatable = false)
    private Country nonForeignCountry;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "IS_ACTIVE")
    @Convert(converter = JpaCharBooleanConversion.class)
    private Boolean isActive;

}
