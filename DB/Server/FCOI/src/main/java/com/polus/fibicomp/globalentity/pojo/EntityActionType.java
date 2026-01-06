package com.polus.fibicomp.globalentity.pojo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.sql.Timestamp;

@Entity
@Table(name = "ENTITY_ACTION_TYPE")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EntityActionType {

    @Id
    @Column(name = "ACTION_TYPE_CODE")
    private String actionTypeCode;

    @Column(name = "MESSAGE")
    private String message;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "UPDATE_USER")
    private String updateUser;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

}
