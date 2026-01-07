package com.polus.fibicomp.coi.notification.log.pojo;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.Data;

@Entity
@Table(name = "COI_NOTIFICATION_LOG_RECIPIENT")
@Data
public class CoiNotificationLogRecipient implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "NOTIFICATION_LOG_RECIPIENT_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer notificationLogRecipientId;

	@Column(name = "NOTIFICATION_LOG_ID")
	private Integer notificationLogId;

	@JsonBackReference
	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "COI_NOTIFICATION_LOG_RECIPIENT_FK1"), name = "NOTIFICATION_LOG_ID", referencedColumnName = "NOTIFICATION_LOG_ID", insertable = false, updatable = false)
	private CoiNotificationLog notificationLog;

	@Column(name = "RECIPIENT_EMAIL_ID")
	private String recipientEmailId;

	@Column(name = "RECIPIENT_PERSON_ID")
	private String recipientPersonId;

	@Column(name = "ROLE_TYPE_CODE")
	private Integer roleTypeCode;

	@Transient
	private String recipientFullName;

}
