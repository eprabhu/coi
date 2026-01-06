import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { getCurrentTimeStamp, getDuration } from '../../../common/utilities/date-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { ServiceRequest, ServiceRequestStatusHistory } from '../../service-request.interface';
import { CommonDataService } from '../../services/common-data.service';

@Component({
    selector: 'app-people-duration',
    templateUrl: './people-duration.component.html',
    styleUrls: ['./people-duration.component.css']
})
export class PeopleDurationComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];

    serviceRequest: ServiceRequest = new ServiceRequest();
    serviceRequestStatusHistories: ServiceRequestStatusHistory[];
    temporaryStatusHistories: ServiceRequestStatusHistory[];

    isShowAllStatusHistory = false;

    constructor(
        private _commonData: CommonDataService
    ) { }

    ngOnInit() {
        this.getServiceRequestDetails();
        this.getServiceRequestData();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    private getServiceRequestDetails(): void {
        this.$subscriptions.push(
            this._commonData.dataEvent.subscribe((data: any) => {
                if (data.includes('serviceRequest') || data.includes('serviceRequestStatusHistories')) {
                    this.getServiceRequestData();
                }
            })
        );
    }

    private getServiceRequestData(): void {
        const DATA: any = this._commonData.getData(['serviceRequest', 'serviceRequestStatusHistories']);
        this.serviceRequest = DATA.serviceRequest;
        this.temporaryStatusHistories = DATA.serviceRequestStatusHistories.reverse();
        this.setStatusHistories();
    }

    setStatusHistories(condition?: boolean): void {
        if (condition !== null) {
            this.isShowAllStatusHistory = condition;
        }
        this.serviceRequestStatusHistories = this.isShowAllStatusHistory ? JSON.parse(JSON.stringify(this.temporaryStatusHistories))
            : this.temporaryStatusHistories.slice(0, 3);
    }

    getTimeInterval(startDate, endDate) {
        let timeString = '';
        const END_DATE = endDate ? endDate : getCurrentTimeStamp();
        if (startDate <= END_DATE) {
            const seconds = Math.floor((END_DATE - (startDate)) / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const DATE_OBJ = getDuration(startDate, END_DATE);
            const days = Math.floor(hours / 24);
            if (days > 0) {
                timeString = this.getTimeIntervalInDays(timeString, DATE_OBJ);
            }
            if (days === 0) {
                timeString = this.getTimeIntervalInHours(timeString, hours, minutes, days, seconds);
            }
        }
        return timeString;
    }

    private getTimeIntervalInDays(timeString, DATE_OBJ) {
        timeString = timeString.concat(DATE_OBJ.durInYears !== 0 ? DATE_OBJ.durInYears + ' year(s) ' : '');
        timeString = timeString.concat(DATE_OBJ.durInMonths !== 0 ? DATE_OBJ.durInMonths + ' month(s) ' : '');
        timeString = timeString.concat(DATE_OBJ.durInDays !== 0 ? DATE_OBJ.durInDays + ' day(s) ' : '');
        return timeString;
    }

    private getTimeIntervalInHours(timeString, hours, minutes, days, seconds) {
        hours = hours - (days * 24);
        minutes = minutes - (days * 24 * 60) - (hours * 60);
        seconds = seconds - (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60);
        timeString = timeString.concat(hours !== 0 ? hours + ' hr(s) ' : '');
        timeString = timeString.concat(hours === 0 && minutes !== 0 ? minutes + ' min(s) ' : '');
        timeString = timeString.concat(hours === 0 && minutes === 0 && seconds !== 0 ? seconds + ' sec(s) ' : '');
        return timeString;
    }

}
