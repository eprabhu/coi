package com.polus.fibicomp.coi.pojo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.io.Serializable;
import java.sql.Timestamp;

@Entity
@Table(name = "PERSON_ENTITY_ACTION_LOG")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonEntityActionLog implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "ACTION_LOG_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer actionLogId;

	@Column(name = "PERSON_ENTITY_ID")
	private Integer personEntityId;

	@Column(name = "PERSON_ENTITY_NUMBER")
	private Integer personEntityNumber;

	@ManyToOne(optional = false)
	@JoinColumn(foreignKey = @ForeignKey(name = "PERSON_ENTITY_AL_FK2"), name = "PERSON_ENTITY_ID", referencedColumnName = "PERSON_ENTITY_ID", insertable = false, updatable = false)
	private PersonEntity personEntity;

	@Column(name = "ACTION_TYPE_CODE")
	private String actionTypeCode;

	@ManyToOne
	@JoinColumn(foreignKey = @ForeignKey(name = "PERSON_ENTITY_AL_FK1"), name = "ACTION_TYPE_CODE", referencedColumnName = "ACTION_TYPE_CODE", insertable = false, updatable = false)
	private PersonEntityActionType personEntityActionType;

	@Column(name = "DESCRIPTION")
	private String description;
	
	@Column(name = "COMMENT")
	private String comment;

	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@Column(name = "UPDATE_USER")
	private String updateUser;

}
