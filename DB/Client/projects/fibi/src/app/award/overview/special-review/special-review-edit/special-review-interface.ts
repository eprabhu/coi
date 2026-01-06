export class SpecialReviews {
    awardId: number;
    awardNumber: number;
    specialReviewCode: number | string = null;
    approvalTypeCode: number | string = null;
    expirationDate: Date | string;
    protocolNumber = '';
    applicationDate: Date | string;
    approvalDate: Date | string;
    comments = '';
    updateTimestamp: number;
    updateUser = '';
    isIntegrated: boolean;
    isProtocolIntegrated: boolean;
    specialReview: ReviewType;
    specialReviewApprovalType: ApprovalType;
    awardSpecailReviewId: number;
    irbProtocol: any;
    acProtocol: any;
}

export interface ReviewType {
    description: string;
    isActive: boolean;
    isIntegrated: boolean;
    sortId: number;
    specialReviewTypeCode: string;
    updateTimestamp: number;
    updateUser: string;
}

export interface ApprovalType {
    approvalTypeCode: string;
    description: string;
    isActive: boolean;
    updateTimestamp: number;
    updateUser: string;
}
