

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate, Router, RouterStateSnapshot } from '@angular/router';
import { ProposalService } from '../services/proposal.service';
import { getPathWithoutParams, getSpecificUrlPart } from '../../common/utilities/custom-utilities';
import { BudgetDataService } from '../services/budget-data.service';
import { DataStoreService } from '../services/data-store.service';
import { BudgetService } from './budget.service';

declare var $: any;

@Injectable()
export class RouteGuardService implements CanActivate, CanDeactivate<boolean> {

    proposalId = null;

    constructor(
        public _commonData: ProposalService,
        private _router: Router,
        private _budgetDataService: BudgetDataService,
        private _budgetService: BudgetService,
        private _dataStore: DataStoreService
    ) { }

    canDeactivate() {
        if (this._budgetService.navigationUrl && this._budgetDataService.budgetDataChanged) {
            $('#budgetSaveModal').modal('show');
            return false;
        } else {
            return true;
        }
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        this.proposalId = route.queryParamMap.get('proposalId');
        this._commonData.$currentTab.next('BUDGET');
        return this.isRouteEnabled(state.url);
    }

    isRouteEnabled(currentUrl: string) {
        switch (getSpecificUrlPart(getPathWithoutParams(currentUrl), 4)) {
            case 'periods-total': return this.isSectionActive('308');
            case 'personnel': return this.isSectionActive('309');
            case 'detailed-budget': return this.isSectionActive('310');
            case 'simple-budget': return this.isSectionActive('311');
            case 'modular-budget': return this.isSectionActive('338');
            case 'category-total': return this.isSectionActive('339');
            case 'summary': return this.isSectionActive('307');
            default: return true;
        }
    }

    isSectionActive(moduleCode: string): boolean {
        const isActive = this._commonData.proposalSectionConfig[moduleCode].isActive;
        return isActive ? isActive : this._router.navigate(['/fibi/proposal/budget/404'],
            { queryParams: {proposalId: this.proposalId} });
    }
}
