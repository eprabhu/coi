import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ServiceRequestRoot } from '../service-request.interface';
import { CommonDataService } from '../services/common-data.service';
declare var $: any;

@Component({
    selector: 'app-route-log',
    template: `<workflow-engine *ngIf="result?.serviceRequest?.serviceRequestId" [workFlowResult]="result"
    (workFlowResponse)='workFlowResponse($event)' (errorEvent)='errorEvent()' [workFlowDetailKey]="'serviceRequest'"></workflow-engine>`,
})
export class RouteLogComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];

    result: ServiceRequestRoot = new ServiceRequestRoot();

    constructor(
        private _commonData: CommonDataService
    ) { }

    ngOnInit() {
        this.getGeneralDetails();
        this.getServiceRequestDetails();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    private getServiceRequestDetails(): void {
        this.$subscriptions.push(
            this._commonData.dataEvent.subscribe((data: any) => {
                if (data.includes('serviceRequest') || data.includes('workflow') || data.includes('availableRights')) {
                    this.getGeneralDetails();
                }
            })
        );
    }

    private getGeneralDetails(): void {
        const data: any = this._commonData.getData(['availableRights', 'serviceRequest', 'workflow', 'workflowList']);
        this.result = data;
    }

    workFlowResponse(data: ServiceRequestRoot): void {
        this.updateServiceRequestStatus(data);
        this.updateAdminGroup(data);
        this.updateAssignee(data);
        this.updateStore(data);
    }

    private updateAdminGroup(data: ServiceRequestRoot): void {
        this.result.serviceRequest.adminGroup = data.serviceRequest.adminGroup;
        this.result.serviceRequest.adminGroupId = data.serviceRequest.adminGroupId;
    }

    private updateAssignee(data: ServiceRequestRoot): void {
        this.result.serviceRequest.assigneePersonId = data.serviceRequest.assigneePersonId;
        this.result.serviceRequest.assigneePersonName = data.serviceRequest.assigneePersonName;
    }

    private updateStore(data: ServiceRequestRoot) {
        this._commonData.updateStoreData({
            serviceRequest: this.result.serviceRequest,
            workflow: data.workflow,
            workflowList: data.workflowList,
            canApproveRouting: data.canApproveRouting,
            finalApprover: data.finalApprover,
            isApproved: data.isApproved,
            serviceRequestStatusHistories: data.serviceRequestStatusHistories,
            isFinalApprover: data.isFinalApprover
        });
    }

    private updateServiceRequestStatus(data: ServiceRequestRoot): void {
        this.result.serviceRequest.statusCode = data.serviceRequest.statusCode;
        this.result.serviceRequest.serviceRequestStatus = data.serviceRequest.serviceRequestStatus;
    }

    errorEvent() {
        $('#invalidActionModal').modal('show');
    }

}
