import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../common/services/common.service';

@Injectable()
export class AwardBasesalaryListResolverService {

  constructor(private _commonService: CommonService, private _router: Router) { }

  async resolve() {
    if (await this._commonService.checkPermissionAllowed('MANPOWER_VIEW_BASE_SALARY')) {
      return;
    } else {
      this._router.navigate(['/error/403']);
    }
  }

}
