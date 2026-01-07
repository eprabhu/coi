import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { HTTP_ERROR_STATUS, COI_MODULE_CODE } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { DataStoreEvent } from '../../entity-management-module/shared/entity-interface';
import { DataStoreService } from '../services/data-store.service';
import { CoiDisclosure, COIWorkFlowResponse } from '../coi-interface';
import { CoiService } from '../services/coi.service';
import { COMMON_DISCL_LOCALIZE } from '../../app-locales';

@Component({
    selector: 'app-coi-route-log',
    templateUrl: './coi-route-log.component.html',
    styleUrls: ['./coi-route-log.component.scss']
})
export class CoiRouteLogComponent implements OnInit {

    private $subscriptions: Subscription[] = [];

    isLoading = true;
    workFlowResult = null;
    coiDisclosure: CoiDisclosure = new CoiDisclosure();
    isBypassValidationNeeded = false;

    constructor(private _commonService: CommonService, public coiService: CoiService, private _coiDataStore: DataStoreService) { }

    ngOnInit(): void {
        this.getDataFromStore({ action: 'REFRESH', dependencies: [] });
        this.listenDataChangeFromStore();
        window.scrollTo(0, 0);
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private getDataFromStore(storeEvent: DataStoreEvent): void {
        const COI_DETAILS = this._coiDataStore.getData();
        if (storeEvent?.action === 'REFRESH' || COI_DETAILS?.coiDisclosure?.coiReviewStatusType?.reviewStatusCode !== this.coiDisclosure?.coiReviewStatusType?.reviewStatusCode) {
            this.fetchWorkFlowDetails();
        } else if (storeEvent?.dependencies?.includes('workFlowResult')) {
            this.workFlowResult = COI_DETAILS?.workFlowResult;
        }
        this.coiDisclosure = COI_DETAILS?.coiDisclosure;
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._coiDataStore.dataEvent.subscribe((storeEvent: DataStoreEvent) => {
                this.getDataFromStore(storeEvent);
            })
        );
    }

    private fetchWorkFlowDetails(): void {
        const COI_DISCLOSURE: CoiDisclosure = this._coiDataStore.getData()?.coiDisclosure;
        this.$subscriptions.push(
            this.coiService.fetchWorkFlowDetails(COI_MODULE_CODE, COI_DISCLOSURE?.disclosureId)
                .subscribe((workFlowResult: any) => {
                    this.isLoading = false;
                    this.workFlowResult = workFlowResult;
                    this.workFlowResult.coiDisclosure = COI_DISCLOSURE;
                    this._coiDataStore.updateStore(['workFlowResult'], { workFlowResult: this.workFlowResult });
                }, (error: any) => {
                    this.isLoading = false;
                    this._commonService.showToast(HTTP_ERROR_STATUS, `Error in fetching route log.`);
                }));
    }

    workFlowResponse(data: COIWorkFlowResponse): void {
        const COI_DISCLOSURE: CoiDisclosure = this._coiDataStore.getData()?.coiDisclosure;
        const WOK_FLOW_RESPONSE = this.coiService.workFlowResponse(data, this.workFlowResult, COI_DISCLOSURE);
        this.workFlowResult = WOK_FLOW_RESPONSE?.workFlowResult;
        this._coiDataStore.updateStore(['coiDisclosure', 'workFlowResult'], WOK_FLOW_RESPONSE);
    }

    openConcurrencyModal(event: any): void {
        this._commonService.concurrentUpdateAction = `${COMMON_DISCL_LOCALIZE.TERM_COI} disclosure`;
    }

}
