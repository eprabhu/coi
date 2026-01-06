export type AttachmentInputType = 'REPLACE' | 'ADD' | 'DESCRIPTION_CHANGE';

export interface COIAttachment {
    attachmentId?: number;
    attachmentNumber?: number;
    versionNumber?: number;
    versionStatus?: string
    description?: string;
    attaTypeCode?: string;
    attachmentType?: CoiAttachmentType;
    attachmentStatusCode?: any;
    attachmentStatus?: any;
    fileName?: string;
    mimeType?: string;
    fileDataId?: string;
    updateTimestamp?: number;
    updatedBy?: string;
    updateUserFullame?: string;
    versionList?: COIAttachment[];
}

export interface CoiAttachmentType {
    attachmentTypeCode?: string
    description?: string
    updateTimestamp?: number
    updatedBy?: string
    isActive?: boolean
    isPrivate?: boolean
}

export interface UpdateAttachmentEvent {
    attachment: COIAttachment[] | COIAttachment | null;
    attachmentInputType: AttachmentInputType;
}
