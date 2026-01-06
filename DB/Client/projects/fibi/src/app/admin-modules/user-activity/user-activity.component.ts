import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { ElasticConfigService } from '../../common/services/elastic-config.service';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS } from '../../app-constants';
import { compareDatesWithoutTimeZone, parseDateWithoutTimestamp, getDateObjectFromTimeStamp } from '../../common/utilities/date-utilities';
import { fileDownloader, pageScroll } from '../../common/utilities/custom-utilities';
import { UserActivityService } from './user-activity.service';
import { Subscription } from 'rxjs';
import { setFocusToElement } from '../../common/utilities/custom-utilities';
import { concatUnitNumberAndUnitName} from '../../common/utilities/custom-utilities';

@Component({
    selector: 'app-user-activity',
    templateUrl: './user-activity.component.html',
    styleUrls: ['./user-activity.component.css']
})
export class UserActivityComponent implements OnInit {

    elasticSearchOptionsPerson: any = {};
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    warningMessage = new Map();
    userActivity: any = {
        startDate: new Date(),
        endDate: new Date(),
        itemsPerPage: 20,
        loginStatus: '',
        currentPage: 1,
        sortBy: '',
        reverse: 'DESC',
        isDownload: false,
        personId: null,
        unitNumber: null,
        unitList: []
    };
    selectedUnit: [];
    activityList: any = [];
    isDesc = true;
    column = '';
    $subscriptions: Subscription[] = [];
    isEndDateValid = false;
    fileName = 'User Activity Log';
    setFocusToElement = setFocusToElement;
    isSaving = false;
    helpInfo = false;
    homeUnitList = [];
    homeUnitOptions = 'EMPTY#EMPTY#true#true';
    concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;

    constructor(public _commonService: CommonService, private _elasticConfig: ElasticConfigService,
        private _UserActivityService: UserActivityService) { }

    ngOnInit() {
        this.dateValidation();
        this.getHomeUnitDetails();
        this.elasticSearchOptionsPerson = this._elasticConfig.getElasticForPerson();
        this.getActivityDetails();
    }
    /**
     * @param  {}
     * for person search
     * if there exist a person then personId id is passed
     * else null is passed
     */
    selectPerson(event) {
        this.userActivity.personId = event ? event.prncpl_id : null;
    }
    /**
     * @param  {}
     * enables when a user clicks on search button and validates the date
     * search happens only if date valid
     */
    validateSearch() {
        this.warningMessage.clear();
        this.dateValidation();
        if (this.isEndDateValid && !this.isSaving) {
            this.isSaving = true;
            this.getActivityDetails();
        }
    }

    /**
     * @param  {}
     * dateValidation()- works every time when user select a 'From' or 'To' date
     * if startdate > end date then a validation message will be displayed
     */
    dateValidation() {
        if (this.userActivity.startDate && this.userActivity.endDate &&
            compareDatesWithoutTimeZone(this.userActivity.startDate, this.userActivity.endDate) === 1) {
            this.isEndDateValid = false;
            this.warningMessage.set('dueDateWarningText', 'Please select the From Date before the To Date');
        } else {
            this.warningMessage.clear();
            this.isEndDateValid = true;
            this.userActivity.currentPage = '1';
            this.userActivity.isDownload = false;
        }
    }
    setDateFormatWithoutTimeStamp() {
        this.userActivity.startDate = parseDateWithoutTimestamp(this.userActivity.startDate);
        this.userActivity.endDate = parseDateWithoutTimestamp(this.userActivity.endDate);
    }
    /**
     * @param  {}
     *getActivityDetails()- fetches the user activity log for inputed values
      used for initial load , sorting , searching
     */
    getActivityDetails() {
        this.setDateFormatWithoutTimeStamp();
        this.$subscriptions.push(this._UserActivityService.getPersonLoginDetails(this.userActivity)
            .subscribe((data: any) => {
                this.activityList = data;
                this.convertDateObject(data);
                this.isSaving = false;
            }, err => {
                this.isSaving = false;
                this._commonService.showToast(HTTP_ERROR_STATUS, 'User Activity list fetching failed. Please try again.');
            }));
    }

    private convertDateObject(data: any) {
        this.userActivity.startDate = getDateObjectFromTimeStamp(data.startDate);
        this.userActivity.endDate = getDateObjectFromTimeStamp(data.endDate);
    }
    /**
     * @param  {}
     * sortClick()-sorts according to the order
     * order of sorting is decided by isDesc flag
     * isDesc flag = true => DESC
     * isDesc flag = false => ASC
     */
    sortClick(columnname, isDesc) {
        this.isDesc = !isDesc;
        this.userActivity.sortBy = columnname;
        this.column = columnname;
        this.userActivity.reverse = this.isDesc ? 'DESC' : 'ASC';
        this.userActivity.isDownload = false;
        this.getActivityDetails();
    }
    /**
     * @param
     * preparing object for export
     */
    setExportObject() {
        this.userActivity.sortBy = this.column;
        this.userActivity.reverse = this.isDesc ? 'DESC' : 'ASC';
        this.userActivity.documentHeading = this.fileName;
        this.userActivity.isDownload = true;
    }
    /**
     * printAsExcel()- to export the list as excel
     */
    printAsExcel() {
        if (!this.isSaving) {
            this.isSaving = true;
            this.setExportObject();
            this._UserActivityService.exportUserActivityDatas(this.userActivity)
                .subscribe(data => {
                    fileDownloader(data.body, this.fileName, 'xlsx');
                    this.isSaving = false;
                }, err => { this.isSaving = false; });
        }
    }
    actionsOnPageChange(event) {
        this.userActivity.currentPage = event;
        this.getActivityDetails();
        pageScroll('pageScrollToTop');
    }

    getHomeUnitDetails() {
        const requestObject = {
            'superUser': this._commonService.getCurrentUserDetail('superUser'),
            'unitAdmin': this._commonService.getCurrentUserDetail('unitAdmin'),
            'unitNumber': this._commonService.getCurrentUserDetail('unitNumber'),
            'personId': this._commonService.getCurrentUserDetail('personID')
        };
        this._UserActivityService.getHomeUnitDetails(requestObject).subscribe((data: any) => {
            this.homeUnitList = data ? this.mapUnits(data) : [];
        });
    }

    mapUnits(unitList: any = []): any {
        return unitList.map(unit => {
            return { code: unit[0], description: unit[1] };
        });
    }

    onLookupSelect(data: any): void {
        this.userActivity.unitList = data.length ? data.map(d => d.code) : [];
    }

}
