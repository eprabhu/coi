import { Resolve } from '@angular/router';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CommonService } from '../common/services/common.service';
import { LookUpClass, Person } from '../common/services/coi-common.interface';
import { COI_MODULE_CODE, HTTP_ERROR_STATUS } from '../app-constants';
import { AdminDashboardResolvedData } from './admin-dashboard.interface';
import { AdminsAndAdminGroupDetails } from '../disclosure/coi-interface';
import { HeaderService } from '../common/header/header.service';

@Injectable()
export class AdminDashboardResolveGuardService implements Resolve<AdminDashboardResolvedData> {

	private readonly _moduleCode = 'COI8';

	constructor(private _commonService: CommonService, private _headerService: HeaderService) {}

	resolve(): Observable<AdminDashboardResolvedData> {
		return forkJoin({
			moduleConfig: this._commonService.getDashboardActiveModules(this._moduleCode),
			lookupArrayForAdministrator: this.getAdminLookupDetails()
		});
	}

	private getAdminLookupDetails(): Observable<LookUpClass[]> {
		return this._headerService.getAdminDetails(COI_MODULE_CODE).pipe(
			map((data: AdminsAndAdminGroupDetails) => {
				const LOOKUP_ARRAY: LookUpClass[] = data?.persons?.map((person: Person) => ({
					code: person?.personId,
					description: person?.fullName
				})) || [];
				return LOOKUP_ARRAY;
			}),
			catchError(error => {
				this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to load administrator list, please try again.');
				return [[]];
			})
		);
	}

}
