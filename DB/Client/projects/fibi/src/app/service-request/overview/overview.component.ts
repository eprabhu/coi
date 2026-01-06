import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutoSaveService } from '../../common/services/auto-save.service';
import { easeInOUt } from '../../common/utilities/animations';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ServiceRequest } from '../service-request.interface';
import { CommonDataService } from '../services/common-data.service';
import { ServiceRequestService } from '../services/service-request.service';

@Component({
    selector: 'app-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.css'],
    animations: [easeInOUt]
})
export class OverviewComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];

    serviceRequest: ServiceRequest = new ServiceRequest();
    isEdit = false;

    constructor(
        private _commonData: CommonDataService,
        public _serviceRequestService: ServiceRequestService
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
        this.isEdit = this.serviceRequest.serviceRequestId ?  this._commonData.canUserEdit() : true;
    }

}
