import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HTTP_ERROR_STATUS } from '../../../app-constants';
import { HeaderService } from '../../../common/header/header.service';
import { CommonService } from '../../../common/services/common.service';
import { DeclAdminDashboardResolvedData } from '../../declaration.interface';
import { AdminsAndAdminGroupDetails } from '../../../disclosure/coi-interface';
import { LookUpClass, Person } from '../../../common/services/coi-common.interface';
import { COI_DECLARATION_MODULE_CODE, DECLARATION_MODULE_CONFIGURATION_CODE } from '../../declaration-constants';

@Injectable()
export class DeclarationAdminDashboardResolveService {

    constructor(private _commonService: CommonService, private _headerService: HeaderService) {}

    resolve(): Observable<DeclAdminDashboardResolvedData> {
        return forkJoin({
            moduleConfig: this._commonService.getDashboardActiveModules(DECLARATION_MODULE_CONFIGURATION_CODE),
            lookupArrayForAdministrator: this.getAdminLookupDetails(),
            lookupArrayForDeclarationType: this._commonService.getOrFetchLookup('COI_DECLARATION_TYPE', 'DECLARATION_TYPE_CODE', 'Y')
        });
    }

    private getAdminLookupDetails(): Observable<LookUpClass[]> {
        return this._headerService.getAdminDetails(COI_DECLARATION_MODULE_CODE).pipe(
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
