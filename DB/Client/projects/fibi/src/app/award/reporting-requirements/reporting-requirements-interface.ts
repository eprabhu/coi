

export class ReportingRequirement {
    reportClassCode: string = null;
    reportCode: string = null;
    frequencyCode: string = null;
    frequencyBaseCode: string = null;
    occurrence = 0;
    baseDate: any = null;
    useBaseDate = false;
    dueDate: any = null;
    customEndDate: any = null;
    updateTimestamp: number = null;
}

export class DataChange {
    data: {} = {};
    flag = '';
    uniqueComponentId = '';
    constructor(data, flag, uniqueComponentId) {
        this.data = data;
        this.flag = flag;
        this.uniqueComponentId = uniqueComponentId;
    }
}

export class FilterRO {
    reportClassCode: string = null;
    status: string = null;
    startDate = null;
    endDate = null;
}

export class AwardReport {
    awardReportTermsId: number = null;
    awardId: number = null;
    awardNumber: string = null;
    sequenceNumber: number = null;
    reportClassCode: string = null;
    reportCode: null | string = null;
    frequencyCode: string = null;
    frequencyBaseCode: string = null;
    dueDate: string | Date = '';
    baseDate: string | Date = '';
    awardReportTermRecipient?: any[];
    awardReportTracking: AwardReportTracking[] = [];
    reportClass: ReportClass = new ReportClass();
    reportName: null | string = null;
    customEndDate = '';
    useBaseDate = false;
    occurrence = 0;
    startDate = '';
    updateTimestamp: number = null;
}

export class AwardReportTracking {
    awardReportTrackingId: number = null;
    awardReportTermsId: number = null;
    awardId: number = null;
    awardNumber: string = null;
    sequenceNumber: number = null;
    statusCode?: string = null;
    activityDate?: string | Date = null;
    comments?: null | string = null;
    preparerId?: null | string = null;
    createUser?: null | Date = null;
    createDate?: null | Date = null;
    dueDate: string | Date = null;
    preparerName?: null | string = null;
    progressReportId?: null | number = null;
    uniqueId: number = null;
    awardReportTrackingFile?: AwardReportTrackingFile = new AwardReportTrackingFile();
    awardProgressReport?: AwardProgressReport;
    createProgressReport = false;
    awardReportTrackingFiles?: AwardReportTrackingFile[];
}

export class AwardReportTrackingFile {
    awardReportTermsId: number = null;
    awardReportTrackingId: number = null;
    awardId: number = null;
    awardNumber = '';
    sequenceNumber: number = null;
    versionNumber: number = null;
    fileName = '';
    contentType = '';
    uniqueId: number = null;
}

export class AwardProgressReport {
    progressReportId: number;
    progressReportNumber: string;
    awardId?: null | number;
    awardNumber?: null | string;
    sequenceNumber?: null | number;
    progressReportStatusCode?: null | string;
    dueDate?: null | string;
    awardReportTrackingId?: null | number;
    reportClassCode?: null | string;
    createUser?: string;
    createTimeStamp?: Date;
    submitUser?: null | string;
    submissionDate?: null | string;
    progressReportStatus?: ProgressReportStatus;
    reportStartDate?: string;
    title?: null | string;
    createdPersonId?: null | number;
    createdPersonName?: null | string;
    submitUserFullName?: null | string;
    principalInvestigator?: null | string;
    updatedPersonName?: null | string;
    reportTypeCode?: null | string;
    uniqueId?: null | number;
    updateTimeStamp: number;
    reportEndDate: string;
}

export class ProgressReportStatus {
    progressReportStatusCode: string;
    description: string;
    isActive: boolean;
}

export class ReportClass {
    reportClassCode = '';
    description = '';
    attachmentOrReport = '';
    isActive = false;
    copyReport = false;
}
