import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Constants } from '../../common/constants/action-list.constants';

import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ExpandedWidgetsService } from '../expanded-widgets.service';

@Component({
  selector: 'app-support-expanded-view',
  templateUrl: './support-expanded-view.component.html',
  styleUrls: ['./support-expanded-view.component.css']
})
export class SupportExpandedViewComponent implements OnInit, OnDestroy {

  $subscriptions: Subscription[] = [];
  supportdata: any = [];
  modulePath =  {
    3  : { name: 'Development Proposal', path: '#/fibi/proposal/support?proposalId=', class: 'text-success' },
    13 : { name: 'Agreement', path: '#/fibi/agreement/support?agreementId=', class: 'text-info' }
  };

  constructor(private _expandedWidgetsService: ExpandedWidgetsService,
    private _router: Router) { }

  ngOnInit() {
    this.getSupportData();
  }

  getSupportData() {
    this.$subscriptions.push(this._expandedWidgetsService.getQuestionResults().subscribe((data: any) => {
      this.supportdata = data.preReviews;
    }));
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
