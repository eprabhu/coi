import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { CommonService } from '../../common/services/common.service';
import { POST_CREATE_DISCLOSURE_ROUTE_URL } from '../../app-constants';
import { DataStoreService } from './data-store.service';

@Injectable()
export class ReviewRouteGuardService {

    constructor(private _commonService: CommonService,
        private _router: Router,
        private _dataStore: DataStoreService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): any {
        const IS_AVAILABLE_RIGHTS = this._commonService.getAvailableRight(['MANAGE_FCOI_DISCLOSURE', 'MANAGE_PROJECT_DISCLOSURE','MANAGE_DISCLOSURE_REVIEW', 'VIEW_DISCLOSURE_REVIEW']);
        const IS_VALID_STATUS = ['3', '8', '7', '4'].includes(this._dataStore?.storeData?.coiDisclosure?.coiReviewStatusType?.reviewStatusCode);
        const RESULT = (IS_AVAILABLE_RIGHTS || this._commonService.isCoiReviewer) && IS_VALID_STATUS && (this._commonService.coiApprovalFlowType !== 'NO_REVIEW');
        RESULT ? true : this._router.navigate([POST_CREATE_DISCLOSURE_ROUTE_URL], { queryParams: { disclosureId: route.queryParamMap.get('disclosureId') } });
    }


}
