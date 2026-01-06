/** last updated by Aravind on 8-11-2019 **/

import { Component, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonDataService } from '../services/common-data.service';
import { ProjectOutcomeService } from './project-outcome.service';
import { ActivatedRoute } from '@angular/router';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { CommonService } from '../../common/services/common.service';

@Component({
  selector: 'app-project-outcome',
  templateUrl: './project-outcome.component.html',
  styleUrls: ['./project-outcome.component.css']
})
export class ProjectOutcomeComponent implements OnInit, OnDestroy {

  awardId: any;
  $subscriptions: Subscription[] = [];
  helpText;

  constructor(public _commonData: CommonDataService, private _activatedRoute: ActivatedRoute,
    private _outcomeService: ProjectOutcomeService, public _commonService: CommonService) { }

  ngOnInit() {
    this._outcomeService.outcomesData = this._activatedRoute.snapshot.data.outcomesData;
    this.awardId = this._activatedRoute.snapshot.queryParamMap.get('awardId');
    this.getAwardGeneralData();
    this.fetchHelpText();
  }

  ngOnDestroy() {
    this._outcomeService.outcomesData = {};
    this._outcomeService.awardData = {};
    subscriptionHandler(this.$subscriptions);
  }

  getAwardGeneralData() {
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      if (data) {
        this._outcomeService.isOutcomesEditable = this._commonData.getSectionEditableFlag('115');
        this._outcomeService.awardData = data.award;
      }
    }));
    }

    fetchHelpText() {
        this.$subscriptions.push(this._outcomeService.fetchHelpText({
            'moduleCode': 1, 'sectionCodes': [115, 157, 158, 194, 195]
        }).subscribe((data: any) => {
            this.helpText = data;
        }));
    }

}
