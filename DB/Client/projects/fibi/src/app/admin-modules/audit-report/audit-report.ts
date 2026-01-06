export interface AuditReport {
    reportId: number;
    reportType: string;
    reportName: string;
    description: string;
    updateUser: string;
    updateTimestamp: any;
    isActive: boolean;
}
