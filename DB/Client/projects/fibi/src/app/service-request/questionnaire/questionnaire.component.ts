import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { AutoSaveService } from '../../common/services/auto-save.service';
import { CommonService } from '../../common/services/common.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ServiceRequest } from '../service-request.interface';
import { CommonDataService } from '../services/common-data.service';
import { ServiceRequestService } from '../services/service-request.service';

@Component({
    selector: 'app-questionnaire',
    template: `
    <div>
        <app-view-questionnaire-list [configuration] = "configuration"
            (QuestionnaireSaveEvent)= "getSaveEvent($event)"
            [externalSaveEvent] = '_autoSaveService.autoSaveTrigger$'
            (QuestionnaireEditEvent) = "markQuestionnaireAsEdited($event)"
            [isShowSave] = "false">
        </app-view-questionnaire-list>
    </div>`,
})
export class QuestionnaireComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];

    serviceRequest: ServiceRequest = new ServiceRequest();
    configuration: any = {
        moduleItemCode: 20,
        moduleSubitemCodes: [0],
        moduleItemKey: '',
        moduleSubItemKey: 0,
        actionUserId: this._commonService.getCurrentUserDetail('personID'),
        actionPersonName: this._commonService.getCurrentUserDetail('fullName'),
        enableViewMode: false,
        isChangeWarning: true,
        isEnableVersion: true,
    };

    constructor(
        private _commonService: CommonService,
        private _commonData: CommonDataService,
        private _serviceRequestService: ServiceRequestService,
        public _autoSaveService: AutoSaveService
    ) { }

    ngOnInit() {
        this.getServiceRequestDetails();
        this.getGeneralDetails();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    private getServiceRequestDetails(): void {
        this.$subscriptions.push(
            this._commonData.dataEvent.subscribe((data: any) => {
                if (data.includes('serviceRequest')) {
                    this.getGeneralDetails();
                }
            })
        );
    }

    private getGeneralDetails(): void {
        const data: any = this._commonData.getData(['serviceRequest']);
        this.serviceRequest = data.serviceRequest;
        this.configuration.moduleItemKey = this.serviceRequest.serviceRequestId;
        this.configuration.moduleSubitemCodes = this.setServiceRequestType();
        this.configuration.enableViewMode = !this._commonData.canUserEdit();
        this.configuration = Object.assign({}, this.configuration);
    }

    private setServiceRequestType() {
        return [this.serviceRequest.serviceRequestType.typeCode];
    }

    getSaveEvent(event) {
        if (event) {
            this._serviceRequestService.isServiceRequestDataChange = false;
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Service Request Questionnaire saved successfully.');
        } else {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Save Questionnaire failed. Please try again.');
        }
    }

    markQuestionnaireAsEdited(changeStatus: boolean): void {
        this._serviceRequestService.isServiceRequestDataChange = changeStatus;
    }

}
