import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ElasticMonitoringService } from './elastic-monitoring.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { setFocusToElement } from '../../common/utilities/custom-utilities';
import { compareDates, getCurrentTimeStamp, parseDateWithoutTimestamp } from '../../common/utilities/date-utilities';

declare var $: any;

@Component({
    selector: 'app-elastic-monitoring',
    templateUrl: './elastic-monitoring.component.html',
    styleUrls: ['./elastic-monitoring.component.css']

})

export class ElasticMonitoringComponent implements OnInit, OnDestroy {

    isShowLoader = false;
    $subscriptions: Subscription[] = [];
    logstashType: null;
    logstashStatus: any;
    listOfSyncTypes = [
        { type: 'Award Elastic', typeCode: 'awardfibi' },
        { type: 'Proposal Elastic', typeCode: 'fibiproposal' },
        { type: 'Grant Call Elastic', typeCode: 'grantcall' },
        { type: 'Person Elastic', typeCode: 'fibiperson' },
        { type: 'Rolodex Elastic', typeCode: 'fibirolodex' },
        { type: 'Agreement Elastic', typeCode: 'agreementfibi' },
        { type: 'Institute Proposal Elastic', typeCode: 'instituteproposal' },
        { type: 'External Review Elastic', typeCode: 'externalreview' },
        { type: 'Reviewer Elastic', typeCode: 'fibireviewer' }
      ];
    isValidation = false;
    setFocusToElement = setFocusToElement;
    errorFromDate: any;
    errorToDate: any;
    elasticSyncErrorDetails = [];
    isDateValidation = false;
    map = new Map();
    indexType: any;

    constructor(private _elasticMonitoringService: ElasticMonitoringService, public commonService: CommonService) {
    }

    ngOnInit() {
        const currentDate =  JSON.parse(JSON.stringify(new Date()));
        this.map.clear();
        if (this.commonService.isElasticSyncSQSEnable) {
            this.getQueueMatrix();
        }
        this.logstashType = null;
        this.errorFromDate = parseDateWithoutTimestamp(currentDate);
        this.errorToDate = parseDateWithoutTimestamp(currentDate);
        this.getElasticSyncErrors();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    getQueueMatrix() {
        this.isShowLoader = true;
        this.$subscriptions.push(this._elasticMonitoringService.getQueueMatrixDetails().subscribe((data: any) => {
            if (data) {
                this._elasticMonitoringService.$elasticMonitoringDetails.next(data);
                this.isShowLoader = false;
            }
        }, err => {
            this.commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong.');
            this.isShowLoader = false;
        }));
    }

    getLogstashStatus() {
        if (!this.validateType(this.logstashType)) {
            this.$subscriptions.push(this._elasticMonitoringService.getLogstashStatus().subscribe(data => {
                if (data === 'Pipeline is synced successfully.') {
                    this.bulkLogstashSync();
                } else {
                    $('#syncConfirmationModal').modal('hide');
                    this.commonService.showToast(HTTP_ERROR_STATUS, 'Currently pipeline is running.');
                }
            }, err => {
                this.commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong.');
                $('#syncConfirmationModal').modal('hide');

            }));
        }
    }

    bulkLogstashSync() {
        if (this.logstashType !== null) {
            this.$subscriptions.push(this._elasticMonitoringService.getBulkLogstashSync(this.logstashType).subscribe(data => {
                if (data === 'Success') {
                    this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Bulk logstash sync successfully');
                    $('#syncConfirmationModal').modal('hide');
                }
            }, err => {
                this.commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong.');
                $('#syncConfirmationModal').modal('hide');
            }));
        }

    }

    validateType(type) {
        if (type !== null) {
            this.indexType = this.listOfSyncTypes.find(ele => ele.typeCode === type).type;
        }
        return this.isValidation = type === null ? true : false;
    }

    getElasticSyncErrors() {
        if (this.dateValidation()) {
            const REQ_BODY = {
                fromDate: this.errorFromDate !== '' ? parseDateWithoutTimestamp(this.errorFromDate) : null,
                toDate: this.errorToDate !== '' ? parseDateWithoutTimestamp(this.errorToDate) : null
            };
            this.$subscriptions.push(this._elasticMonitoringService.getElasticErrorDetails(REQ_BODY).subscribe((data: any) => {
                this.elasticSyncErrorDetails = data;
            }));
        }
    }

    dateValidation() {
        this.map.clear();
        if (this.errorFromDate !== '' && this.errorToDate === '') {
            this.map.set('toDate', 'Please select to date also.');
        } else if (this.errorFromDate === '' && this.errorToDate !== '') {
            this.map.set('fromDate', 'Please select from date also.');
        } else if (compareDates(this.errorFromDate , this.errorToDate) === 1) {
            this.map.set('toCompareDates', 'Please select a to date after from date.');
        }
        return this.map.size < 1 ? true : false;
    }

    convertDataJson(req_body, type): string {
        const DATA = JSON.parse(req_body);
        switch (type) {
            case 'moduleKey': return DATA.moduleItemKey;
            case 'index': return DATA.indexName;
            default : return null;
        }
    }
}
