import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';

@Injectable(

)
export class SfiDataResolveGuardService {

    private readonly _moduleCode = 'SFI53';
    constructor( private _commonService: CommonService ) { }

    resolve() {
        return this._commonService.getDashboardActiveModules(this._moduleCode)
    }

}

@Injectable()
export class EntityDataResolveGuardService {

    private readonly _moduleCode = 'GE26';
    constructor( private _commonService: CommonService ) { }

    resolve() {
        return this._commonService.getDashboardActiveModules(this._moduleCode)
    }

}
