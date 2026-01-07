/**
 * Author: Ayush Mahadev R
 * Implemented to fetch and check all the departmentLevelRights for sub-route guards.
 */
import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {forkJoin, Observable, of as observableOf, Subscriber} from 'rxjs';
import {CommonService} from '../../common/services/common.service';
import {catchError} from 'rxjs/operators';
import {InstituteProposalService} from './institute-proposal.service';

@Injectable()
export class IpDataResolveGuardService implements CanActivate {

    private readonly _moduleCode = 'IP02';

    constructor(private _instituteService: InstituteProposalService, private _router: Router, public _commonService: CommonService) {
    }

    canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean> {
        return new Observable<boolean>((observer: Subscriber<boolean>) => {
            forkJoin(this.getHttpRequests(route.queryParamMap.get('instituteProposalId'))).subscribe((res: any[]) => {
                if (res.length > 1) {
                    this.updateSectionConfigData(res[1]);
                    this.hideManualLoader();
                }
                if (res[0]) {
                    this._instituteService.setInstituteProposalData(res[0]);
                    observer.next(true);
                    observer.complete();
                } else {
                    observer.next(false);
                    observer.complete();
                }
            });
        });
    }

    private updateSectionConfigData(data: any) {
        this._instituteService.ipSectionConfig = this._commonService.getSectionCodeAsKeys(data);
    }

    private getHttpRequests(proposalId: any) {
        const HTTP_REQUESTS = [];
        HTTP_REQUESTS.push(this.loadProposalById(proposalId));
        if (!this.isSectionConfigAlreadyFetched()) {
            this.showManualLoader();
            HTTP_REQUESTS.push(this.getInstituteProposalSectionConfig());
        }
        return HTTP_REQUESTS;
    }

    private showManualLoader() {
        this._commonService.isManualLoaderOn = true;
    }

    private hideManualLoader() {
        this._commonService.isShowLoader.next(false);
        this._commonService.isManualLoaderOn = false;
    }

    private getInstituteProposalSectionConfig() {
        return this._commonService.getDashboardActiveModules(this._moduleCode);
    }

    private isSectionConfigAlreadyFetched() {
        return Object.keys(this._instituteService.ipSectionConfig).length;
    }

    private loadProposalById(proposalId: any) {
        return this._instituteService.loadProposalById({proposalId}).pipe(catchError(error => this.redirectOnError(error)));
    }

    private redirectOnError(error) {
        if (error.status === 403) {
            // name is given based on the values assigned in forbidden component please refer forbidden.component.ts
            this._commonService.forbiddenModule = '2';
            this._router.navigate(['/fibi/error/403']);
            return observableOf(null);

        } else {
            this._router.navigate(['/fibi/dashboard/instituteProposalList']);
            return observableOf(null);
        }
    }
}
