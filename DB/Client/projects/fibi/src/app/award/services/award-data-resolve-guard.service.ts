/**
 * Author: Ayush Mahadev R
 */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { OverviewService } from '../overview/overview.service';
import { CommonDataService } from './common-data.service';
import { forkJoin, Observable, Subscriber } from 'rxjs';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class AwardDataResolveGuardService implements CanActivate {

    private readonly _moduleCode = 'AW01';

    constructor(private _overviewService: OverviewService,
                public _commonData: CommonDataService,
                public _commonService: CommonService) {
    }

    canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean> {
        return new Observable<boolean>((observer: Subscriber<boolean>) => {
            const awardId = route.queryParamMap.get('awardId');
            if (!awardId && this.isSectionConfigAlreadyFetched()) {
                return this.routeSuccessful(observer);
            }
            forkJoin(this.generateHttpRequest(awardId)).subscribe((res: any[]) => {
                if (awardId) {
                    if (res.length > 1) {
                        this.updateSectionConfig(res[1]);
                        this.hideManualLoader();
                    }
                    if (res[0] && res[0].availableRights) {
                        this.updateResolvedData(res[0]);
                        return this.routeSuccessful(observer);
                    }
                    return this.routeFailed(observer);
                }
                return this.updateSectionDataForAwardCreation(res[0], observer);
            });
        });
    }

    generateHttpRequest(awardId: string): Observable<any>[] {
        const requests = [];
        if (awardId) {
            requests.push(this.getAwardGeneralData(awardId));
        }
        if (!this.isSectionConfigAlreadyFetched()) {
            this.showManualLoader();
            requests.push(this.getAwardSectionConfig());
        }
        return requests;
    }

    getAwardSectionConfig() {
        return this._commonService.getDashboardActiveModules(this._moduleCode);
    }

    isSectionConfigAlreadyFetched() {
        return Object.keys(this._commonData.awardSectionConfig).length;
    }

    getAwardGeneralData(awardId: string) {
        return this._overviewService.getAwardGeneralData({awardId});
    }

    updateSectionConfig(sectionData: any): void {
        this._commonData.awardSectionConfig = this._commonService.getSectionCodeAsKeys(sectionData);
    }

    updateResolvedData(resolvedData: any): void {
        this._commonData.setAwardData(resolvedData);
        this._commonData.departmentLevelRights = resolvedData.availableRights;
    }

    showManualLoader() {
        this._commonService.isManualLoaderOn = true;
    }

    hideManualLoader() {
        this._commonService.isShowLoader.next(false);
        this._commonService.isManualLoaderOn = false;
    }

    /**
     * update section config data if its award creation mode. ie no awardId will be passed.
     * @param sectionData
     * @param observer
     */
    updateSectionDataForAwardCreation(sectionData: any, observer: Subscriber<boolean>) {
        this.updateSectionConfig(sectionData);
        this.hideManualLoader();
        return this.routeSuccessful(observer);
    }

    routeSuccessful(observer: Subscriber<boolean>) {
        observer.next(true);
        return observer.complete();
    }

    routeFailed(observer: Subscriber<boolean>) {
        observer.next(false);
        return observer.complete();
    }
}
