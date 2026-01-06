import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { getEndPointOptionsForScopus } from '../../../common/services/end-point.config';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { CommonDataService } from '../../services/common-data.service';
import { ProjectOutcomeService } from '../project-outcome.service';
import { AwardScopusList, ScopusDetails } from './scopus';

@Component({
	selector: 'app-scopus',
	templateUrl: './scopus.component.html',
	styleUrls: ['./scopus.component.css']
})
export class ScopusComponent implements OnInit, OnDestroy {

	isScopusEndPointEnabled = false;
	isScopusSelected = false;
	scopusSearchOptions: any = {};
	selectedScopus: AwardScopusList;
	awardScopusList: any[];
	scopusWarningText: string;
	clearScopusField: String;
	awardScopusId;
	deleteIndex: number;
	scopusDetails: ScopusDetails;
	$subscriptions: Subscription[] = [];
	isSaving = false;
	isShowCollapse: Boolean[] = [];

	constructor(public _outcomeService: ProjectOutcomeService,
         private _commonService: CommonService,
          private _commonData: CommonDataService ) { }

	ngOnInit() {
		this.scopusSearchOptions = getEndPointOptionsForScopus();
		this.getScopusData();
	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}

	getScopusData() {
		this.$subscriptions.push(this._outcomeService.loadAllAwardScopus({
			'awardId': this._outcomeService.awardData.awardId
		}).subscribe((data: any) => {
			this.awardScopusList = data.awardScopuses;
			this.isScopusEndPointEnabled = this.awardScopusList.length ? true : false;
		}));
	}

	/**
	 * @param  {} event
	 * assign emitted response from endpoint search to scopus Object
	 */
	onScopusSelect(event) {
		this._commonData.isAwardDataChange = true;
		if (event) {
			this.selectedScopus = event;
			this.isScopusSelected = true;
		} else {
			this.isScopusSelected = false;
			this.scopusWarningText = null;
		}
	}

	setScopusObject() {
		let awardScopus: any = {};
		awardScopus.awardId = this._outcomeService.awardData.awardId;
		awardScopus.awardNumber = this._outcomeService.awardData.awardNumber;
		awardScopus.scopusId = this.selectedScopus.scopusId;
		awardScopus.scopus = this.selectedScopus;
		awardScopus.sequenceNumber = this._outcomeService.awardData.sequenceNumber;
		awardScopus.updateUser = this._commonService.getCurrentUserDetail('userName');
		return awardScopus;
	}

	duplicationCheckForScopus() {
		return !!this.awardScopusList.find(element =>
			element.scopusId === this.selectedScopus.scopusId);
	}

	linkScopus() {
		if (!this.duplicationCheckForScopus() && !this.isSaving) {
			this.isSaving = true;
			this.$subscriptions.push(this._outcomeService.linkAwardScopus(this.setScopusObject()).subscribe((data: AwardScopusList) => {
				this.awardScopusList.push(data);
				this.selectedScopus = null;
				this.isScopusSelected = false;
				this.isScopusEndPointEnabled = true;
				this.clearScopusSearchField();
				this.isScopusEndPointEnabled = this.awardScopusList.length ? true : false;
				this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Scopus linked successfully.');
				this.scopusWarningText = null;
                this._commonData.isAwardDataChange = false;
				this.isSaving = false;
			}, err => { this.isSaving = false;
				this._commonService.showToast(HTTP_ERROR_STATUS, 'Linking Scopus failed. Please try again'); }));
		} else {
			this.scopusWarningText = 'Scopus already linked. Please use a different scopus.';
		}
	}
	/**
	 * @param  {} index
	 * @param  {} scopusID
	 * Delete Scopus w.r.t the Scopus id
	 */
	deleteScopus(index: number, scopusID: string) {
		this.$subscriptions.push(this._outcomeService.deleteAwardScopus({
			'awardScopusId': scopusID
		}).subscribe(data => {
			this.clearScopusSearchField();
			this.awardScopusList.splice(index, 1);
			this.isScopusEndPointEnabled = this.awardScopusList.length ? true : false;
			this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Scopus deleted successfully.');
			this.scopusWarningText = null;
		}, err => {
			this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Scopus failed. Please try again.');
		}));
	}

	/**
	 * sets default value and clears search field of Scopus
	 */
	clearScopusSearchField() {
		this.scopusSearchOptions.defaultValue = '';
		this.selectedScopus = null;
		this.clearScopusField = new String('true');
	}

}
