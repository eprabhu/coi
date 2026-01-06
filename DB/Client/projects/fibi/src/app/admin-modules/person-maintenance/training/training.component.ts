import { Component, OnInit } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { TrainingDashboardRequest, TrainingVO } from '../../person-training/person-training.interface';
import { Subject, Subscription } from 'rxjs';
import { TrainingService } from './training.service';
import { HTTP_ERROR_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { pageScroll } from '../../../common/utilities/custom-utilities';
import {PersonMaintenanceService} from '../person-maintenance.service';

@Component({
    selector: 'app-training',
    templateUrl: './training.component.html',
    styleUrls: ['./training.component.css'],
    providers: [TrainingService]
})
export class TrainingComponent implements OnInit {

    personId = this._route.snapshot.queryParams['personId'];
    requestObject = new TrainingDashboardRequest(this.personId);
    pagination: any = {};
    personTrainings = [];
    sort: any = {trainingDescription: 0, followupDate: 0};
    sortMap: any = {};

    $trainingList = new Subject();
    $subscriptions: Subscription[] = [];

    constructor(private _personService: PersonMaintenanceService,
                private _trainingService: TrainingService,
                private _commonService: CommonService,
                private _route: ActivatedRoute) {
    }

    ngOnInit() {
        this._personService.isPersonEditOrView = true;
        this.loadPersonIfMissing();
        this.loadPersonTrainingList();
        this.$trainingList.next();
    }

    loadPersonIfMissing() {
        if (!this._personService.personDisplayCard && this.personId) {
            this.$subscriptions.push(this._personService.getPersonData(this.personId).subscribe((res: any) => {
                this._personService.personDisplayCard = res.person;
            }));
        }
    }

    loadPersonTrainingList() {
        this.$subscriptions.push(this.$trainingList
            .pipe(switchMap(() => this._trainingService.loadPersonTrainingList(this.requestObject)))
            .subscribe((data: TrainingVO) => {
                this.personTrainings = data.trainings || [];
                this.pagination.page_number = data.totalResult;
            }, _err => this.errorMessage('Something Went wrong! please try again')));
    }

    trainingListPerPage(pageNumber: number) {
        this.requestObject.currentPage = pageNumber;
        this.$trainingList.next();
        pageScroll('topOfTrainingList');
    }

    sortResult(sortFieldBy: string) {
        this.sort[sortFieldBy]++;
        this.requestObject.sortBy = sortFieldBy;
        if (this.sort[sortFieldBy] < 3) {
            if (this.requestObject.sortBy === sortFieldBy) {
                this.sortMap[sortFieldBy] = !this.sortMap[sortFieldBy] ? 'asc' : 'desc';
            }
        } else {
            this.sort[sortFieldBy] = 0;
            delete this.sortMap[sortFieldBy];
        }
        this.requestObject.sort = this.sortMap;
        this.$trainingList.next();
    }

    private errorMessage(message: string) {
        this._commonService.showToast(HTTP_ERROR_STATUS, message);
    }

}
