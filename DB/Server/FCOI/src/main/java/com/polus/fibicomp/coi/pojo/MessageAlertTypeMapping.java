package com.polus.fibicomp.coi.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.polus.core.util.JpaCharBooleanConversion;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "MESSAGE_ALERT_MAPPING")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageAlertTypeMapping implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "MESSAGE_ALERT_MAPPING_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer messageAlertTypeMappingId;

	@Column(name = "MESSAGE_TYPE_CODE")
	private String messageTypeCode;

	@Column(name = "ALERT_TYPE_CODE")
	private String alertTypeCode;
	
	@Column(name = "IS_ACTIVE")
	@Convert(converter = JpaCharBooleanConversion.class)
	private Boolean isActive;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

}
