import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { PersonDetailsModalService } from '../person-details-modal.service';
import { TrainingDashboardRequest } from '../person-details-modal.interface';
import { CommonService } from '../../../common/services/common.service';
import { HTTP_ERROR_STATUS } from '../../../app-constants';
import { PersonTrainingDetails } from '../../../common/services/coi-common.interface';

@Component({
    selector: 'app-Training-details',
    templateUrl: './Training-details.component.html',
    styleUrls: ['./Training-details.component.scss']
})
export class TrainingDetailsComponent implements OnInit {
    @Input() personId: string = '';
    $subscriptions: Subscription[] = [];
    trainingDetails: PersonTrainingDetails[] = [];
    isShowScoreColumn = false;
    isShowActionColumn = false;

    constructor(private _personDetailService: PersonDetailsModalService, private _commonService: CommonService) { }

    ngOnInit() {
        this.isShowActionColumn = this._commonService.getAvailableRight(['MANAGE_TRAINING_ACTIONS']);
        this.loadTrainingDetails();
    }

    private loadTrainingDetails(): void {
        const REQUEST_OBJECT = new TrainingDashboardRequest(this.personId);
        this.$subscriptions.push(this._personDetailService.loadPersonTrainingList(REQUEST_OBJECT).subscribe((res: any) => {
            this.trainingDetails = res.trainings;
            this.checkIfScoreExist();
        },
        error => this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching training details failed. Please try again.')));
    }

    openInFibi(personTrainingId: number): void {
        const url = this._commonService.fibiApplicationUrl + `#/fibi/training-maintenance/person-detail?personTrainingId=${personTrainingId}`;
        window.open(url);
    }

    private checkIfScoreExist(): void {
        this.isShowScoreColumn = this.trainingDetails?.some(training => training.score !== null && training.score !== undefined);   
    }

}
