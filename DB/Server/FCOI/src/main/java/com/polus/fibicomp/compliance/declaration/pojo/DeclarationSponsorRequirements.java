package com.polus.fibicomp.compliance.declaration.pojo;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "DECLARATION_SPONSOR_REQUREMNTS")
@AllArgsConstructor
@NoArgsConstructor
public class DeclarationSponsorRequirements {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SPONSOR_REQUREMNTS_ID")
    private Integer sponsorRequirementId;

    @Column(name = "SPONSOR_CODE")
    private String sponsorCode;

    @Column(name = "DECLARATION_TYPE_CODE")
    private String declarationTypeCode;

    @ManyToOne(optional = true)
    @JoinColumn(foreignKey = @ForeignKey(name = "DECLARATION_SPONSOR_REQUREMNTS_FK1"), name = "DECLARATION_TYPE_CODE", referencedColumnName = "DECLARATION_TYPE_CODE", insertable = false, updatable = false)
    private CoiDeclarationType declarationType;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

}
