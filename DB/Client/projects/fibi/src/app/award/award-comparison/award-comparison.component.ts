
import {fromEvent as observableFromEvent,  Subscription ,  Observable } from 'rxjs';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { debounceTime } from 'rxjs/operators';

import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ToolkitEventInteractionService } from './toolkit-event-interaction.service';
import { AwardService } from '../services/award.service';

/**
 * Developed By Mahesh Sreenath V M
 * this module will consists of two parts
 * comment module- contains the logic for all the comments in the review
 * review module - comparison part of the award modules it compares the difference between
 * two versions of an award
 * please read this documentation for technical details
 * https://docs.google.com/document/d/1vAACL0gDF2_tMW46ilpEsbZ0qRAFECEnPT4x4QoW2Mg/edit?usp=sharing
 */
@Component({
  selector: 'app-award-comparison',
  template: `<div>
              <div class="left-div" id="award_tab_content">
                <router-outlet></router-outlet>
               </div>
              <div class="right-div" id="toolkit_tab_content">
                <app-tool-kit></app-tool-kit >
              </div>
             </div>`,
  styleUrls: ['./award-comparison.component.css'],
  providers: [ToolkitEventInteractionService]
})
export class AwardComparisonComponent implements OnInit, OnDestroy {
  $scrollEvent: Subscription;

  constructor(private _toolKitEvents: ToolkitEventInteractionService, private _awardService: AwardService) { }

  ngOnInit() {
    this._awardService.$isSectionNavigation.next(false);
    this.$scrollEvent = observableFromEvent(window, 'scroll')
    .pipe(debounceTime(150)).subscribe(e => this.onWindowScroll());
  }

  ngOnDestroy() {
    subscriptionHandler([this.$scrollEvent]);
    this._toolKitEvents.$isCompareActive.next(false);
    this._awardService.$isSectionNavigation.next(true);
  }

  onWindowScroll() {
    const HEIGHT = document.getElementById('fibiStickyMainHeader').offsetHeight +
           document.getElementById('stickyAwardHeader').offsetHeight;
    const HEADER = document.getElementById('STICKY_AWARD_REVIEW_HEADER');
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
