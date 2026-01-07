import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { PaymentService } from '../payment.service';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../../../common/services/common.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { CommonDataService } from '../../services/common-data.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';

@Component({
  selector: 'app-payment-edit',
  templateUrl: './payment-edit.component.html',
  styleUrls: ['./payment-edit.component.css']
})
export class PaymentEditComponent implements OnInit, OnDestroy {

  @Input() paymentLookUpList: any = {};
  @Input() result: any = {};

  paymentObject: any = {};
  awardId: any;
  paymentList: any;
  isPaymentWidgetOpen = false;
  $subscriptions: Subscription[] = [];
  isSaving = false;

  constructor(private _paymentService: PaymentService, private route: ActivatedRoute,
    private _commonService: CommonService, private _commonData: CommonDataService) { }

  ngOnInit() {
    this.awardId = this.route.snapshot.queryParams['awardId'];
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  setPaymentObject() {
    this.paymentObject.basisOfPaymentCode = this.result.award.basisOfPaymentCode;
    this.paymentObject.methodOfPaymentCode = this.result.award.methodOfPaymentCode;
    this.paymentObject.paymentInvoiceFrequencyCode = this.result.award.paymentInvoiceFrequencyCode;
    this.paymentObject.finalInvoiceDue = this.result.award.finalInvoiceDue;
    this.paymentObject.invoiceNoOfCopies = this.result.award.invoiceNoOfCopies;
    this.paymentObject.invoiceInstructions = this.result.award.invoiceInstructions;
    this.paymentObject.updateUser = this._commonService.getCurrentUserDetail('userName');
  }

  savePaymentInformation() {
   if (!this.isSaving) {
    this.isSaving = true;
    this.setPaymentObject();
    this.paymentObject.awardId = this.awardId;
    this.$subscriptions.push(this._paymentService.saveAwardPaymentAndInvoices(this.paymentObject).subscribe((data: any) => {
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Payment added successfully.');
      this.updateAwardStoreData(data);
      this._commonData.isAwardDataChange = false;
      this.isSaving = false;
    }, err => {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Adding Payment failed. Please try again.'); 
      this.isSaving = false; }));
   }
  }

  updateAwardStoreData(data) {
    this.result.award = JSON.parse(JSON.stringify(data));
    this._commonData.setAwardData(this.result);
  }

  inputRestriction(event, value) {
    const pattern = (/^\d+$/);
    if (!pattern.test(String.fromCharCode(event.charCode))) {
      event.preventDefault();
    }
    if (event.target.value.length >= '3') {
      event.target.value = event.target.value.slice(0, 2);
    }
  }
}
