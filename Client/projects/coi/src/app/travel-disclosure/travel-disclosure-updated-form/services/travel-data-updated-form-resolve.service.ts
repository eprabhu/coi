import { Injectable } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class TravelDataFormResolveService {

    private readonly _moduleCode = 'TD24';

    constructor(private _commonService: CommonService) { }

    resolve() {
        return this._commonService.getDashboardActiveModules(this._moduleCode)
    }


}
