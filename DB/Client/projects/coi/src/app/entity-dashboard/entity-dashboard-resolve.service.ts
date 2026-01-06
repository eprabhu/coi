import { Injectable } from '@angular/core';
import { CommonService } from '../common/services/common.service';

@Injectable()
export class EntityDashboardResolveService {

    private readonly _moduleCode = 'GE26';
    constructor(private _commonService: CommonService) { }

    resolve() {
        return this._commonService.getDashboardActiveModules(this._moduleCode)
    }
}
