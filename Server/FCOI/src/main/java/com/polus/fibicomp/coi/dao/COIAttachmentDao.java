package com.polus.fibicomp.coi.dao;

import java.util.List;

import com.polus.fibicomp.coi.pojo.Attachments;
import com.polus.fibicomp.coi.pojo.DisclAttaType;

public interface COIAttachmentDao {

	/**
	 * This method is used to fetch disclosure attachment type details
	 * @param attaTypeCode
	 * @return fetches the disclosure type details
	 */
	public DisclAttaType getDisclosureAttachmentForTypeCode(String attaTypeCode);

	/**
	 * This method is used to update attachment details
	 * @param attachmentId
	 * @param description
	 */
	public void updateAttachmentDetail(Integer attachmentId, String description);

	/**
	 * This method is used to fetch attachment using attachment id
	 * @param attachmentId
	 * @return get the attachment details
	 */
	public Attachments fetchAttachmentByAttachmentId(Integer attachmentId);

	/**
	 * This method is used to fetch attachment using attachment number
	 * @param attachmentId
	 * @return List of attachment details
	 */
	public List<Attachments> fetchAttachmentByAttachmentNumber(Integer attachmentId);

	/**
	 * This method is used to delete attachment
	 * @param attachmentId
	 */
	public void deleteAttachment(Integer attachmentId);

}
