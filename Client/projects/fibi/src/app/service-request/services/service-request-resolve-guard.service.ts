import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable, Subscriber, of as observableOf } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonService } from '../../common/services/common.service';
import { ServiceRequestRoot } from '../service-request.interface';
import { CommonDataService } from './common-data.service';
import { ServiceRequestService } from './service-request.service';

@Injectable()
export class ServiceRequestResolveGuardService implements CanActivate {

    private readonly _moduleCode = 'SR20';

    constructor(
        private _commonService: CommonService,
        private _router: Router,
        public _commonData: CommonDataService,
        private _serviceRequestService: ServiceRequestService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean> {
        return new Observable<boolean>((observer: Subscriber<boolean>) => {
            const serviceRequestId = route.queryParamMap.get('serviceRequestId');
            forkJoin(this.getHttpRequests(serviceRequestId)).subscribe((res: any[]) => {
                if (res.length > 1) {
                    this.updateSectionConfigData(res[1]);
                    this.hideManualLoader();
                }
                if (res[0]) {
                    this.setServiceRequest(res[0]);
                    return this.routeSuccess(observer);
                } else {
                    return this.routeError(observer);
                }
            });
        });
    }

    private setServiceRequest(data: ServiceRequestRoot) {
        this._commonData.setServiceRequestData(data);
        this._commonData.dataEvent.next(Object.keys(data));
    }

    private routeSuccess(observer) {
        observer.next(true);
        observer.complete();
    }

    private routeError(observer) {
        observer.next(false);
        observer.complete();
    }

    private getHttpRequests(serviceRequestId: any) {
        const HTTP_REQUESTS = [];
        HTTP_REQUESTS.push(this.loadOrCreateServiceRequest(serviceRequestId));
        if (!this.isSectionConfigAlreadyFetched()) {
            this.showManualLoader();
            HTTP_REQUESTS.push(this.getInstituteProposalSectionConfig());
        }
        return HTTP_REQUESTS;
    }

    private loadOrCreateServiceRequest(serviceRequestId) {
        return serviceRequestId ? this.loadServiceRequestById(serviceRequestId) : this.createServiceRequest();
    }

    private updateSectionConfigData(data: any) {
        this._serviceRequestService.sectionConfigurations = this._commonService.getSectionCodeAsKeys(data);
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
        return Object.keys(this._serviceRequestService.sectionConfigurations).length;
    }

    private createServiceRequest() {
        return this._serviceRequestService.createServiceRequest().pipe(catchError(error => this.redirectOnError(error)));
    }

    private loadServiceRequestById(serviceRequestId: any) {
        return this._serviceRequestService.loadServiceRequestById(serviceRequestId)
            .pipe(catchError(error => this.redirectOnError(error)));
    }

    private redirectOnError(error) {
        if (error.status === 403) {
            // name is given based on the values assigned in forbidden component please refer forbidden.component.ts
            this._commonService.forbiddenModule = '20';
            this._router.navigate(['/fibi/error/403']);
            return observableOf(null);

        } else {
            this._router.navigate(['/fibi/dashboard/serviceRequestList']);
            return observableOf(null);
        }
    }

}
