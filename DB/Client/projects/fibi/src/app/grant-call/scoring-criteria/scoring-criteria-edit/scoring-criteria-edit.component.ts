import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ScoringCriteriaService } from '../scoring-criteria.service';
import { CommonService } from '../../../common/services/common.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { grantCallScoringCriteria } from '../../grant-call-interfaces';

@Component({
  selector: 'app-scoring-criteria-edit',
  templateUrl: './scoring-criteria-edit.component.html',
  styleUrls: ['./scoring-criteria-edit.component.css']
})
export class ScoringCriteriaEditComponent implements OnInit, OnDestroy {

  @Input() result: any;
  clearScoringCriteria = new String('false');
  grantCallScoringCriterias: any = [];
  grantCallId: any;
  addedCriterias: any = null;
  scoringCriteriaList: any = [];
  warningMessage = new Map();
  $subscriptions: Subscription[] = [];
  deleteScoringCriteriaObject: grantCallScoringCriteria;
  deleteIndex: number;
  collapseScoringCriteria: any = {};

  constructor(private _scoringService: ScoringCriteriaService, private _commonService: CommonService, private _route: ActivatedRoute) { }

  ngOnInit() {
    this.grantCallId = this.result.grantCall.grantCallId;
    this.$subscriptions.push(this._scoringService.fetchAllScoringCriteria({ 'grantCallId': parseInt(this.grantCallId, 10) })
      .subscribe((data: any) => {
        this.grantCallScoringCriterias = data.grantCallScoringCriterias;
        this.scoringCriteriaList = data.scoringCriteria;
      }));
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  addScoringCriteria() {
    if (this.addedCriterias !== 'null') {
      if (this.addedCriterias !== null && !this.grantCallScoringCriterias
        .find(type => type.scoringCriteriaTypeCode === this.addedCriterias.scoringCriteriaTypeCode)
        && this.grantCallScoringCriterias != null) {
        this.grantCallScoringCriterias.push(
          {
            'scoringCriteria': this.addedCriterias,
            'grantCallId': parseInt(this.result.grantCall.grantCallId, 10),
            'scoringCriteriaTypeCode': this.addedCriterias.scoringCriteriaTypeCode,
            'updateTimestamp': Date.now(),
            'updateUser': this.addedCriterias.updateUser
          });
        this.saveOrUpdateGrantCallScoringCriteria();
        this.warningMessage.clear();
      } else {
        this.validateScoringCrieteriaField();
      }
      this.addedCriterias = null;
    }
  }

  validateScoringCrieteriaField() {
    if (this.grantCallScoringCriterias.length === 0 || !this.addedCriterias || this.addedCriterias === 'null') {
      this.warningMessage.set('scoringCrieteriaWarningText', 'Please select a Scoring Criteria.');
    } else {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'This Criteria is already added.');
    }
  }

  deleteScoringCriteria(scoringCriteria: grantCallScoringCriteria, index) {
    if (scoringCriteria.grantScoreCriteriaId !== undefined) {
      const saveUpdate = { 'grantScoringCriteriaId': scoringCriteria.grantScoreCriteriaId };
      this.$subscriptions.push(this._scoringService.deleteGrantCallScoringCriteria(saveUpdate).subscribe((data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Scoring Criteria deleted successfully.');
        this.grantCallScoringCriterias.splice(index, 1);
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Scoring Criteria failed. Please try again.');
      }));
    } else {
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Scoring Criteria deleted successfully.');
      this.grantCallScoringCriterias.splice(index, 1);
    }
  }

  saveOrUpdateGrantCallScoringCriteria() {
    const saveUpdate = { 'grantCallScoringCriterias': this.grantCallScoringCriterias };
    this.$subscriptions.push(this._scoringService.saveOrUpdateGrantCallScoringCriteria(saveUpdate).subscribe((data: any) => {
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Scoring Criteria saved successfully.');
      this.grantCallScoringCriterias = data.grantCallScoringCriterias;
    }, err => {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving Scoring Criteria failed. Please try again.');
    }));
  }

  collapseCriteria(id, flag) {
    this.collapseScoringCriteria = {};
    this.collapseScoringCriteria[id] = !flag;
}

}
