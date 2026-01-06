import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Constants } from '../../common/constants/action-list.constants';
import { CommonService } from '../../common/services/common.service';
import { fadeDown } from '../../common/utilities/animations';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ResearchSummaryWidgetsService } from '../research-summary-widgets.service';

@Component({
  selector: 'app-attention-required-list',
  templateUrl: './attention-required-list.component.html',
  styleUrls: ['./attention-required-list.component.css'],
  animations: [fadeDown]
})
export class AttentionRequiredListComponent implements OnInit, OnDestroy {

  $subscriptions: Subscription[] = [];
  attentionRequiredList: any = [];
  isShowLoader = false;
  tableHeaderData: any = [];
  modulePath = Object.assign({}, Constants.paths);
  widgetDescription: any;
  column: number;
  direction: number = -1;
  isDesc: boolean;


  constructor(private _researchSummaryWidgetService: ResearchSummaryWidgetsService,
    private _router:  Router, private _commonService: CommonService) { }

  ngOnInit() {
    this.widgetDescription = this._researchSummaryWidgetService.getWidgetDescription(24);
    this.getAttentionRequiredList();
  }

  getAttentionRequiredList() {
    this.isShowLoader = true;
    this.$subscriptions.push(this._researchSummaryWidgetService.
      getResearchSummaryDatasByWidget({ unitNumber: null, tabName: 'ATTENTION_LIST' })
      .subscribe((data: any) => {
        this.attentionRequiredList = data.widgetDatas || [];
        this.tableHeaderData = this.attentionRequiredList.splice(0, 1)[0];
        this.isShowLoader = false;
      }, err => { this.isShowLoader = false; }));
  }

  goToActionPath(inbox, i) {
    this._commonService.isPreventDefaultLoader = false;
    if (inbox[4].toString() === '3') {
      localStorage.setItem('currentTab', 'PROPOSAL_REVIEW');
      this._router.navigate(['fibi/proposal/summary'], { queryParams: { proposalId: inbox[5] } });
      return;
    }
    window.open(window.location.origin + window.location.pathname + this.modulePath[this.getModulePathKey(inbox)].path
      + inbox[5], '_self');
  }

  sortBy(property) {
    this.column = property;
    this.direction = this.isDesc ? 1 : -1;
  }


  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  getModulePathKey(el) {
    return el[4].toString();
  }

}
