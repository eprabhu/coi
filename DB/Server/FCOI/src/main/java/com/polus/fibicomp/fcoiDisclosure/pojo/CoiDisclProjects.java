package com.polus.fibicomp.fcoiDisclosure.pojo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name = "COI_DISCL_PROJECTS")
@EntityListeners(AuditingEntityListener.class)
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CoiDisclProjects {

    @Id
    @Column(name = "COI_DISCL_PROJECTS_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer coiDisclProjectId;

    @Column(name = "DISCLOSURE_ID")
    private Integer disclosureId;

    @ManyToOne(optional = true)
    @JoinColumn(foreignKey = @ForeignKey(name = "COI_DISCL_PROJECTS_FK1"), name = "DISCLOSURE_ID", referencedColumnName = "DISCLOSURE_ID", insertable = false, updatable = false)
    private CoiDisclosure coiDisclosure;

    @Column(name = "DISCLOSURE_NUMBER")
    private Integer disclosureNumber;

    @Column(name = "MODULE_CODE")
    private Integer moduleCode;

    @Column(name = "MODULE_ITEM_KEY")
    private String moduleItemKey;

    @OneToMany(mappedBy = "coiDisclProject", cascade = CascadeType.ALL, orphanRemoval = true)
    List<CoiDisclProjectEntityRel> disclProjectEntityRels;

    @Column(name = "PROJECT_SNAPSHOT")
    private String projectSnapshot;

    @LastModifiedBy
    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @LastModifiedDate
    @Column(name = "UPDATE_TIMESTAMP")
    private Timestamp updateTimestamp;

}
