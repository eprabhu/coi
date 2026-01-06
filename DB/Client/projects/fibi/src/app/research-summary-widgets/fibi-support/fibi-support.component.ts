import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { fadeDown } from '../../common/utilities/animations';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ResearchSummaryWidgetsService } from '../research-summary-widgets.service';

@Component({
  selector: 'fibiapp-support',
  templateUrl: './fibi-support.component.html',
  styleUrls: ['./fibi-support.component.css'],
  animations: [fadeDown]
})
export class FibiSupportComponent implements OnInit, OnDestroy {

  $subscriptions: Subscription[] = [];
  modulePath =  {
    3  : { name: 'Development Proposal', path: '#/fibi/proposal/support?proposalId=', class: 'text-success' },
    13 : { name: 'Agreement', path: '#/fibi/agreement/support?agreementId=', class: 'text-info' }
  };
  supportData: any = [];
  slicedList: any = [];
  isShowLoader = false;
  widgetDescription: any;

  constructor(private _researchSummaryWidgetService: ResearchSummaryWidgetsService) { }

  ngOnInit() {
    this.widgetDescription = this._researchSummaryWidgetService.getWidgetDescription(4);
    this.getSupportData();
  }

  getSupportData() {
    this.isShowLoader = true;
    this.$subscriptions.push(this._researchSummaryWidgetService.getQuestionResults()
      .subscribe((data: any) => {
        this.supportData = data.preReviews || [];
        this.slicedList = this.supportData.slice(0, 5);
        this.isShowLoader = false;
      }, err => { this.isShowLoader = false; }));
  }

  goToActionPath(support) {
    localStorage.setItem('currentTab', 'SUPPORT');
    window.open(window.location.origin + window.location.pathname +
      this.modulePath[support.moduleItemCode].path + support.moduleItemKey, '_self');
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

}


