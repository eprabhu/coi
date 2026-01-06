import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { CommonService } from '../../common/services/common.service';
import { POST_CREATE_DISCLOSURE_ROUTE_URL } from '../../app-constants';
import { DataStoreService } from './data-store.service';
import { isEmptyObject } from '../../common/utilities/custom-utilities';
import { COI } from '../coi-interface';

@Injectable()
export class AttachmentRouteGuardService {

	constructor(private _commonService: CommonService, 
		private _router: Router, 
		private _dataStore: DataStoreService
	) { }

	coiData = new COI();

	canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): any {
		this.getDataFromStore();
		const CURRENT_USER_ID = this._commonService.getCurrentUserDetail('personID');
		const DISCLOSURE_CREATOR_ID = this.coiData.coiDisclosure.person.personId;
		const hasAttachmentRights = this._commonService.getAvailableRight(['MANAGE_DISCLOSURE_ATTACHMENT', 'VIEW_DISCLOSURE_ATTACHMENT']);
		return CURRENT_USER_ID === DISCLOSURE_CREATOR_ID || hasAttachmentRights || this._commonService.isCoiReviewer ? true :
			(this._router.navigate([POST_CREATE_DISCLOSURE_ROUTE_URL], { queryParams: { disclosureId: route.queryParamMap.get('disclosureId') } }), false);
	}

	private getDataFromStore() {
		const COI_DATA = this._dataStore.getData();
		if (isEmptyObject(COI_DATA)) { return; }
		this.coiData = COI_DATA;
	}

}
