import { Component, OnInit, OnDestroy } from '@angular/core';
import { PaymentService } from './payment.service';
import { ActivatedRoute } from '@angular/router';
import { CommonDataService } from '../services/common-data.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit, OnDestroy {

  paymentLookUpList: any = {};
  result: any = {};
  isPaymentsEdit = false;
  $subscriptions: Subscription[] = [];

  constructor(private _paymentService: PaymentService, private route: ActivatedRoute,
    public _commonData: CommonDataService) { }

  ngOnInit() {
    this.getPaymentLookUp();
    this.getAwardGeneralData();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  getAwardGeneralData() {
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      if (data) {
        this.result = JSON.parse(JSON.stringify(data));
        this.getSectionEditableList();
      }
    }));
  }
  /**
* returns editable permission w.r.t section code
*/
  getSectionEditableList() {
    this.isPaymentsEdit = this._commonData.getSectionEditableFlag('121');
  }

  getPaymentLookUp() {
    this.$subscriptions.push(this._paymentService.getAwardPaymentAndInvoices().subscribe((data: any) => {
      this.paymentLookUpList = data;
    }));
  }

}
