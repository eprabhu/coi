/**
 * Author: Ayush Mahadev R
 * Implemented to fetch and check all the departmentLevelRights for sub-route guards.
 */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable, of as observableOf, Subscriber } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { catchError } from 'rxjs/operators';
import { ProposalService } from './proposal.service';
import { DataStoreService } from './data-store.service';
import { WebSocketService } from '../../common/services/web-socket.service';

@Injectable()
export class ProposalDataResolveGuardService implements CanActivate {

    private readonly _moduleCode = 'DP03';

    constructor(private _proposalService: ProposalService,
        private _router: Router,
        public _commonService: CommonService,
        private _dataStoreService: DataStoreService,
        public webSocket: WebSocketService) {
    }

    canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            forkJoin(this.getHttpRequests(route)).subscribe((res: any[]) => {
                if (res.length > 1) {
                    this.updateSectionConfigData(res[1]);
                    this.hideManualLoader();
                }
                if (res[0]) {
                    this.updateProposalDataStore(res[0]);
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    private async updateProposalDataStore(data: any) {
        this._proposalService.proposalDetails = data;
        this._proposalService.supportReq.moduleItemKey = this._proposalService.preReviewReq.moduleItemKey = data.proposal.proposalId;
        this._dataStoreService.setProposal({ ...data, dataVisibilityObj: this._proposalService.dataVisibilityObj });
    }

    updateSectionConfigData(data: any) {
        this._proposalService.proposalSectionConfig = this._commonService.getSectionCodeAsKeys(data);
    }

    getHttpRequests(route: ActivatedRouteSnapshot): Observable<any>[] {
        const HTTP_REQUESTS = [];
        if (route.queryParamMap.get('proposalId') == null) {
            const personID = this._commonService.getCurrentUserDetail('personID');
            const unitNumber = this._commonService.getCurrentUserDetail('unitNumber');
            if (route.queryParamMap.get('grantId') == null) {
                HTTP_REQUESTS.push(this.createProposal(personID, unitNumber));
            } else {
                HTTP_REQUESTS.push(this.createProposal(personID, unitNumber, route.queryParamMap.get('grantId')));
            }
        } else {
            HTTP_REQUESTS.push(this.loadProposalById(route.queryParamMap.get('proposalId')));
        }
        if (!this.isSectionConfigAlreadyFetched()) {
            this._commonService.isManualLoaderOn = true;
            HTTP_REQUESTS.push(this.getProposalSectionConfig());
        }
        return HTTP_REQUESTS;
    }


    getProposalSectionConfig() {
        return this._commonService.getDashboardActiveModules(this._moduleCode);
    }

    createProposal(personId, homeUnitNumber, grantCallId = null) {
        return this._proposalService.createProposal({ personId, grantCallId, homeUnitNumber })
            .pipe((catchError(error => this.redirectOnError(error))));
    }

    isSectionConfigAlreadyFetched() {
        return Object.keys(this._proposalService.proposalSectionConfig).length;
    }

    loadProposalById(proposalId: any) {
        return this._proposalService.loadProposalById({ proposalId }).pipe(catchError(error => this.redirectOnError(error)));
    }

    redirectOnError(error) {
        if (error.status === 403) {
            // name is given based on the values assinged in forbidden component please refer forbidden.component.ts
            this._commonService.forbiddenModule = '3';
            this._router.navigate(['/fibi/error/403']);
            return observableOf(null);
        } else {
            this._router.navigate(['/fibi/dashboard/proposalList']);
            return observableOf(null);
        }
    }

    hideManualLoader() {
        this._commonService.isShowLoader.next(false);
        this._commonService.isManualLoaderOn = false;
    }
}
