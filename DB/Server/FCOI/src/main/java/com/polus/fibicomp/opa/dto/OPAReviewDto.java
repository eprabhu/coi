package com.polus.fibicomp.opa.dto;

import com.polus.fibicomp.opa.pojo.OPADisclosure;
import com.polus.fibicomp.opa.pojo.OPAReviewLocationType;
import com.polus.fibicomp.opa.pojo.OPAReviewReviewerStatusType;
import lombok.*;

import java.sql.Timestamp;
import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OPAReviewDto {

	private Integer opaReviewId;
	private String assigneePersonId;
	private String assigneePersonName;
	private Integer opaDisclosureId;
	private Integer adminGroupId;
	private String reviewStatusTypeCode;
	private OPAReviewReviewerStatusType reviewStatusType;
	private String locationTypeCode;
	private OPAReviewLocationType reviewLocationType;
	private String description ;
	private Date startDate;
	private Date endDate;
	private Timestamp updateTimestamp;
	private String updateUserFullName;
	private OPADisclosure opaDisclosure;
}
