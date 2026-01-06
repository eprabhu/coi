import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ScoringCriteriaService } from '../../grant-call/scoring-criteria/scoring-criteria.service';
import { ScoringService } from './scoring.service';

declare var $: any;
@Component({
    selector: 'app-scoring-ext',
    templateUrl: './scoring.component.html',
    styleUrls: ['./scoring.component.css']
})
export class ScoringComponent implements OnInit, OnDestroy {

    @Input() extReviewID: any;
    scoringCriteriaList: any = [];
    scoringCriteriaObject: any = {};
    $subscriptions: Subscription[] = [];
    collapseScoringCriteria: any = {};

    constructor(private _route: ActivatedRoute,
        public _scoringService: ScoringService) { }

    ngOnInit() {
        this.fetchScoringCriteria();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    fetchScoringCriteria() {
        this.$subscriptions.push(this._scoringService.getScoringCriteria(this.extReviewID)
            .subscribe(data => {
                this.scoringCriteriaObject = data;
            }));
    }

    collapseCriteria(id, flag) {
        this.collapseScoringCriteria = {};
        this.collapseScoringCriteria[id] = !flag;
    }

}
