import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonDataService } from '../services/common-data.service';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../../common/services/common.service';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../app-constants';
import { AwardService } from '../services/award.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';

@Component({
	selector: 'app-award-questionnaire',
	template: `<div *ngIf="_commonDataService.awardSectionConfig['124'].isActive">
  <app-view-questionnaire-list [configuration] = "configuration"
  (QuestionnaireSaveEvent)= "getSaveEvent($event)"
  (QuestionnaireEditEvent)="markQuestionnaireAsEdited($event)">
  </app-view-questionnaire-list></div>`,
	styleUrls: ['./award-questionnaire.component.css']
})
export class AwardQuestionnaireComponent implements OnInit, OnDestroy {

	configuration: any = {
		moduleItemCode: 1,
		moduleSubitemCodes: [0],
		moduleItemKey: '',
		moduleSubItemKey: 0,
		actionUserId: this._commonService.getCurrentUserDetail('personID'),
		actionPersonName: this._commonService.getCurrentUserDetail('fullName'),
		enableViewMode: false,
		isChangeWarning: true,
		isEnableVersion: true,
		questionnaireMode: null
	};
	$subscriptions: Subscription[] = [];
	awardData: any;
	subModules: any = [];

	constructor(public _commonDataService: CommonDataService, private _awardService: AwardService,
		private _activatedRoute: ActivatedRoute, public _commonService: CommonService) { }

	ngOnInit() {
		this.getAwardGeneralData();
	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}

	private getAwardGeneralData() {
		this.$subscriptions.push(this._commonDataService.awardData.subscribe(async (data: any) => {
			if (data && data.award.awardId) {
				this.awardData = data;
				this.configuration.enableViewMode = this._commonDataService.getSectionEditableFlag('124') ? false : true;
				if (this.awardData.award.awardSequenceStatus === 'ACTIVE' || (this.awardData.award.awardVariationTypeCode === '7')) {
					await this.getSubModuleCodeBasedOnAwardNumber();
				} else {
					this.fetchSubModuleCode();
					this.configuration.moduleItemKey = this._activatedRoute.snapshot.queryParamMap.get('awardId');
					this.configuration = Object.assign({}, this.configuration);
				}
			}
		}));
	}

	private getSubModuleCodeBasedOnAwardNumber(): any {
		this.$subscriptions.push(this._awardService.getSubModuleCodeBasedOnAwardNumber(this.awardData.award.awardNumber)
			.subscribe((result: any) => {
				this.subModules = result;
				this.fetchSubModuleCode();
				this.configuration.moduleItemKey = this._activatedRoute.snapshot.queryParamMap.get('awardId');
				this.configuration = Object.assign({}, this.configuration);
			}));
	}

	private fetchSubModuleCode() {
		switch (this.awardData.award.awardVariationTypeCode) {
			case '7': this.setClosureQuestionnaire();
				break;
			case '21': this.setSubmitClosureRequestQuestionnaire();
				break;
		}
		if (this.awardData.award.awardSequenceStatus === 'ACTIVE') {
			this.configuration.moduleSubitemCodes = this.subModules;
			if (this.subModules.includes(6) && !this.subModules.includes(5)) {
				this.configuration.moduleSubitemCodes.push(5);
				this.configuration.moduleSubitemCodes.sort((a, b) => a - b);
			}
		}
	}

	private setClosureQuestionnaire() {
		this.configuration.moduleSubitemCodes = [0, 5, 6];
		this.configuration.enableViewMode = this._commonDataService.getSectionEditableFlag('124') ? this.setClosureSubModule() : true;
	}

	private setClosureSubModule() {
		if (this.awardData.award.awardSequenceStatus === 'PENDING' && this.subModules.includes(6)) {
			this.subModules = this.subModules.filter(item => item !== 6);
		}
		return this.subModules;
	}

	private setSubmitClosureRequestQuestionnaire() {
		this.configuration.moduleSubitemCodes = [0, 5];
		this.configuration.enableViewMode = this._commonDataService.getSectionEditableFlag('124') ? [0] : true;
	}

	public getSaveEvent(event) {
		event ? this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Award Questionnaire saved successfully.') :
			this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving Award Questionnaire failed. Please try again.');
	}

	markQuestionnaireAsEdited(changeStatus: boolean): void {
		this._commonDataService.isAwardDataChange = changeStatus;
	}
}
