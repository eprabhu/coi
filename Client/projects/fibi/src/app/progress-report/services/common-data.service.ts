import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { compareDates, getDateObjectFromTimeStamp } from '../../common/utilities/date-utilities';

@Injectable()
export class CommonDataService {

    public isDataChange = false;
    public progressReportSectionConfig: any = {};
    helpText: any = {};
    private $progressReportData = new BehaviorSubject<object>(null);
    private $save = new Subject<boolean>();
    private $isEditMode = new BehaviorSubject<boolean>(true);
    progressReportTitle = '';

    constructor() {
    }

    setProgressReportData(progressReportData: any) {
        this.$progressReportData.next(progressReportData);
        this.setProgressReportEditMode(progressReportData.awardProgressReport.progressReportStatus.progressReportStatusCode);
    }

    getProgressReportData(): Observable<any> {
        return this.$progressReportData.asObservable();
    }

    getEditMode(): Observable<boolean> {
        return this.$isEditMode.asObservable();
    }

    setEditMode(flag: boolean): void {
        this.$isEditMode.next(flag);
    }

    /**
     * statuses 1 => pending
     *          2 => revision requested
     *          3 => Approval in progress
     *          4 => Approved
     *          5 => Hold for funding agency review
     *          6 => completed
     * @param progressReportStatusCode
     */
    setProgressReportEditMode(progressReportStatusCode: string) {
        const isEditMode = ['1', '2'].includes(progressReportStatusCode);
        this.setEditMode(Boolean(isEditMode));
    }

    /**
     * @param validationMap : mapping function to identify which all fields are not filled.
     * @param dataToValidate
     * To validate all mandatory fields in Overview Tab is field.
     * Why writtern is service? -  validation check has to happen when Save button clicked (in progress-report-overview component)
     *  and When clicked on Submit Report (in progress-report component)
     * Logic: Summary fields(sectionType = S) should be mandatory for reportClassCode 1( not final report)
     * and reportClassCode 2 (final report).
     * Future Plans (sectionType = F) should be mandatory for reportClassCode 2 ( final report)
     *
     */
    isOverviewTabFieldsValid(validationMap, dataToValidate): boolean {
        const {overviewFields, reportClassCode, reportingPeriod, dueDate} = dataToValidate;
        validationMap.clear();
        overviewFields.forEach(data => {
            if (data.progressReportAchievementType.sectionType === 'S' && (reportClassCode === '1' || reportClassCode === '2')) {
                if (!data.description) { validationMap.set(data.achievementTypeCode, 'Provide information'); }
            }
            if (data.progressReportAchievementType.sectionType === 'F' && reportClassCode === '2') {
                if (!data.description) { validationMap.set(data.achievementTypeCode, 'Provide information'); }
            }
        });
        if (!reportingPeriod.reportStartDate) {
            validationMap.set('reportStartDate', '* Please provide start date');
        }
        if (!reportingPeriod.reportEndDate) {
            validationMap.set('reportEndDate', '* Please provide end date');
        }
        if (reportingPeriod.reportStartDate && dueDate) {
            if (compareDates(reportingPeriod.reportStartDate, getDateObjectFromTimeStamp(dueDate)) === 1) {
                validationMap.set('reportStartDate', '* Start date should be before due date');
            }
        }
        if (reportingPeriod.reportStartDate && reportingPeriod.reportEndDate) {
            if (compareDates(reportingPeriod.reportStartDate, reportingPeriod.reportEndDate) === 1) {
                validationMap.set('reportEndDate', '* End date should be after start date');
            }
        }
        if (!dataToValidate.title || dataToValidate.title.trim(' ').length === 0) {
            validationMap.set('title', '* Please provide a title.');
        }
        return validationMap.size > 0 ? false : true;
    }
}
