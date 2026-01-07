package com.polus.integration.entity.cleansematch.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "ENTITY_STAGE_BATCH")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntityStageBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BATCH_ID")
    private Integer batchId;

    @Column(name = "SRC_TYPE_CODE")
    private String batchSrcTypeCode;

    @ManyToOne(optional = true)
    @JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_STAGE_BATCH_FK1"), name = "SRC_TYPE_CODE", referencedColumnName = "ENTITY_SOURCE_TYPE_CODE", insertable = false, updatable = false)
    private EntitySourceType batchSrcType;

    @Column(name = "BATCH_STATUS_CODE")
    private Integer batchStatusCode;

    @ManyToOne(optional = true)
    @JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_STAGE_BATCH_FK2"), name = "BATCH_STATUS_CODE", referencedColumnName = "BATCH_STATUS_CODE", insertable = false, updatable = false)
    private EntityStageBatchStatusType batchStatusType;

    @Column(name = "REVIEW_STATUS_CODE")
    private Integer reviewStatusCode;

    @ManyToOne(optional = true)
    @JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_STAGE_BATCH_FK3"), name = "REVIEW_STATUS_CODE", referencedColumnName = "REVIEW_STATUS_CODE", insertable = false, updatable = false)
    private EntityStageBatchReviewStatusType reviewStatusType;

    @Column(name = "COMPLETION_DATE")
    private Timestamp completionDate;

    @Column(name = "BATCH_TYPE")
    private String batchType;

    @Column(name = "CREATED_BY")
    private String createdBy;

    @Column(name = "CREATE_TIMESTAMP")
    @CreatedDate
    private Timestamp createTimestamp;

    @Column(name = "UPDATE_TIMESTAMP")
    @LastModifiedDate
    private Timestamp updateTimestamp;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

}
