package com.polus.integration.opaPersonFeed.pojo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.io.Serializable;
import java.sql.Timestamp;

@Entity
@Table(name = "OPA_PERSON_FEED_LOG_DETAILS")
@AllArgsConstructor
@Data
@Builder
public class OpaPersonFeedLogDetails implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "OPA_PERSON_FEED_LOG_DETAIL_ID")
    private Integer opaPersonFeedLogDetailId;

    @Column(name = "OPA_PERSON_FEED_LOG_ID")
    private Integer opaPersonFeedLogId;

    @ManyToOne(optional = true)
    @JoinColumn(foreignKey = @ForeignKey(name = "OPA_PERSON_FEED_LOG_DETAILS_FK_1"), name = "OPA_PERSON_FEED_LOG_ID", referencedColumnName = "OPA_PERSON_FEED_LOG_ID", insertable = false, updatable = false)
    private OpaPersonFeedLog opaPersonFeedLog;

    @Column(name = "PERSON_ID")
    private String personId;

    @Column(name = "CREATE_TIMESTAMP")
    private Timestamp createTimestamp;
}
