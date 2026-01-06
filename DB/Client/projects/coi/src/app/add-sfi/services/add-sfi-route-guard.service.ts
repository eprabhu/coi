import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';

@Injectable()

export class AddSfiRouteGuardService {

    constructor(private _commonService: CommonService) { }

    canDeactivate(): boolean {
        if (!this._commonService.isEngagementChangesAvailable) {
            return true;
        } else {
            this._commonService.openAddSFILeaveModal();
            return false;
        }
    }
}
