import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { ScoringCriteriaService } from '../scoring-criteria.service';

@Component({
  selector: 'app-scoring-criteria-view',
  templateUrl: './scoring-criteria-view.component.html',
  styleUrls: ['./scoring-criteria-view.component.css']
})
export class ScoringCriteriaViewComponent implements OnInit, OnDestroy {
  grantCallId: any = '';
  scoringCriteriaObject: any = {};
  $subscriptions: Subscription[] = [];
  @Input() result: any;
  collapseScoringCriteria: any = {};

  constructor(private _route: ActivatedRoute, public _scoringService: ScoringCriteriaService) { }

  ngOnInit() {
    this.grantCallId = this.result.grantCall.grantCallId;
    this.$subscriptions.push(this._scoringService.fetchAllScoringCriteria({ 'grantCallId': this.grantCallId }).subscribe(data => {
      this.scoringCriteriaObject = data;
    }));
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  collapseCriteria(id, flag) {
    this.collapseScoringCriteria = {};
    this.collapseScoringCriteria[id] = !flag;
}

}
