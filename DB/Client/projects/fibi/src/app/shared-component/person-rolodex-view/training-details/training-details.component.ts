import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { CommonService } from '../../../common/services/common.service';
import { PersonRolodexViewService } from '../person-rolodex-view.service';
import { TrainingDashboardRequest } from '../person-rolodex-view-interfce';
import { HTTP_ERROR_STATUS } from '../../../app-constants';

@Component({
	selector: 'app-training-details',
	templateUrl: './training-details.component.html',
	styleUrls: ['./training-details.component.css']
})
export class TrainingDetailsComponent implements OnInit, OnDestroy {
	@Input() trainingStatus;
	@Input() personRolodexId;
	personCertificationHistory = [];
	canViewTrainingDetails = false;
	$subscriptions: Subscription[] = [];
	isMaintainTraining = false;


	constructor(public __rolodexViewServices: PersonRolodexViewService, public _commonService: CommonService) { }

	async ngOnInit() {
		await this.getPermissions();
		this.loadTrainingDetails();
	}

	loadTrainingDetails() {
		this.canViewTrainingDetails = this.hasTrainingRightOrIsLoggedInUser(this.personRolodexId);
		const requestObj = new TrainingDashboardRequest(this.personRolodexId);
		this.$subscriptions.push(this.__rolodexViewServices.loadPersonTrainingList(
			new TrainingDashboardRequest(this.personRolodexId)).subscribe((data: any) => {
				this.personCertificationHistory = data.trainings;
			},
			error => this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching training details failed. Please try again.')));
	}
	async getPermissions() {
		this.isMaintainTraining = await this._commonService.checkPermissionAllowed('MAINTAIN_TRAINING');
	}

	hasTrainingRightOrIsLoggedInUser(id) {
		return this.isMaintainTraining ||
			(id === this._commonService.getCurrentUserDetail('personID'));
	}

	ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }
}
