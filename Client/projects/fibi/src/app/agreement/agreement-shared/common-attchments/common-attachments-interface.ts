export interface AttachmentType {
    attachmentTypeCode: number;
    description: string;
    updateTimeStamp: number;
    updateUser: string;
    isActive: boolean;
}

export class Attachment {
    agreementAttachmentId: number;
    agreementAttachmentTypeCode: number | string = null;
    agreementAttachmentType: AttachmentType;
    description: string;
    fileName: string;
    updateTimeStamp: number;
    updateUser: string;
    versionNumber: number;
    fileDataId: string;
    documentStatusCode: number;
    documentStatus: DocumentStatus;
    documentId: number;
    proposalNumber: string;
    sequenceNumber: number;
    lastUpdateUserFullName: string;
}

export interface DocumentStatus {
    documentStatusCode: number;
    description: string;
    updateUser: string;
    updateTimeStamp: number;
}
