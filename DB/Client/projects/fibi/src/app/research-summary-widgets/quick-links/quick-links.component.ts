import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { fadeDown } from '../../common/utilities/animations';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ResearchSummaryWidgetsService } from '../research-summary-widgets.service';

@Component({
  selector: 'app-quick-links',
  templateUrl: './quick-links.component.html',
  styleUrls: ['./quick-links.component.css'],
  animations: [fadeDown]
})
export class QuickLinksComponent implements OnInit, OnDestroy {

  $subscriptions: Subscription[] = [];
  quickLinks: any = [];
  isShowLoader = false;
  widgetDescription: any;

  constructor(private _researchSummaryWidgetService: ResearchSummaryWidgetsService) { }

  ngOnInit() {
    this.widgetDescription = this._researchSummaryWidgetService.getWidgetDescription(9);
    this.getAllQuickLinksOrEvents();
  }

  /** function gets the quicklinks data
   */
  getAllQuickLinksOrEvents() {
    this.isShowLoader = true;
    this.$subscriptions.push(this._researchSummaryWidgetService.getAllQuickLinksOrEvents()
      .subscribe((data: any) => {
        this.quickLinks = data.quickLinks;
        this.isShowLoader = false;
      }, err => { this.isShowLoader = false; }));
  }

  redirectUrl(url) {
    url.includes('http') ? window.open(url, '_blank') : window.open('//' + url, '_blank');
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

}
