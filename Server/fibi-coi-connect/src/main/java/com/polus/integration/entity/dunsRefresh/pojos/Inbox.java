package com.polus.integration.entity.dunsRefresh.pojos;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.io.Serializable;
import java.sql.Timestamp;

@Entity
@Table(name = "INBOX")
@Data
public class Inbox implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "INBOX_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer inboxId;

    @Column(name = "MODULE_CODE")
    private Integer moduleCode;

    @Column(name = "MODULE_ITEM_KEY")
    private String moduleItemKey;

    @Column(name = "MESSAGE_TYPE_CODE")
    private String messageTypeCode;

    @Column(name = "USER_MESSAGE")
    private String userMessage;

    @Column(name = "OPENED_FLAG")
    private String openedFlag;

    @Column(name = "SUBJECT_TYPE")
    private String subjectType;

    @Column(name = "TO_PERSON_ID")
    private String toPersonId;

    @Column(name = "ARRIVAL_DATE")
    private Timestamp arrivalDate;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimeStamp;

    @Column(name = "UPDATE_USER")
    private String updateUser;

    @Column(name = "SUB_MODULE_CODE")
    private Integer subModuleCode;

    @Column(name = "SUB_MODULE_ITEM_KEY")
    private String subModuleItemKey;

    @Column(name = "ALERT_TYPE")
    private String alertType;
}
