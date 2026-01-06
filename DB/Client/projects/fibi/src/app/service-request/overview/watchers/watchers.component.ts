import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { ServiceRequest, Watcher } from '../../service-request.interface';
import { CommonDataService } from '../../services/common-data.service';
import { OverviewService } from '../overview.service';

declare var $: any;

@Component({
    selector: 'app-watchers',
    templateUrl: './watchers.component.html',
    styleUrls: ['./watchers.component.css']
})
export class WatchersComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];

    watcherList: Watcher[];
    newWatcher: Watcher = new Watcher();
    serviceRequest: ServiceRequest = new ServiceRequest();

    personElasticSearchOptions: any = {};
    clearField: String;
    validationMap = new Map();
    deleteWatcher: any = {};
    isEditable = false;

    showAddMeAsWatcher = true;
    canModifyWatcher = false;
    isSaving = false;

    constructor(
        private _overviewService: OverviewService,
        private _elasticConfig: ElasticConfigService,
        public _commonService: CommonService,
        private _commonData: CommonDataService
    ) { }

    ngOnInit() {
        this.getPermission();
        this.getServiceRequestDetails();
        this.getServiceRequestData();
        this.personElasticSearchOptions = this._elasticConfig.getElasticForPerson();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    getPermission(): void {
        this.canModifyWatcher = this._commonData.checkDepartmentRight('MAINTAIN_WATCHER');
    }

    private getServiceRequestDetails(): void {
        this.$subscriptions.push(
            this._commonData.dataEvent.subscribe((data: any) => {
                if (data.includes('serviceRequest') || data.includes('serviceRequestWatchers')) {
                    this.getServiceRequestData();
                }
            })
        );
    }

    private getServiceRequestData(): void {
        const DATA: any = this._commonData.getData(['serviceRequest', 'serviceRequestWatchers']);
        this.serviceRequest = DATA.serviceRequest;
        this.watcherList = DATA.serviceRequestWatchers;
        this.checkLoggedUserIsWatcher();
        this.isEditable = this.canModifyWatcher && this.serviceRequest.statusCode !== 5;
    }

    private checkLoggedUserIsWatcher(): void {
        this.showAddMeAsWatcher = this.watcherList.find((ele: Watcher) =>
            ele.watcherPersonId === this.getCurrentPersonId()
        ) ? false : true;
    }

    private getCurrentPersonId() {
        return this._commonService.getCurrentUserDetail('personID');
    }

    selectPerson(event): void {
        if (event) {
            this.newWatcher.watcherName = event.full_name;
            this.newWatcher.watcherPersonId = event.prncpl_id;
            this.saveServiceRequestWatcher();
        }
    }

    addMeAsWatcher(): void {
        this.newWatcher.watcherName = this._commonService.getCurrentUserDetail('fullName');
        this.newWatcher.watcherPersonId = this._commonService.getCurrentUserDetail('personID');
        this.saveServiceRequestWatcher();
    }

    private saveServiceRequestWatcher(): void {
        if (!this.isSaving) {
            this.isSaving = true;
            if (this.validateWatcher()) {
                this.$subscriptions.push(
                    this._overviewService.saveServiceRequestWatcher({
                        serviceRequestWatcher: this.newWatcher,
                        serviceRequestId: this.serviceRequest.serviceRequestId
                    }).subscribe((data: any) => {
                        this.watcherList.push(data.serviceRequestWatcher);
                        this.checkLoggedUserIsWatcher();
                        this.updateStore();
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Watcher added successfully.');
                        this.resetWatcherSearch();
                    }, err => {
                        if (err && err.status === 405) {
                            $('#invalidActionModal').modal('show');
                        } else {
                            this._commonService.showToast(HTTP_ERROR_STATUS, 'Adding watcher failed. Please try again.');
                        }
                        this.resetWatcherSearch();
                    })
                );
            }
        }
    }

    private updateStore(): void {
        this._commonData.updateStoreData({
            serviceRequestWatchers: this.watcherList
        });
    }

    private resetWatcherSearch(): void {
        this.newWatcher = new Watcher();
        this.clearField = new String('true');
        this.isSaving = false;
    }

    deleteServiceRequestWatcher(): void {
        this.$subscriptions.push(
            this._overviewService.deleteServiceRequestWatcher(this.deleteWatcher.watcherId).subscribe(data => {
                this.watcherList.splice(this.deleteWatcher.index, 1);
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Watcher deleted successfully.');
                this.deleteWatcher = {};
                this.checkLoggedUserIsWatcher();
                this.updateStore();
            }, err => {
                if (err && err.status === 405) {
                    $('#invalidActionModal').modal('show');
                }else {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting watcher failed. Please try again.');
                }
            })
        );
    }

    private validateWatcher(): boolean {
        this.validationMap.clear();
        const duplicateWatcher = this.watcherList.find((watcher: any) => watcher.watcherPersonId === this.newWatcher.watcherPersonId);
        if (!duplicateWatcher) {
            return true;
        }
        this.validationMap.set('watcher', 'Watcher already exists.');
        return false;
    }

    watcherDelete(watcher: Watcher, index: number): void {
        this.deleteWatcher = {
            index: index,
            ...watcher
        };
    }

}
