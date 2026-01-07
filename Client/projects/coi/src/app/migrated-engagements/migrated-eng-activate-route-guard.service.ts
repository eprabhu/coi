import { Injectable } from '@angular/core';
import { CommonService } from '../common/services/common.service';

@Injectable()
export class MigratedEngActivateRouteGuardService {

    constructor(private _commonService: CommonService) { }

    canActivate(): boolean {
        if (this._commonService.isEnableLegacyEngMig) {
            return true;
        } else {
            return false;
        }
    }
}
