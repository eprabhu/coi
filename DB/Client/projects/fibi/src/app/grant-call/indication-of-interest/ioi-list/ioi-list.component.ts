import { Component, OnInit, Input, OnChanges, OnDestroy, SimpleChanges, SimpleChange } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { Subscription } from 'rxjs';
import { IndicationOfInterestService } from '../indication-of-interest.service';
import { GrantCommonDataService } from '../../services/grant-common-data.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { fileDownloader } from '../../../common/utilities/custom-utilities';

@Component({
  selector: 'app-ioi-list',
  templateUrl: './ioi-list.component.html',
  styleUrls: ['./ioi-list.component.css']
})
export class IoiListComponent implements OnInit, OnChanges, OnDestroy {

  grantCallIOIId = null;
  isShowCreatedList = false;
  $subscriptions: Subscription[] = [];
  result: any = {};
  grantCallId: any;
  moduleDetails: any = {};
  ioiTabName: any;
  ioiList: any = {};
  deleteIOIId: any;
  deleteIndex: any;
  isDesc: boolean = false;
  column: string = '';
  direction: number = -1;
  constructor(private _commonService: CommonService, public _commonData: GrantCommonDataService,
    public _ioiService: IndicationOfInterestService) { }

  ngOnInit() {
    this.getGrantCallGeneralData();
    this.setDefaultTab();
    this.loadIOIListByGrantCallId();
    this.moduleDetails.moduleSubItemCode = 1;
    this.moduleDetails.moduleSubItemKey = 0;
    this.moduleDetails.moduleItemCode = 15;
    this.moduleDetails.moduleItemKey = this.result.grantCall.grantCallId;
  }

  setDefaultTab() {
    if(!this._commonData.grandSectionConfig['1514'].isActive) {
      if(this._commonData.grandSectionConfig['1506'].isActive) {
        return this._ioiService.ioiTabName = 'ALL_IOI';
      }
      this._ioiService.ioiTabName = 'DRAFT_IOI';
    }
  }

  getGrantCallGeneralData() {
    this.$subscriptions.push(this._commonData.$grantCallData.subscribe((data: any) => {
      if (data) {
        this.result = JSON.parse(JSON.stringify(data));
        this.grantCallId = this.result.grantCall.grantCallId;
      }
    }));
  }
  ngOnChanges() {
    this.loadIOIListByGrantCallId();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /* calls the list again to refresh the list when user submits the ioi */
  OnIsSubmittedSuccesfully(event) {
    this.loadIOIListByGrantCallId();
  }

  /* Featches the initial values and lists */
  loadIOIListByGrantCallId() {
    const updateUser = this._commonService.getCurrentUserDetail('userName');
    this.$subscriptions.push(this._ioiService.loadGrantCallIOIByGrantId({
      'grantCallId': this.grantCallId,
      'updateUser': updateUser,
      'personId': (this._commonService.getCurrentUserDetail('personID')),
      'tabName': this._ioiService.ioiTabName
    }).subscribe((data: any) => {
      this.ioiList = data.grantCallIOIHeaders;
      if (this.ioiList && this.ioiList.length > 0) {
        const draftList = this.ioiList.find(x => x.grantIOIStatusCode === 1);
        this.isShowCreatedList = draftList == null ? false : true;
      } else {
        this.isShowCreatedList = false;
      }
    }));
  }

  // therea utility fuction for dowload in utilities try to use that here
  exportIoiList() {
    const exportDataReqObject = {
      personId: this._commonService.getCurrentUserDetail('personID'),
      grantCallId: this.result.grantCallId,
      tabName: this._ioiService.ioiTabName,
      documentHeading: this._ioiService.ioiTabName === 'ALL_IOI' ?
        'ALL IOI' : this._ioiService.ioiTabName === 'MY_IOI' ? 'MY IOI'
          : 'DRAFT IOI',
    };
    this.$subscriptions.push(this._ioiService.exportGrantCallIoi(exportDataReqObject).subscribe(data => {
      const fileName = exportDataReqObject.documentHeading;
      // msSaveOrOpenBlob only available for IE & Edge
      fileDownloader(data.body, fileName, 'xlsx');
    }));
  }

  setTemporaryData(ioi) {
    this.deleteIOIId = ioi.grantCallIOIId;
    this.deleteIndex = this.ioiList.indexOf(ioi);
  }

  /* deletes IOI details */
  deleteIOI() {
    this.$subscriptions.push(this._ioiService.deleteIOIListItem({ 'grantCallIOIId': this.deleteIOIId })
      .subscribe((data: any) => {
        this.ioiList.splice(this.deleteIndex, 1);
      }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Removing IOI failed. Please try again.'); },
        () => {
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'IOI removed successfully.');
        }));
  }

  sortBy(property) {
    this.column = property;
    this.direction = this.isDesc ? 1 : -1;
}

}
