package com.polus.fibicomp.cmp.pojo;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "COI_MGMT_PLAN_RECIPIENT")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoiManagementPlanRecipient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CMP_RECIPIENT_ID")
    private Integer cmpRecipientId;

    @Column(name = "CMP_ID", nullable = false)
    private Integer cmpId;

    @Column(name = "SIGN_ORDER", nullable = false)
    private Integer signOrder;

    @Column(name = "SIGNATURE_BLOCK", nullable = false)
    private String signatureBlock;

    @Column(name = "PERSON_ID")
    private String personId;

    @Column(name = "DESIGNATION")
    private String designation;

    @Column(name = "ATTESTATION_STATEMENT")
    private String attestationStatement;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

    @Column(name = "CREATED_BY")
    private String createdBy;

    @Column(name = "CREATE_TIMESTAMP")
    private Timestamp createTimestamp;
}
