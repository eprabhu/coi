import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, CanDeactivate } from '@angular/router';
import { getPathWithoutParams, getSpecificUrlPart } from '../../common/utilities/custom-utilities';
import { ProposalService } from '../services/proposal.service';
import { DataStoreService } from '../services/data-store.service';

declare var $: any;

@Injectable()
export class RouteGuardService implements CanActivate, CanDeactivate<boolean> {

    proposalId = null;
    navigationUrl: string;

    constructor(
        public _commonData: ProposalService,
        private _router: Router,
        private _dataStore: DataStoreService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        this.proposalId = route.queryParamMap.get('proposalId');
        return this.isRouteEnabled(state.url);
    }

    isRouteEnabled(currentUrl: string) {
        switch (getSpecificUrlPart(getPathWithoutParams(currentUrl), 4)) {
            case 'summary': return this.isSectionActive('318');
            case 'evaluation': return this.isSectionActive('335');
            case 'external-review': return this.isSectionActive('DP316');
            default: return true;
        }
    }

    isSectionActive(moduleCode: string): boolean {
        const isActive = this._commonData.proposalSectionConfig[moduleCode].isActive;
        return isActive ? isActive : this._router.navigate(['/fibi/proposal/review/404'], { queryParams: { proposalId: this.proposalId}});
    }

    canDeactivate() {
        const dataVisibilityObj = this._dataStore.getData(['dataVisibilityObj']).dataVisibilityObj;
        if (this.navigationUrl && dataVisibilityObj.dataChangeFlag) {
            $('#proposal-review-save-modal').modal('show');
            return false;
        } else {
            return true;
        }
    }
}
