package com.polus.fibicomp.globalentity.pojo;

import java.sql.Timestamp;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@javax.persistence.Entity
@Table(name = "ENTITY_RISK_ACTION_LOG")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EntityRiskActionLog {

    @Id
    @Column(name = "ACTION_LOG_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer actionLogId;

    @Column(name = "ENTITY_ID")
    private Integer entityId;

    @Column(name = "ACTION_TYPE_CODE")
    private String actionTypeCode;

    @ManyToOne(cascade = CascadeType.REFRESH)
    @JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_ACTION_LOG_FK1"), name = "ACTION_TYPE_CODE", referencedColumnName = "ACTION_TYPE_CODE", insertable = false, updatable = false)
    private EntityActionType entityActionType;

    @Column(name = "ENTITY_RISK_ID")
    private Integer entityRiskId;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "OLD_RISK_LEVEL")
    private String oldRiskLevel;

    @Column(name = "NEW_RISK_LEVEL")
    private String newRiskLevel;

    @Column(name = "OLD_COMMENT")
    private String oldComment;

    @Column(name = "NEW_COMMENT")
    private String newComment;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

}
