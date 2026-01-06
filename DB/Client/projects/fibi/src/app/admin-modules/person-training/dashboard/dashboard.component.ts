import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import { PersonTrainingService } from '../person-training.service';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { CommonService } from '../../../common/services/common.service';
import {
    EndpointOptions,
    PreviousSearchObj,
    Training,
    TrainingDashboardRequest,
    TrainingSearch,
    TrainingVO
} from '../person-training.interface';
import { getEndPointOptionsForTraining } from '../../../common/services/end-point.config';
import { Subject, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { pageScroll } from '../../../common/utilities/custom-utilities';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

    tempTrainingSearched;
    trainingSearchOptions: EndpointOptions;
    personType: 'employee' | 'non-employee' = 'employee';
    elasticPlaceHolder = 'Search for an Employee Name';
    trainingName: string;
    options: any = {};
    selectedPerson: any = {};
    personDetail: any = {};
    paginatedTrainingList: Training[] = [];
    clearTrainingField: any = 'false';
    clearPersonField: any = 'false';
    showPersonElasticBand = false;
    showPopup = false;
    requestObject = new TrainingDashboardRequest();
    isSearch = false;
    paginationData = {
        limit: 20,
        page_number: 1,
    };
    hasEditRight = false;
    sortCountObj: any = {personName: 0, trainingDescription: 0, followupDate: 0};
    sortMap: any = {};
    $trainingList = new Subject();
    $subscriptions: Subscription[] = [];

    constructor(private _elasticConfig: ElasticConfigService,
                private _personTrainingService: PersonTrainingService,
                private _router: Router,
                private _route: ActivatedRoute,
                private _commonService: CommonService) {
    }

    async ngOnInit() {
        await this.getPermissions();
        this.setInitialElasticValues();
        this.loadTrainingList();
        this.getPreviousSearchIfAvailable();
    }

    async getPermissions() {
        this.hasEditRight = await this._commonService.checkPermissionAllowed('MAINTAIN_TRAINING');
    }

    getPreviousSearchIfAvailable() {
        if (this._personTrainingService.previousSearch.isSearched) {
            const {searchRequestObj, personType, person, training} = this._personTrainingService.previousSearch;
            this.requestObject = searchRequestObj;
            this.requestObject.currentPage = 1;
            this.personType = personType || 'employee';
            this.changePersonType(this.personType);
            this.selectPersonElasticResult(person);
            this.selectedTraining(training);
            this.$trainingList.next();
        } else {
            this.getParamPersonIfAvailable();
        }
    }

    saveSearchRequestInService() {
        this._personTrainingService.previousSearch = {
            searchRequestObj: this.requestObject, isSearched: true, training: this.tempTrainingSearched,
            person: this.selectedPerson, personType: this.personType
        };
    }

    loadTrainingList() {
        this.$subscriptions.push(this.$trainingList
            .pipe(switchMap(() => this._personTrainingService.loadPersonTrainingList(this.requestObject)))
            .subscribe((data: TrainingVO) => {
            this.paginatedTrainingList = data.trainings == null ? [] : data.trainings;
            this.paginationData.page_number = data.totalResult;
            this.isSearch = true;
        }, _err => this.errorMessage('Something Went wrong! please try again')));
    }

    /**
     * @param  {} type- Change the elastic based on type
     */
    changePersonType(personType) {
        this.selectedPerson = {};
        this.requestObject.personId = null;
        if (personType === 'employee') {
            this.elasticPlaceHolder = 'Search for an Employee Name';
            this.options = this._elasticConfig.getElasticForPerson();
        } else {
            this.elasticPlaceHolder = 'Search for an Non-Employee Name';
            this.options = this._elasticConfig.getElasticForRolodex();
        }
    }

    /**
     * @param  {} personDetails - person chosen from the e
     * elastic search
     */
    selectPersonElasticResult(personDetails) {
        this.showPersonElasticBand = personDetails != null;
        this.selectedPerson = personDetails;
        if (this.selectedPerson != null) {
            this.requestObject.personId = this.options.type === 'person' ? personDetails.prncpl_id : personDetails.rolodex_id;
            this.options.defaultValue = this.selectedPerson.full_name;
        } else {
            this.options.defaultValue = '';
            this.requestObject.personId = null;
        }
    }

    selectedTraining(training: TrainingSearch) {
        if (training && training.trainingCode) {
            this.tempTrainingSearched = training;
            this.clearTrainingField = new String('false');
            this.trainingSearchOptions.defaultValue = training.description;
            this.requestObject.trainingCode = training.trainingCode;
            return;
        }
        this.tempTrainingSearched = null;
        this.trainingSearchOptions.defaultValue = '';
        this.requestObject.trainingCode = null;
    }

    /* load the training details on advanced search */
    getAdvanceSearchResult() {
        this.saveSearchRequestInService();
        this.$trainingList.next();
    }

    /* Clear the advanced search parameters */
    clearAdvancedSearch() {
        this.setInitialElasticValues();
        this.personType = 'employee';
        this.selectedPerson = {};
        this.requestObject.trainingCode = null;
        this.requestObject.personId = null;
        this.trainingName = '';
        this.isSearch = false;
        this._personTrainingService.previousSearch = new PreviousSearchObj();
        this.requestObject = new TrainingDashboardRequest();
    }

    /**
     * @param  {} trainingDetail - training object viewed or edited
     * @param  {} mode- species whether in edit or view mode
     */
    showTrainingDetails(trainingDetail: Training) {
        this._router.navigate(['/fibi/training-maintenance/person-detail'],
            {queryParams: {personTrainingId: trainingDetail.personTrainingId}});
    }

    /**
     * @param  {} trainingDetail - training object to be deleted
     */
    deleteTrainingDetails(trainingDetail) {
        this.personDetail = trainingDetail;
        this.showPopup = true;
    }

    /* delete the training if it is confirmed */
    confirmDelete() {
        this.$subscriptions.push(this._personTrainingService
            .deletePersonTraining(this.personDetail.personTrainingId)
            .subscribe((res: string) => {
                if (res === 'success') {
                    this.$trainingList.next();
                    this.successMessage('Training deleted successfully.');
                }
            }, _err => this.errorMessage('Something went wrong. Please try again.')));
    }

    getParamPersonIfAvailable() {
        const personId = this._route.snapshot.queryParams['personId'];
        const fullName = this._route.snapshot.queryParams['name'];
        if (personId && fullName) {
            const person = {prncpl_id: personId, full_name: fullName};
            this.selectPersonElasticResult(person);
            this.getAdvanceSearchResult();
        }
    }

    /**
     * @param  {} pageNumber - page selected to paginate
     */
    trainingListPerPage(pageNumber: number) {
        this.requestObject.currentPage = pageNumber;
        this.$trainingList.next();
        pageScroll('topOfTrainingList');
    }

    sortResult(sortFieldBy: string) {
        this.sortCountObj[sortFieldBy]++;
        this.requestObject.sortBy = sortFieldBy;
        if (this.sortCountObj[sortFieldBy] < 3) {
            if (this.requestObject.sortBy === sortFieldBy) {
                this.sortMap[sortFieldBy] = !this.sortMap[sortFieldBy] ? 'asc' : 'desc';
            }
        } else {
            this.sortCountObj[sortFieldBy] = 0;
            delete this.sortMap[sortFieldBy];
        }
        this.requestObject.sort = this.sortMap;
        this.$trainingList.next();
    }

    private setInitialElasticValues() {
        this.trainingSearchOptions = getEndPointOptionsForTraining();
        this.options = this._elasticConfig.getElasticForPerson();
    }

    private successMessage(message: string) {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, message);
    }

    private errorMessage(message: string) {
        this._commonService.showToast(HTTP_ERROR_STATUS, message);
    }

}

