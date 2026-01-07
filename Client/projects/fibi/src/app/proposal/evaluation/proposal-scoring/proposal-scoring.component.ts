import {Component, OnInit} from '@angular/core';
import {CommonService} from '../../../common/services/common.service';
import {EvaluationService} from '../evaluation.service';
import {ElasticConfigService} from '../../../common/services/elastic-config.service';
import {ProposalService} from '../../services/proposal.service';
import {DataStoreService} from '../../services/data-store.service';
import {AutoSaveService} from '../../../common/services/auto-save.service';
import {Router} from '@angular/router';
import {fileDownloader} from '../../../common/utilities/custom-utilities';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-proposal-scoring',
    templateUrl: './proposal-scoring.component.html',
    styleUrls: ['./proposal-scoring.component.css']
})
export class ProposalScoringComponent implements OnInit {

    scoreFullData: any = [];
    criteriaTab: any;
    header: any = {};
    reviewerScores: any = {};
    reviewerScoreCount: any = {};
    reviewerComments: any = {};
    criteriaTotal: any = {};
    criteriaPersonCount: any = {};
    totalAvg: any;
    totalScore: any;
    result: any = {};
    sumOfReviewerScores: any = {};
    $subscriptions: Subscription[] = [];
    dataDependencies = ['proposal'];

    constructor(public _commonService: CommonService,
                public _evaluationService: EvaluationService,
                private _elasticConfig: ElasticConfigService,
                public _proposalService: ProposalService,
                private _dataStore: DataStoreService,
                private _autoSaveService: AutoSaveService,
                private _router: Router) {
    }

    ngOnInit() {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        this.getScoringDetails();
    }

    private getDataFromStore() {
        this.result = this._dataStore.getData(this.dataDependencies);
    }
    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe((dependencies: string[]) => {
                if (dependencies.some((dep) => this.dataDependencies.includes(dep))) {
                    this.getDataFromStore();
                }
            })
        );
    }


    getScoringDetails() {
        this.$subscriptions.push(this._evaluationService.getScoreByProposalId({'proposalId': this.result.proposal.proposalId})
            .subscribe((data: any) => {
                this.scoreFullData = Object.keys(data).length ? data : null;
                if (this.scoreFullData) {
                    this.setDefaultValues();
                    Object.keys(this.scoreFullData).forEach((criteria) => {
                        this.sortReviewerInCriteriaById(criteria);
                        this.scoreFullData[criteria].forEach((reviewer) => {
                            if (reviewer.person.isPersonCanScore) {
                                this.getReviewerScoresOfEachCriteria(reviewer);
                                this.header[reviewer.person.personId] = reviewer.person.personName;
                                this.getSumOfReviewersScore(reviewer);
                                this.getReviewerScoreCount(reviewer);
                                this.getCriteriaTotal(reviewer, criteria);
                            }
                        });
                    });
                    this.header = Object.keys(this.header).length ? this.header : null;
                    this.getTotalAvgOfReviewers();
                }
            }));
    }

    getTotalAvgOfReviewers() {
        let sumofReviewerTotalScore = 0;
        let totalSumOfReviewerAvg = 0;
        let avgCount = 0;
        Object.keys(this.sumOfReviewerScores).forEach((reviewerId) => {
            if (this.sumOfReviewerScores[reviewerId] || this.sumOfReviewerScores[reviewerId] == 0) {
                totalSumOfReviewerAvg += this.sumOfReviewerScores[reviewerId] / this.reviewerScoreCount[reviewerId];
                sumofReviewerTotalScore += this.sumOfReviewerScores[reviewerId];
                avgCount += 1;
            }
        });
        this.totalAvg = avgCount ? (totalSumOfReviewerAvg / avgCount).toFixed(2) : '-';
        this.totalScore = avgCount ? (sumofReviewerTotalScore / avgCount).toFixed(2) : '-';
    }

    getCriteriaTotal(reviewer: any = {}, criteria: string): void {
        this.criteriaTotal[criteria] =
            (this.criteriaTotal[criteria] || this.criteriaTotal[criteria] === 0) ?
                this.criteriaTotal[criteria] : null;
        if (reviewer.person.score || reviewer.person.score === 0) {
            this.criteriaTotal[criteria] = this.criteriaTotal[criteria] + reviewer.person.score;
            this.criteriaPersonCount[criteria] = (this.criteriaPersonCount[criteria] ? this.criteriaPersonCount[criteria] + 1 : 1);
        }
    }

    getReviewerScoreCount(reviewer) {
        this.reviewerScoreCount[reviewer.person.personId] = this.reviewerScoreCount[reviewer.person.personId] || 0;
        if (reviewer.person.score || reviewer.person.score == 0) {
            this.reviewerScoreCount[reviewer.person.personId] = this.reviewerScoreCount[reviewer.person.personId] + 1;
        }
    }

    getSumOfReviewersScore(reviewer) {
        this.sumOfReviewerScores[reviewer.person.personId] = (this.sumOfReviewerScores[reviewer.person.personId] || this.sumOfReviewerScores[reviewer.person.personId] == 0) ?
            this.sumOfReviewerScores[reviewer.person.personId] : null;
        if (reviewer.person.score || reviewer.person.score == 0) {
            this.sumOfReviewerScores[reviewer.person.personId] = this.sumOfReviewerScores[reviewer.person.personId] + reviewer.person.score;
        }
    }

    getReviewerScoresOfEachCriteria(reviewer) {
        this.reviewerScores[reviewer.scoringCriteriaCode + reviewer.person.personId] = (reviewer.person.score || reviewer.person.score == 0) ? reviewer.person.score : '-';
    }

    sortReviewerInCriteriaById(criteria) {
        this.scoreFullData[criteria].sort((reviewerOne, reviewerTwo) => this.compare(reviewerOne, reviewerTwo));
    }

    compare(reviewerOne, reviewerTwo): number {
        if (reviewerOne.person.personId < reviewerTwo.person.personId) {
            return -1;
        }
        if (reviewerOne.person.personId > reviewerTwo.person.personId) {
            return 1;
        }
        return 0;
    }

    setDefaultValues() {
        this.criteriaTab = 'SCORE';
        this.reviewerScores = {};
        this.header = {};
        this.sumOfReviewerScores = {};
        this.reviewerScoreCount = {};
        this.criteriaTotal = {};
        this.criteriaPersonCount = {};
    }

    showReviewerComment(reviewerComment) {
        this.reviewerComments = reviewerComment;
    }

    downloadAttachments(attachment) {
        if (attachment.workflowReviewerAttmntsId != null) {
            this.$subscriptions.push(this._evaluationService.downloadWorkflowReviewerAttachment(attachment.workflowReviewerAttmntsId)
                .subscribe(data => {
                    fileDownloader(data, attachment.fileName);
                }));
        } else {
            const URL = 'data:' + attachment.mimeType + ';base64,' + attachment.attachment;
            const a = document.createElement('a');
            a.href = URL;
            a.download = attachment.fileName;
            document.body.appendChild(a);
            a.click();
        }
    }

}
