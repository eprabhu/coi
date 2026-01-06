package com.polus.fibicomp.globalentity.pojo;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "ENTITY_SECTION_ACCESS_RIGHT")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EntitySectionAccessRight implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SEC_ACCESS_RIGHT_ID")
    private int secAccessRightId;

    @Column(name = "SECTION_CODE")
    private String sectionCode;

    @Column(name = "RIGHT_NAME")
    private String rightName;

    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @ManyToOne(optional = true)
    @JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_SECTION_ACCESS_RIGHT_FK1"), name = "SECTION_CODE", referencedColumnName = "ENTITY_SECTION_CODE", insertable = false, updatable = false)
    private EntitySection entitySection;

}
