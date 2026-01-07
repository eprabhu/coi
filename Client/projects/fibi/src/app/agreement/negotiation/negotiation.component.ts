import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { AgreementCommonDataService } from '../agreement-common-data.service';
import { NegotiationService } from '../negotiation/negotiation.service';
import { AgreementService } from '../agreement.service';

@Component({
  selector: 'app-negotiation',
  templateUrl: './negotiation.component.html',
  styleUrls: ['./negotiation.component.css']
})
export class NegotiationComponent implements OnInit, OnDestroy {

  result: any = {};
  agreementId: any;
  $subscriptions: Subscription[] = [];
  negotiationLookUp: any = {};

  constructor(private _commonAgreementData: AgreementCommonDataService, private _agreementService: AgreementService,
     private _negotiationService: NegotiationService) { }

  ngOnInit() {
    this._commonAgreementData.isShowSaveButton = false;
    this.getAgreementGeneralData();
    this.loadAgreementNegotiation();
    this.isLocationChange();
    this._commonAgreementData.isShowSaveButton = false;
  }

  getAgreementGeneralData() {
    this.$subscriptions.push(this._commonAgreementData.$agreementData.subscribe((data: any) => {
      if (data) {
        this.result = JSON.parse(JSON.stringify(data));
      }
    }));
  }

  isLocationChange() {
    this.$subscriptions.push(this._commonAgreementData.$locationChange.subscribe(() => {
     this.loadNewNegotiationData();
    }));
  }

  loadAgreementNegotiation() {
    this._agreementService.$getNegotiationLookUp.subscribe((negotiationLookUp: any) => {
      this.negotiationLookUp = negotiationLookUp;
    });
  }

  loadNewNegotiationData() {
    this.$subscriptions.push(this._agreementService.loadAgreementNegotiation(
      {'agreementRequestId': this.result.agreementHeader.agreementRequestId,
      'negotiationId': this.result.agreementHeader.negotiationId}
    ).subscribe((data: any) => {
      this._agreementService.$getNegotiationLookUp.next(data);
    }));
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
}
