package com.polus.integration.exception.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "MQ_EXCEPTION_LOG")
@Data
@NoArgsConstructor
public class MQExceptionsLog implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "QUEUE_MESSAGE")
	private String queueMessage;

	@Column(name = "SOURCE_QUEUE_NAME")
	private String sourceQueueName;

	@Column(name = "DESTINATION_QUEUE_NAME")
	private String destinationQueueName;

	@Column(name = "QUEUE_EXCHANGE")
	private String queueExchange;

	@Column(name = "MESSAGE_ID")
	private String messageId;

	@Column(name = "MODULE_CODE")
	private Integer moduleCode;

	@Column(name = "SUB_MODULE_CODE")
	private Integer subModuleCode;

	@Column(name = "ACTION_TYPE")
	private String actionType;

	@Column(name = "ERROR_CODE")
	private String errorCode;

	@Column(name = "ERROR_MESSAGE")
	private String errorMessage;

	@Column(name = "STACK_TRACE")
	private String stackTrace;

	@Column(name = "TRIGGER_TYPE")
	private String triggerType;

	@Column(name = "EVENT_TYPE")
	private String eventType;

	@LastModifiedDate
	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@LastModifiedBy
	@Column(name = "UPDATE_USER")
	private String updateUser;

	@Column(name = "USER_TYPE")
	private String userType;

}
