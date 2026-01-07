import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { AutoSaveService } from '../../../common/services/auto-save.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { AgreementCommonDataService } from '../../agreement-common-data.service';

@Component({
  selector: 'app-other-information',
  templateUrl: './other-information.component.html',
  styleUrls: ['./other-information.component.css']
})
export class OtherInformationComponent implements OnInit, OnDestroy {

  agreementRequestId: any;
  viewMode: string;
  $subscriptions: Subscription[] = [];

  constructor(public _commonAgreementData: AgreementCommonDataService,
    public _autoSaveService: AutoSaveService) { }

  ngOnInit() {
    this.$subscriptions.push(this._commonAgreementData.$agreementData.subscribe((data: any) => {
      if (data) {
        this.agreementRequestId = data.agreementHeader.agreementRequestId;
        this.viewMode = !this._commonAgreementData.getSectionEditPermission('100') ? 'view' : 'edit';
      }
    }));
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  dataChangeEvent(event) {
    this._commonAgreementData.isAgreementDataChange = event;
    this._autoSaveService.setUnsavedChanges('Other Information', 'agreement-other-information-section', event, true);
  }

}
