package com.polus.fibicomp.globalentity.pojo;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
//import javax.persistence.Entity;
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

@javax.persistence.Entity
@Data
@Table(name = "ENTITY_EXT")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EntityExt implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private int id;

	@Column(name = "ENTITY_ID")
	private int entityId;

	@ManyToOne(optional = true)
	@JoinColumn(foreignKey = @ForeignKey(name = "ENTITY_EXT_FK1"), name = "ENTITY_ID", referencedColumnName = "ENTITY_ID", insertable = false, updatable = false)
	private Entity entity;

    @Column(name = "COL_1_STRING_LABEL")
    private String col1StringLabel;

    @Column(name = "COL_1_STRING_VALUE")
    private String col1StringValue;

    @Column(name = "COL_2_STRING_LABEL")
    private String col2StringLabel;

    @Column(name = "COL_2_STRING_VALUE")
    private String col2StringValue;

    @Column(name = "COL_3_STRING_LABEL")
    private String col3StringLabel;

    @Column(name = "COL_3_STRING_VALUE")
    private String col3StringValue;

    @Column(name = "COL_4_STRING_LABEL")
    private String col4StringLabel;

    @Column(name = "COL_4_STRING_VALUE")
    private String col4StringValue;

    @Column(name = "COL_5_DATE_LABEL")
    private String col5DateLabel;

    @Column(name = "COL_5_DATE_VALUE")
    private Date col5DateValue;

    @Column(name = "COL_6_DATE_LABEL")
    private String col6DateLabel;

    @Column(name = "COL_6_DATE_VALUE")
    private Date col6DateValue;

    @Column(name = "COL_7_DATE_LABEL")
    private String col7DateLabel;

    @Column(name = "COL_7_DATE_VALUE")
    private Date col7DateValue;

}
