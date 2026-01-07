package com.polus.fibicomp.coi.notification.log.pojo;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.Data;

@Entity
@Table(name = "COI_NOTIFICATION_LOG")
@Data
public class CoiNotificationLog implements Serializable {

	private static final long serialVersionUID = 1L;

	public CoiNotificationLog() {
		super();
		this.notificationLogRecipients = new ArrayList<>();
	}

	@Id
	@Column(name = "NOTIFICATION_LOG_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer notificationLogId;

	@Column(name = "NOTIFICATION_TYPE_ID")
	private Integer notificationTypeId;

	@Column(name = "MODULE_ITEM_KEY")
	private String moduleItemKey;

	@Column(name = "MODULE_SUB_ITEM_KEY")
	private String moduleSubItemKey;

	@Column(name = "MODULE_CODE")
	private Integer moduleCode;

	@Column(name = "SUBJECT")
	private String subject;

	@Column(name = "MESSAGE")
	private String message;

	@Column(name = "SEND_DATE")
	private Timestamp sendDate;

	@Column(name = "REQUESTED_BY")
	private String requestedBy;

	@Column(name = "MESSAGE_ID")
	private String messageId;

	@Column(name = "ACTION_TYPE")
	private String actionType;

	@JsonManagedReference
	@OneToMany(mappedBy = "notificationLog", orphanRemoval = true, cascade = { CascadeType.ALL }, fetch = FetchType.EAGER)
	private List<CoiNotificationLogRecipient> notificationLogRecipients;

	@Transient
	private String fromUserFullName;

}
