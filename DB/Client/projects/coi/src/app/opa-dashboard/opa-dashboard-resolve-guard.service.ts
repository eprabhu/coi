import { Resolve } from '@angular/router';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CommonService } from '../common/services/common.service';
import { LookUpClass, Person } from '../common/services/coi-common.interface';
import { HTTP_ERROR_STATUS, OPA_MODULE_CODE } from '../app-constants';
import { OpaDashboardService, OPAAdminDashboardResolvedData } from './opa-dashboard.service';
import { AdminsAndAdminGroupDetails } from '../disclosure/coi-interface';

@Injectable()
export class OPADashboardResolveGuardService implements Resolve<OPAAdminDashboardResolvedData> {

	constructor(private _commonService: CommonService, private _opaDashboardService: OpaDashboardService) { }

	resolve(): Observable<OPAAdminDashboardResolvedData> {
		return forkJoin({
			lookupArrayForAdministrator: this.getAdminLookupDetails()
		});
	}

	private getAdminLookupDetails(): Observable<LookUpClass[]> {
		return this._opaDashboardService.getAdminDetails(OPA_MODULE_CODE).pipe(
			map((data: AdminsAndAdminGroupDetails) => {
				const LOOKUP_ARRAY: LookUpClass[] = data?.persons?.map((person: Person) => ({
					code: person?.personId,
					description: person?.fullName
				})) || [];
				return LOOKUP_ARRAY;
			}),
			catchError(error => {
				this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to load administrator list, please try again.');
				return [];
			})
		);
	}

}
