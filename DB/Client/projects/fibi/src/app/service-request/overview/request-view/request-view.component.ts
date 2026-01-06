import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { ServiceRequest } from '../../service-request.interface';
import { CommonDataService } from '../../services/common-data.service';

@Component({
    selector: 'app-request-view',
    templateUrl: './request-view.component.html',
    styleUrls: ['./request-view.component.css']
})
export class RequestViewComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];

    serviceRequest: ServiceRequest = new ServiceRequest();

    constructor(
        public _commonData: CommonDataService
    ) { }

    ngOnInit() {
        this.getGeneralDetails();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    private getGeneralDetails(): void {
        const data: any = this._commonData.getData(['serviceRequest']);
        this.serviceRequest = data.serviceRequest;
    }

}
