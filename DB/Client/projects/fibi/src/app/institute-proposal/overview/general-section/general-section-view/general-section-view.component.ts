// Last updated by Ramlekshmy on 23-01-2020
import { Component, OnInit, OnDestroy, Input, OnChanges } from '@angular/core';
import { compareDates, getDuration } from '../../../../common/utilities/date-utilities';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { DataStoreService } from '../../../services/data-store.service';
import { InstituteProposal, InstProposal } from '../../../institute-proposal-interfaces';
import { setHelpTextForSubItems } from '../../../../common/utilities/custom-utilities';

@Component({
  selector: 'app-general-section-view',
  templateUrl: './general-section-view.component.html',
  styleUrls: ['./general-section-view.component.css']
})
export class GeneralSectionViewComponent implements OnInit, OnDestroy, OnChanges {

  generalDetails: InstProposal;
  instProposalDataBindObj: any = {};
  showGrantDetails = false;
  $subscriptions: Subscription[] = [];
  @Input() helpText: any = {};

  constructor(private _dataStore: DataStoreService) { }

  ngOnInit() {
    this.getGeneralDetails();
  }

  ngOnChanges() {
    if (this.helpText) {
      if (Object.keys(this.helpText).length && this.helpText.instituteProposalInformation &&
        this.helpText.instituteProposalInformation.parentHelpTexts.length) {
        this.helpText = setHelpTextForSubItems(this.helpText, 'instituteProposalInformation');
      }
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  getDataStoreEvent() {
    this.$subscriptions.push(this._dataStore.dataEvent
      .subscribe((data: any) => {
        if (data.includes('instProposal')) {
          this.getGeneralDetails();
        }
      }));
  }

  getGeneralDetails() {
    const data: InstituteProposal = this._dataStore.getData(['instProposal']);
    this.generalDetails = data.instProposal;
  }

  differenceBetweenDates(startDate, endDate) {
    const DATEOBJ = getDuration(startDate, endDate);
    this.instProposalDataBindObj.durInMonths = DATEOBJ.durInMonths;
    this.instProposalDataBindObj.durInYears = DATEOBJ.durInYears;
    this.instProposalDataBindObj.durInDays = DATEOBJ.durInDays;
  }

  setGrantDetailsValue(isShowModal) {
    this.showGrantDetails = isShowModal;
  }

}
