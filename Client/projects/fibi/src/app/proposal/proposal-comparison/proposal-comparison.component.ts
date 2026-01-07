import {fromEvent as observableFromEvent,  Subscription ,  Observable } from 'rxjs';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { debounceTime } from 'rxjs/operators';

import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ProposalService } from '../services/proposal.service';

/**
 * Developed ARAVIND P S
 * this module will consists of two parts
 * review module - comparison part of the proposaL modules it compares the difference between
 * two versions of an proposal
 * A widget to navigate across different proposal sections
 */
@Component({
  selector: 'app-proposal-comparison',
  template: `<div>
              <div class="left-div" id="proposal_tab_content">
               <app-proposal-review></app-proposal-review>
               </div>
              <div class="right-div" id="prop-toolkit_tab_content">
                <app-tool-kit></app-tool-kit >
              </div>
             </div>`,
  styleUrls: ['./proposal-comparison.component.css'],
  // providers: [ToolkitEventInteractionService]
})
export class ProposalComparisonComponent implements OnInit, OnDestroy {
  $scrollEvent: Subscription;

  constructor(private _proposalService: ProposalService,) { }

  ngOnInit() {
    this._proposalService.$currentTab.next('PROPOSAL_REVIEW');
    this.$scrollEvent = observableFromEvent(window, 'scroll')
    .pipe(debounceTime(150)).subscribe(e => this.onWindowScroll());
  }

  ngOnDestroy() {
    subscriptionHandler([this.$scrollEvent]);;
  }

  onWindowScroll() {
    const HEIGHT = document.getElementById('fibiStickyMainHeader').offsetHeight +
           document.getElementById('stickyProposalHeader').offsetHeight;
    const HEADER = document.getElementById('STICKY_PROPOSAL_REVIEW_HEADER');
    if (HEADER) {
      const STICKY = HEADER.offsetTop - HEIGHT;
      if (window.pageYOffset > STICKY) {
        HEADER.classList.add('tab-sticky');
        HEADER.style.top = HEIGHT - 10 + 'px';
      } else {
        HEADER.classList.remove('tab-sticky');
      }
    }
  }

}
