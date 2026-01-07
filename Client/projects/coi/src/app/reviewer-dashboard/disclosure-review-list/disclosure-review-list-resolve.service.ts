import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { COI_MODULE_CODE, HTTP_ERROR_STATUS } from '../../app-constants';
import { LookUpClass, Person } from '../../common/services/coi-common.interface';
import { AdminsAndAdminGroupDetails } from '../../disclosure/coi-interface';
import { HeaderService } from '../../common/header/header.service';
import { CommonService } from '../../common/services/common.service';
import { RevDashAdminDashboardResolvedData } from '../reviewer-dashboard.interface';
import { REVIEWER_MODULE_SECTION_CODE } from '../reviewer-dashboard-constants';

@Injectable()
export class DisclosureReviewListResolveService {

    constructor(private _commonService: CommonService, private _headerService: HeaderService) { }

    resolve(): Observable<RevDashAdminDashboardResolvedData> {
        return forkJoin({
            // The module code needs to be updated — currently, the Reviewer Dashboard doesn’t have its own module code,
            // so for now, the API is being called using the Declaration module code.
            moduleConfig: this._commonService.getDashboardActiveModules(REVIEWER_MODULE_SECTION_CODE),
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
