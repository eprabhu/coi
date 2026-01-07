import { Injectable } from '@angular/core';
import { CommonService } from '../common/services/common.service';

@Injectable()
export class ProjectDashboardResolveGuardService {

    private readonly _moduleCode = 'COI8';
    constructor( private _commonService: CommonService ) { }

    resolve() {
        return this._commonService.getDashboardActiveModules(this._moduleCode)
    }

}
