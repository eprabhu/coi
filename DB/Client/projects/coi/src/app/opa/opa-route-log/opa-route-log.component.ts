import { Component, OnDestroy, OnInit } from '@angular/core';
import { OpaService } from '../services/opa.service';
import { Subscription } from 'rxjs';
import { DataStoreService } from '../services/data-store.service';
import { OpaDisclosure, OPAWorkFlowResponse } from '../opa-interface';
import { HTTP_ERROR_STATUS, OPA_MODULE_CODE } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { DataStoreEvent } from '../../common/services/coi-common.interface';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';

@Component({
    selector: 'app-opa-route-log',
    templateUrl: './opa-route-log.component.html',
    styleUrls: ['./opa-route-log.component.scss']
})
export class OpaRouteLogComponent implements OnInit, OnDestroy {

    private $subscriptions: Subscription[] = [];

    isLoading = true;
    workFlowResult = null;
    opaDisclosure: OpaDisclosure = new OpaDisclosure();
    isByepassValidationNeeded = false;

    constructor(private _commonService: CommonService, public opaService: OpaService, private _opaDataStore: DataStoreService) {}

    ngOnInit(): void {
        this.getDataFromStore({ action: 'REFRESH', dependencies: []});
        this.listenDataChangeFromStore();
        window.scrollTo(0,0);
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private getDataFromStore(storeEvent: DataStoreEvent): void {
        const OPA_DETAILS = this._opaDataStore.getData();
        if (storeEvent?.action === 'REFRESH' || OPA_DETAILS?.opaDisclosure?.reviewStatusType?.reviewStatusCode !== this.opaDisclosure?.reviewStatusType?.reviewStatusCode) {
            this.fetchWorkFlowDetails();
        } else if (storeEvent?.dependencies?.includes('workFlowResult')) {
            this.workFlowResult = OPA_DETAILS?.workFlowResult;
            this.isByepassValidationNeeded =  this._opaDataStore.isRoutingReview && this.workFlowResult.isFinalApprovalPending;
        }
        this.opaDisclosure = OPA_DETAILS?.opaDisclosure;
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._opaDataStore.dataEvent.subscribe((storeEvent: DataStoreEvent) => {
                this.getDataFromStore(storeEvent);
            })
        );
    }

    private fetchWorkFlowDetails(): void {
        const OPA_DISCLOSURE: OpaDisclosure = this._opaDataStore.getData()?.opaDisclosure;
        this.$subscriptions.push(
            this.opaService.fetchWorkFlowDetails(OPA_MODULE_CODE, OPA_DISCLOSURE?.opaDisclosureId)
                .subscribe((workFlowResult: any) => {
                    this.isLoading = false;
                    this.workFlowResult = workFlowResult;
                    this.workFlowResult.opaDisclosure = OPA_DISCLOSURE;
                    this._opaDataStore.updateStore(['workFlowResult'], { workFlowResult: this.workFlowResult });
                }, (error: any) => {
                    this.isLoading = false;
                    this._commonService.showToast(HTTP_ERROR_STATUS, `Error in fetching route log.`);
                }));
    }

    workFlowResponse(data: OPAWorkFlowResponse): void {
        const OPA_DISCLOSURE: OpaDisclosure = this._opaDataStore.getData()?.opaDisclosure;
        const WOK_FLOW_RESPONSE = this.opaService.workFlowResponse(data, this.workFlowResult, OPA_DISCLOSURE);
        this.workFlowResult = WOK_FLOW_RESPONSE?.workFlowResult;
        this._opaDataStore.updateStore(['opaDisclosure', 'workFlowResult'], WOK_FLOW_RESPONSE);
    }

    openConcurrencyModal(event: any): void {
        this._commonService.concurrentUpdateAction = 'OPA disclosure';
    }

}
