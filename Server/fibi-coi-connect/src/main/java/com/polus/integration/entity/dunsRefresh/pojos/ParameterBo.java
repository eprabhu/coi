package com.polus.integration.entity.dunsRefresh.pojos;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.io.Serializable;

@Data
@Entity
@Table(name = "PARAMETER")
public class ParameterBo implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "PARAMETER_NAME")
    private String parameterName;

    @Column(name = "VALUE")
    private String value;

}
