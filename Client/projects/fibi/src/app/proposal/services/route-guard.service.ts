import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate, Router, RouterStateSnapshot } from '@angular/router';
import { Subscription } from 'rxjs';
import { BudgetDataService } from './budget-data.service';
import { ProposalService } from '../services/proposal.service';
import { getPathWithoutParams, getSpecificUrlPart } from '../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { DataStoreService } from './data-store.service';

declare var $: any;

@Injectable()
export class RouteGuardService implements CanActivate, CanDeactivate<boolean>, OnDestroy {

    proposalId = null;
    $subscriptions: Subscription[] = [];
    isShowDateValidation = false;
    dataVisibilityObj: any = {};

    constructor(
        public _commonData: ProposalService,
        private _router: Router,
        private _budgetDataService: BudgetDataService,
        private _dataStore: DataStoreService,
    ) {
        this.setDateValidationMessage();
        this.getDataFromStore();
        this.listenDataChangeFromStore();
    }

    private getDataFromStore() {
        this.dataVisibilityObj = this._dataStore.getData(['dataVisibilityObj']).dataVisibilityObj;
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe((dependencies: string[]) => {
                if (dependencies.includes('dataVisibilityObj')) {
                    this.getDataFromStore();
                }
            })
        );
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        this.proposalId = route.queryParamMap.get('proposalId');
        return this.isRouteEnabled(state.url);
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    isRouteEnabled(currentUrl: string) {
        switch (getSpecificUrlPart(getPathWithoutParams(currentUrl), 3)) {
            case 'current-pending': return this.isSectionActive('DP308');
            case 'budget': return this.isSectionActive('DP303');
            case 'permissions': return this.isSectionActive('DP307');
            case 'medusa': return this.isSectionActive('DP309');
            case 'review': return this.isSectionActive('DP310');
            case 'support': return this.isSectionActive('DP311');
            case 'certification': return this.isSectionActive('DP315');
            case 'other-information': return this.isSectionActive('DP302');
            case 'comments': return this.isSectionActive('DP306');
            case 'attachment': return this.isSectionActive('DP305');
            case 'questionnaire': return this.isSectionActive('DP304');
            case 'evaluation': return this.isSectionActive('DP312');
            case 'route-log': return this.isSectionActive('DP313');
            case 'overview': return this.isSectionActive('DP301');
            default: return true;
        }
    }

    isSectionActive(moduleCode: string): boolean {
        const isActive = this._commonData.proposalSectionConfig[moduleCode].isActive;
        return isActive ? isActive : this._router.navigate(['/fibi/proposal'],
            { queryParams: { proposalId: this.proposalId } });
    }

    canDeactivate(): boolean {
        if (this.dataVisibilityObj.dataChangeFlag || this._budgetDataService.budgetDataChanged
            || this._budgetDataService.isBudgetOverviewChanged) {
            this.dataVisibilityObj.isSaveOnTabSwitch = true;
            $('#saveAndExitModal').modal('show');
            return false;
        }
        if (this.dataVisibilityObj.isBudgetHeaderFound) {
            return this._budgetDataService.isBudgetDatesFilled && !this.isShowDateValidation;
        }
        return true;
    }

    setDateValidationMessage() {
        this.$subscriptions.push(this._commonData.$isShowDateWarning.subscribe((data: any) => {
            this.isShowDateValidation = data;
        }));
    }
}
