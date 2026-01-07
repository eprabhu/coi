import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable, of as observableOf, Subscriber } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ExtReviewerMaintenanceService } from '../external-reviewer-maintenance-service';

@Injectable()
export class ExternalReviewerDetailsResolverGuardService implements CanActivate {

    constructor(private _extReviewerMaintenanceService: ExtReviewerMaintenanceService,
        private _router: Router) {
    }

    extReviewerDetails: any;

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
        return new Observable<boolean>((observer: Subscriber<boolean>) => {
            const reviewerId = route.queryParamMap.get('externalReviewerId');
            const mode = route.queryParamMap.get('mode');
            forkJoin(this.generateHttpRequests(reviewerId, mode)).subscribe(res => {
                if (res) {
                    this.saveLookUpData(res[0]);
                    if (res.length > 1) {
                        this.saveDataAndResolveRoute(res[1], observer);
                    } else {
                        this._extReviewerMaintenanceService.setExternalReviewerDetails({});
                        this.routeSuccessful(observer);
                    }
                } else {
                    this.routeFailed(observer);
                }
            });
        });
    }

    generateHttpRequests(reviewerId: string, mode: string) {
        const requests = [];
        if (!reviewerId && mode === 'create') {
            requests.push(this.loadLookUpData());
        }
        if (reviewerId) {
            requests.push(this.loadLookUpData(), this.loadExternalReviewerData(reviewerId));
        }
        return requests;
    }

    saveDataAndResolveRoute(data: any, observer: Subscriber<boolean>) {
        this.extReviewerDetails = data;
        if (this.extReviewerDetails.extReviewer) {
            this._extReviewerMaintenanceService.setExternalReviewerDetails(this.extReviewerDetails);
            this.routeSuccessful(observer);
        } else {
            this.routeFailed(observer);
            this._router.navigate(['/fibi/maintain-external-reviewer/external-reviewer-list']);
        }
    }

    loadExternalReviewerData(externalReviewerId: any) {
        return this._extReviewerMaintenanceService.loadExternalReviewerDetails({ 'extReviewerId': externalReviewerId })
            .pipe(catchError(error => this.redirectOnError(error)));
    }

    loadLookUpData() {
        return this._extReviewerMaintenanceService.getAllExtReviewersLookup();
    }

    saveLookUpData(data) {
        this._extReviewerMaintenanceService.lookUpData = data;
    }

    redirectOnError(error) {
        if (error) {
            this._router.navigate(['/fibi/maintain-external-reviewer/external-reviewer-list']);
            return observableOf(null);
        }
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
