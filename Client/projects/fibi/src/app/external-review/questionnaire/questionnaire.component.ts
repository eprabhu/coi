import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { ExternalReviewService } from '../external-review.service';
import { QuestionnaireService } from './questionnaire.service';
import { CommonService } from './../../common/services/common.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';

declare var $: any;
@Component({
    selector: 'app-questionnaire',
    templateUrl: './questionnaire.component.html',
    styleUrls: ['./questionnaire.component.css']
})
export class QuestionnaireComponent implements OnInit, OnDestroy {

    @Input() extReviewID: any;
    @Input() isEditMode: boolean;

    selectedQuestionnaire = 'null';
    selectedIndex: number = null;
    activeQuestionnaire: any;
    questionnaireList = [];
    applicableQuestionnaire = [];
    $subscriptions: Subscription[] = [];

    constructor(public _questService: QuestionnaireService,
        public _reviewService: ExternalReviewService,
        public _commonService: CommonService) { }

    ngOnInit() {
        this.setReviewQuestionnaire();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    setReviewQuestionnaire() {
        this.$subscriptions.push(forkJoin(this.getApplicableQuestionnaire(),
            this.fetchReviewQuestionnaire()).subscribe((data: any) => {
                this.applicableQuestionnaire = data[0].applicableQuestionnaire;
                this.questionnaireList = data[1];
                if (this.questionnaireList.length) {
                    this.activeQuestionnaire = this.questionnaireList[0].questionnaireDetail;
                    this.selectedIndex = 0;
                    this.filterApplicableQuestionnaire();
                }
            }));
    }

    getApplicableQuestionnaire() {
        return this._questService.getApplicableQuestionnaire(
            {
                'moduleItemCode': 22,
                'moduleItemKey': this._reviewService.moduleDetails.moduleItemKey,
                'moduleSubItemCode': this._reviewService.moduleDetails.moduleItemCode,
                'moduleSubItemKey': '',
            });
    }

    fetchReviewQuestionnaire() {
        return this._questService.fetchReviewQuestionnaire(this.extReviewID);
    }

    filterApplicableQuestionnaire() {
        this.questionnaireList.forEach(element => {
            const QUESTIONNAIRE = this.applicableQuestionnaire.find(que => element.questionnaireNumber === que.QUESTIONNAIRE_NUMBER);
            if (QUESTIONNAIRE) {
                QUESTIONNAIRE.extReviewQuestionnaireId = element.extReviewQuestionnaireId;
            }
        });
    }

    saveReviewQuestionnaire() {
        const QUESTIONNAIRE = this.findQuestionnaireObj();
        this.$subscriptions.push(this._questService.saveReviewQuestionnaire(
            {
                extReviewID: this.extReviewID,
                questionnaireNumber: QUESTIONNAIRE.QUESTIONNAIRE_NUMBER
            }).subscribe((data: any) => {
                QUESTIONNAIRE.extReviewQuestionnaireId = data.extReviewQuestionnaireId;
                this.questionnaireList.push({
                    questionnaireDetail: QUESTIONNAIRE,
                    extReviewQuestionnaireId: data.extReviewQuestionnaireId,
                    extReviewID: data.extReviewID,
                    questionnaireNumber: data.questionnaireNumber
                });
                this.setLastQuestionnaireAsActive();
                this.selectedQuestionnaire = null;
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Questionnaire added successfully.');
            },
                err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Adding Questionnaire failed. Please try again.');
                }));
    }

    findQuestionnaireObj(): any {
        return this.applicableQuestionnaire.find(element =>
            element.QUESTIONNAIRE_NUMBER == this.selectedQuestionnaire);
    }

    private setLastQuestionnaireAsActive() {
        if (this.questionnaireList.length > 0) {
            this.selectedIndex = this.questionnaireList.length - 1;
            this.activeQuestionnaire = this.questionnaireList[this.selectedIndex].questionnaireDetail;
        }
    }

    deleteReviewQuestionnaire(index, extReviewQuestionnaireId): void {
        this.$subscriptions.push(this._questService
            .deleteReviewQuestionnaire(extReviewQuestionnaireId).subscribe((_res) => {
                const DELETED_QUESTIONNAIRE = this.applicableQuestionnaire.find(ele =>
                    ele.extReviewQuestionnaireId === this.questionnaireList[index].extReviewQuestionnaireId);
                DELETED_QUESTIONNAIRE.extReviewQuestionnaireId = null;
                this.questionnaireList.splice(index, 1);
                this.setLastQuestionnaireAsActive();
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Questionnaire deleted successfully.');
            },
                err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Questionnaire failed. Please try again.');
                }));
    }

}
