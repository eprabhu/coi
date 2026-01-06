import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, CanDeactivate } from '@angular/router';
import { getPathWithoutParams, getSpecificUrlPart } from '../../common/utilities/custom-utilities';
import { ProposalService } from '../services/proposal.service';
import { DataStoreService } from '../services/data-store.service';
import { EvaluationService } from './evaluation.service';

declare var $: any;

@Injectable()
export class RouteGuardService implements CanActivate, CanDeactivate<boolean> {

    proposalId = null;

    constructor(
        public _commonData: ProposalService,
        private _router: Router,
        private _dataStore: DataStoreService,
        private _evaluationService: EvaluationService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        this.proposalId = route.queryParamMap.get('proposalId');
        return this.isRouteEnabled(state.url);
    }

    isRouteEnabled(currentUrl: string) {
        switch (getSpecificUrlPart(getPathWithoutParams(currentUrl), 4)) {
            case 'evaluate': return this.isSectionActive('320');
            case 'score': return this.isSectionActive('345');
            default: return true;
        }
    }

    isSectionActive(moduleCode: string): boolean {
        const isActive = this._commonData.proposalSectionConfig[moduleCode].isActive;
        return isActive ? isActive : this._router.navigate(['/fibi/proposal/evaluation/404'],
            { queryParams: { proposalId: this.proposalId } });
    }

    canDeactivate() {
        const dataVisibilityObj = this._dataStore.getData(['dataVisibilityObj']).dataVisibilityObj;
        if (this._evaluationService.navigationUrl && dataVisibilityObj.dataChangeFlag) {
            $('#evaluation-save-modal').modal('show');
            return false;
        } else {
            return true;
        }
    }

}
