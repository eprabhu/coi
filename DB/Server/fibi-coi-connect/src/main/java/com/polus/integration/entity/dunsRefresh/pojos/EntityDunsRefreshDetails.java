package com.polus.integration.entity.dunsRefresh.pojos;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.io.Serializable;
import java.sql.Timestamp;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@Entity
@Table(name = "ENTITY_DUNS_REFRESH_DETAILS")
@EntityListeners(AuditingEntityListener.class)
public class EntityDunsRefreshDetails  implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "ENT_DUNS_REF_DETAIL_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer entityDunsRefreshDetailId;

    @Column(name = "ENTITY_ID")
    private Integer entityId;

    @Column(name = "ENTITY_NUMBER")
    private Integer entityNumber;

    @Column(name = "DUNS_NUMBER")
    private String dunsNumber;

    @Column(name = "REFRESH_STATUS_TYPE_CODE")
    private String refreshStatusTypeCode;

    @Column(name = "MONITORING_SEED_FILE_NAME")
    private String monitoringSeedFileName;

    @ManyToOne
    @JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_DUNS_REFRESH_DETAILS_FK_2"), name = "REFRESH_STATUS_TYPE_CODE", referencedColumnName = "REFRESH_STATUS_TYPE_CODE", insertable = false, updatable = false)
    private EntityRefreshStatusType refreshStatusType;

    @Column(name = "MONITORING_SEED_DATA")
    private String monitoringSeedData;

    @Column(name = "REFRESH_TYPE_CODE")
    private String refreshTypeCode;

    @ManyToOne
    @JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_DUNS_REFRESH_DETAILS_FK_3"), name = "REFRESH_TYPE_CODE", referencedColumnName = "REFRESH_TYPE_CODE", insertable = false, updatable = false)
    private EntityRefreshType refreshType;

    @Column(name = "ERROR_MESSAGE")
    private String errorMessage;

    @Column(name = "CREATED_BY")
    private String createdBy;

    @CreatedDate
    @Column(name = "CREATE_TIMESTAMP")
    private Timestamp createTimestamp;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @LastModifiedDate
    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

    @Transient
    private String entityName;

    @Transient
    private Boolean isVerified;

    @Transient
    private String entityRefreshType;
}
