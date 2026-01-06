import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { DISCLOSURE_REVIEW_STATUS, POST_CREATE_DISCLOSURE_ROUTE_URL } from '../../app-constants';
import { DataStoreService } from './data-store.service';

@Injectable()
export class RouteLogRouteGuardService {

    constructor(private _router: Router,
                private _dataStore: DataStoreService) { }

    canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): any {
        const { REVIEW_IN_PROGRESS, REVIEW_ASSIGNED, ASSIGNED_REVIEW_COMPLETED, ROUTING_IN_PROGRESS, SUBMITTED, RETURNED, WITHDRAWN, COMPLETED } = DISCLOSURE_REVIEW_STATUS;
        const IS_VALID_STATUS = [REVIEW_IN_PROGRESS, ASSIGNED_REVIEW_COMPLETED, REVIEW_ASSIGNED, REVIEW_ASSIGNED, ROUTING_IN_PROGRESS, SUBMITTED, RETURNED, WITHDRAWN, COMPLETED].includes(this._dataStore?.storeData?.coiDisclosure?.coiReviewStatusType?.reviewStatusCode);
        const RESULT = IS_VALID_STATUS;
        RESULT ? true : this._router.navigate([POST_CREATE_DISCLOSURE_ROUTE_URL], { queryParams: { disclosureId: route.queryParamMap.get('disclosureId') } });
    }

}
