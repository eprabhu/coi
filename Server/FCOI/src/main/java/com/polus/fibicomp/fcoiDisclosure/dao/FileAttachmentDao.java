package com.polus.fibicomp.fcoiDisclosure.dao;

import java.util.List;

import com.polus.fibicomp.fcoiDisclosure.pojo.DisclAttachment;

public interface FileAttachmentDao {

	/**
	 * To save disclosure attachment details
	 * @param attach
	 * @return
	 */
	public DisclAttachment saveDisclAttachmentDetail(DisclAttachment attach);

	/**
	 * To update disclosure attachment detail
	 * @param attachmentId
	 * @param description
	 */
	public void updateDisclAttachmentDetail(Integer attachmentId, String description);

	/**
	 * To fetch disclosure attachment by id
	 * @param attachmentId
	 * @return
	 */
	public DisclAttachment fetchDisclAttachmentByAttachmentId(Integer attachmentId);

	/**
	 * To delete a disclosure attachment
	 * @param attachmentId
	 */
	public void deleteDisclAttachment(Integer attachmentId);

	/**
	 * To fetch disclosure attachment by attachmentNumber
	 * @param attachmentNumber
	 * @return
	 */
	public List<DisclAttachment> fetchDisclAttachmentByAttachmentNumber(Integer attachmentNumber);

	/**
	 * fetch disclosure attachment by disclosureId
	 * @param disclosureId
	 * @return
	 */
	public List<DisclAttachment> fetchDisclAttachmnetByDisclosureId(Integer disclosureId);

}
