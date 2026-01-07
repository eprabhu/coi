package com.polus.integration.opaPersonFeed.pojo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.LastModifiedDate;

import java.io.Serializable;
import java.sql.Timestamp;

@Entity
@Table(name = "OPA_PERSON_FEED_LOG")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class OpaPersonFeedLog implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "OPA_PERSON_FEED_LOG_ID")
    private Integer opaPersonFeedLogId;

    @Column(name = "FEED_STARTED_AT")
    private Timestamp feedStartedAt;

    @Column(name = "FEED_COMPLETED_AT")
    private Timestamp feedCompletedAt;

    @Column(name = "FEED_STATUS")
    private String feedStatus;

    @Column(name = "ERROR_MESSAGE")
    private String errorMessage;

    @LastModifiedDate
    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

}
