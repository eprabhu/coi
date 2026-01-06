package com.polus.fibicomp.cmp.dao;

import java.util.List;

import com.polus.fibicomp.cmp.pojo.CoiManagementPlanAttaType;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanAttachment;

public interface CoiManagementPlanFileAttachmentDao {

	/**
	 * Saves CMP attachment details.
	 *
	 * @param attachment the attachment entity to save
	 * @return the saved CMP attachment
	 */
	public CoiManagementPlanAttachment saveCmpAttachmentDetail(CoiManagementPlanAttachment attach);

	/**
	 * Updates the description of a CMP attachment.
	 *
	 * @param attachmentId the attachment ID
	 * @param description  the updated description
	 */
	public void updateCmpAttachmentDetail(Integer attachmentId, String description);

	/**
	 * Fetches CMP attachment details by attachment ID.
	 *
	 * @param attachmentId the attachment ID
	 * @return the CMP attachment
	 */
	public CoiManagementPlanAttachment fetchCmpAttachmentByAttachmentId(Integer attachmentId);

	/**
	 * Deletes a CMP attachment by ID.
	 *
	 * @param attachmentId the attachment ID
	 */
	public void deleteCmpAttachment(Integer attachmentId);

	/**
	 * Retrieves CMP attachments by attachment number.
	 *
	 * @param attachmentNumber the attachment number
	 * @return list of CMP attachments
	 */
	public List<CoiManagementPlanAttachment> fetchCmpAttachmentByAttachmentNumber(Integer attachmentNumber);

	/**
	 * Retrieves CMP attachments associated with a CMP ID.
	 *
	 * @param cmpId the CMP ID
	 * @return list of CMP attachments
	 */
	public List<CoiManagementPlanAttachment> fetchCmpAttachmnetBycmpId(Integer cmpId);

	/**
	 * Retrieves CMP attachment type details for a given type code.
	 *
	 * @param attaTypeCode the attachment type code
	 * @return the CMP attachment type details
	 */
	public CoiManagementPlanAttaType getCmpAttachmentTypeForTypeCode(String attaTypeCode);

}
