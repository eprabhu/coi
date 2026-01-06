import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class GrantCommonDataService {

  $grantCallData = new BehaviorSubject<any>(null);
  isViewMode = false;
  isGrantCallDataChange = false;
  $isIoiActive = new BehaviorSubject<boolean>(true);
  $isMandatoryFilled = new BehaviorSubject<boolean>(false);
  grantCallTitle = {
    title : '',
    abbrevation: ''
  };
  errorMessage = null;
  grandSectionConfig: any = {};

  constructor(public _commonService: CommonService) { }

  setGrantCallData(grantData) {
    this.$grantCallData.next(grantData);
  }

   async getGrantCallMode() {
    this.isViewMode = ((await this.isModifyGrantRightAvailable() && ! this.getStatusPermission())) ? false : true;
  }

  async isModifyGrantRightAvailable() {
    return  await this._commonService.checkPermissionAllowed('MODIFY_GRANT_CALL');
  }
  getStatusPermission() {
    return [2, 3, 5].some(code => code === this.$grantCallData.getValue().grantCall.grantCallStatus.grantStatusCode);
  }
}
