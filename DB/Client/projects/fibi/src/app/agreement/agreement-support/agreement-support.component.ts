import { Component, OnInit } from '@angular/core';
import { AgreementCommonDataService } from '../agreement-common-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-agreement-support',
  template: `<app-support [result]="result" [showRequestModal]="showRequestModal"
                [supportReq]="supportRequestObject"></app-support>`,
  styleUrls: ['./agreement-support.component.css']
})
export class AgreementSupportComponent implements OnInit {
  $subscriptions: Subscription[] = [];
  result: any = {};
  showRequestModal: any = {};
  supportRequestObject: any = {
    moduleItemCode: 13,
    moduleSubItemCode: 0,
    moduleItemKey: '',
    moduleSubItemKey: '0',
    reviewTypeCode: '2'
  };

  constructor(private _commonAgreementData: AgreementCommonDataService) { }

  ngOnInit() {
    this.getAgreementGeneralData();
    this.supportRequestObject.moduleItemKey = this.result.agreementHeader.agreementRequestId;
  }

  getAgreementGeneralData() {
    this.$subscriptions.push(this._commonAgreementData.$agreementData.subscribe((data: any) => {
      if (data) {
        this.result = JSON.parse(JSON.stringify(data));
      }
    }));
  }

}
