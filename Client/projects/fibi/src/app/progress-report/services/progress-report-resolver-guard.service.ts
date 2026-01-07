/**
 * Author: Ayush Mahadev R
 */
import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {forkJoin, Observable, of as observableOf, Subscriber} from 'rxjs';
import {CommonService} from '../../common/services/common.service';
import {catchError} from 'rxjs/operators';
import {ProgressReportService} from './progress-report.service';
import {CommonDataService} from './common-data.service';

@Injectable()
export class ProgressReportResolverGuardService implements CanActivate {

    readonly _moduleCode = 'PR16';

    constructor(private _progressReportService: ProgressReportService,
                private _router: Router,
                public _commonService: CommonService,
                public _commonData: CommonDataService) {
    }

    canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean> {
        return new Observable<boolean>((observer: Subscriber<boolean>) => {
            forkJoin(this.getHttpRequests(route.queryParamMap.get('progressReportId'))).subscribe((res: any[]) => {
                if (res.length > 1) {
                    this.updateSectionConfigData(res[1]);
                    this.hideManualLoader();
                }
                if (res[0]) {
                    this._commonData.setProgressReportData(res[0]);
                    this._commonData.progressReportTitle = res[0].awardProgressReport.title;
                    observer.next(true);
                    observer.complete();
                } else {
                    observer.next(false);
                    observer.complete();
                }
            });
        });
    }

    hideManualLoader() {
        this._commonService.isShowLoader.next(false);
        this._commonService.isManualLoaderOn = false;
    }

    updateSectionConfigData(data: any) {
        this._commonData.progressReportSectionConfig = this._commonService.getSectionCodeAsKeys(data);
    }

    getHttpRequests(progressReportId: any) {
        const HTTP_REQUESTS = [];
        HTTP_REQUESTS.push(this.loadAwardProgressReportData(progressReportId));
        if (!this.isSectionConfigAlreadyFetched()) {
            this.showManualLoader();
            HTTP_REQUESTS.push(this.getProgressReportSectionConfig());
        }
        return HTTP_REQUESTS;
    }

    showManualLoader() {
        this._commonService.isManualLoaderOn = true;
    }

    isSectionConfigAlreadyFetched() {
        return Object.keys(this._commonData.progressReportSectionConfig).length;
    }

    getProgressReportSectionConfig() {
        return this._commonService.getDashboardActiveModules(this._moduleCode);
    }

    loadAwardProgressReportData(progressReportId: any) {
        return this._progressReportService.loadAwardProgressReport(progressReportId)
            .pipe(catchError(error => this.redirectOnError(error)));
    }

    redirectOnError(error) {
        if (error.status === 403) {
            this._commonService.forbiddenModule = '16';
            this._router.navigate(['/fibi/error/403']);
            return observableOf(null);
        } else {
            this._router.navigate(['/fibi/dashboard/progressReportList']);
            return observableOf(null);
        }
    }
}
