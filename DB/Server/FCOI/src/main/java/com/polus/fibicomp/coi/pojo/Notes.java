package com.polus.fibicomp.coi.pojo;

import java.io.Serializable;
import java.sql.Timestamp;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "NOTES")
public class Notes implements Serializable {
	
	private static final long serialVersionUID = 1L;
	
	@Id
	@Column(name = "NOTE_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer noteId;

	@Column(name = "TITLE")
	private String title;

	@Column(name = "PERSON_ID")
	private String personId;

	@Column(name = "CONTENT")
	private String content;

	@LastModifiedDate
	@Column(name = "UPDATE_TIMESTAMP")
	private Timestamp updateTimestamp;

	@LastModifiedBy
	@Column(name = "UPDATED_BY")
	private String updatedBy;

}
