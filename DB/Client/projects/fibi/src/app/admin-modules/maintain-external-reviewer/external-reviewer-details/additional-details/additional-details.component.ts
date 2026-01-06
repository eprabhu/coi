import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../../../app-constants';
import { coiWithPerson, ExternalReviewerExt, Person } from '../../reviewer-maintenance.interface';
import { ExtReviewerMaintenanceService } from '../../external-reviewer-maintenance-service';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { CommonService } from '../../../../common/services/common.service';
import { getEndPointOptionsForExtReviewerKeyWords } from '../../../../common/services/end-point.config';
import { ElasticConfigService } from '../../../../common/services/elastic-config.service';
import { deepCloneObject } from '../../../../common/utilities/custom-utilities';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-additional-details',
    templateUrl: './additional-details.component.html',
    styleUrls: ['./additional-details.component.css']
})
export class AdditionalDetailsComponent implements OnInit, OnDestroy {
    $subscriptions: Subscription[] = [];
    map = new Map();
    lookUpData: any;
    keywordAlreadyExistMsg = '';
    externalReviewerSpecializations = [];
    extReviewerId: number | string;
    hIndex: any = [];
    externalReviewerExt: ExternalReviewerExt = new ExternalReviewerExt();
    externalReviewerDetails: any = {};
    keywordHttpOptions: any = {};
    countrySearchHttpOptions: any;
    isSaving = false;
    elasticSearchOptions: any = {};
    coiWithPersons: coiWithPerson[] = [];
    clearField: String;
    coiAlreadyExistMsg = '';

    constructor(public _extReviewerMaintenanceService: ExtReviewerMaintenanceService,
        private _commonService: CommonService, private _elasticService: ElasticConfigService,
        private _activatedRoute: ActivatedRoute) { }

    ngOnInit() {
        this.onQueryParamsChange();
        this.getExternalReviewerData();
        this.makeDropdown(); 
    }

    getExternalReviewerData(): void { 
        this.$subscriptions.push(this._extReviewerMaintenanceService.$externalReviewerDetails.subscribe((data: any) => {
            if (data.extReviewer) {
                 this.externalReviewerDetails = deepCloneObject(data);
                if (data.externalReviewerExt) {
                    this.externalReviewerExt = this.externalReviewerDetails.externalReviewerExt; 
                }
                if (data.externalReviewerSpecializations) {
                    this.externalReviewerSpecializations = this.externalReviewerDetails.externalReviewerSpecializations;
                }
                if (data.coiWithPersons) {
                    this.coiWithPersons = this.externalReviewerDetails.coiWithPersons;
                }
            }
        }));
    }

    setInitialValues() {
        this.lookUpData = this._extReviewerMaintenanceService.lookUpData;
        this.keywordHttpOptions = getEndPointOptionsForExtReviewerKeyWords();
        this.elasticSearchOptions = this._elasticService.getElasticForPerson();
    }

    setFunctionOptions(data) {
        return {
            arrayList: data.extReviewerSpecialization,
            contextField: 'description',
            filterFields: 'description',
            formatString: 'description',
            defaultValue: ''
        };
    }

    makeDropdown() {
        for (let i = 1; i <= 150; i++) {
            this.hIndex.push(i);
        }
    }

    // keywords section
    keywordChangeHandler(data) {
        this.map.delete('keywords');
        if (data) {
            this.keywordAlreadyExistMsg = '';
            if (data !== null && data !== 'null') {
                if (this.checkDuplicateKeywords(data.description) !== undefined) {
                    this.setKeywordErrorMessage();
                } else {
                    this.saveKeyword(data);
                }
            }
        }
    }

    private setKeywordErrorMessage(): void {
        this.keywordAlreadyExistMsg = 'Keyword already exist in database';
        setTimeout(() => this.keywordAlreadyExistMsg = '', 4000);
        this.keywordHttpOptions = getEndPointOptionsForExtReviewerKeyWords();
    }

    saveKeyword(data) {
        let isFoundInDataBase = false;
        this.externalReviewerSpecializations.forEach(item => {
            if (item.extReviewerSpecialization.description === data.description) {
                if (item.extReviewerSpecializationId) {
                    item.actionType = null;
                } else {
                    item.actionType = 'I';
                }
                isFoundInDataBase = true;
            }
        });
        if (!isFoundInDataBase) {
            this.externalReviewerSpecializations.push({
                externalReviewerId: this.externalReviewerDetails.extReviewerId,
                actionType: 'I',
                specializationCode: data.code,
                extReviewerSpecialization: data,
            });
        }
        this._extReviewerMaintenanceService.isDataChange = true;
        this.keywordHttpOptions = getEndPointOptionsForExtReviewerKeyWords();
    }

    checkDuplicateKeywords(keyword) {
        return this.externalReviewerSpecializations.find(item =>
            item.extReviewerSpecialization.description === keyword && (item.actionType == 'I' || item.actionType == null));
    }

    deleteFromKeyword(index: number): void {
        this.externalReviewerSpecializations[index].actionType = 'D';
        this.keywordAlreadyExistMsg = '';
        this._extReviewerMaintenanceService.isDataChange = true;
    }

    deleteFromCOI(index: number, coiWithPersonId: number): void {
        if (coiWithPersonId) {
            this.coiWithPersons[index].actionType = 'D';
        } else {
            this.coiWithPersons.splice(index, 1);
        }
        this._extReviewerMaintenanceService.isDataChange = true;
    }

    setCIRACode() {
        this.externalReviewerExt.extReviewerCira = this.lookUpData.extReviewerCira.find(cira =>
            cira.ciraCode === this.externalReviewerExt.ciraCode);
        this._extReviewerMaintenanceService.isDataChange = true;
    }

    setOriginality() {
        this.externalReviewerExt.extReviewerOriginality = this.lookUpData.extReviewerOriginality.find(originality =>
            originality.orginalityCode === this.externalReviewerExt.orginalityCode);
        this._extReviewerMaintenanceService.isDataChange = true;
    }

    setThoroughness() {
        this.externalReviewerExt.extReviewerThoroughness = this.lookUpData.extReviewerThoroughness.find(througness =>
            througness.thoroughnessCode === this.externalReviewerExt.thoroughnessCode);
        this._extReviewerMaintenanceService.isDataChange = true;
    }

    additionalDetailsValidation() {
        this.externalReviewerExt.scopusUrl = this.externalReviewerExt.scopusUrl.trim();
        this.map.clear();
        if (this.externalReviewerExt.hIndex == null && this.externalReviewerExt.hIndex != 0) {
            this.map.set('hIndex', 'hIndex');
        }
        if (!this.externalReviewerExt.scopusUrl) {
            this.map.set('scopusProfile', 'scopusProfile');
        }
        if (!this.externalReviewerSpecializations.length || this.checkForDelete()) {
            this.map.set('keywords', 'keywords');
        }
        return this.map.size > 0 ? false : true;
    }

    private checkForDelete(): boolean {
        return this.externalReviewerSpecializations.every(ele => ele.actionType === 'D');
    }

    setRequestObject() {
        const REQUEST_REPORT_DATA: any = {};
        this.externalReviewerExt.externalReviewerId = this.externalReviewerDetails.extReviewerId;
        if (this.externalReviewerExt.disciplinaryField) {
            this.externalReviewerExt.disciplinaryField = this.externalReviewerExt.disciplinaryField.trim();
        }
        REQUEST_REPORT_DATA.externalReviewerExt = this.externalReviewerExt;
        if (this.externalReviewerSpecializations.length > 0) {
            REQUEST_REPORT_DATA.externalReviewerSpecializations = this.externalReviewerSpecializations;
        }
        if (this.coiWithPersons.length > 0 ) {
            REQUEST_REPORT_DATA.coiWithPersons = this.coiWithPersons;  
        }
        return REQUEST_REPORT_DATA;
    }

    setCoiWithPerson(array) {
        return array.map(e => { 
            e.person = {
                fullName: e.person.fullName,
                personId: e.person.personId,
                principalName: e.person.principalName
            };
            return e;
        });
    }

    saveResponseData(data) {
        this.externalReviewerDetails.externalReviewerExt = data.externalReviewerExt;
        this.externalReviewerDetails.externalReviewerSpecializations = data.externalReviewerSpecializations;
        this.externalReviewerDetails.coiWithPersons = this.setCoiWithPerson(data.coiWithPersons);
        if (data.externalReviewerSpecializations) {
            this.externalReviewerDetails.externalReviewerSpecializations = data.externalReviewerSpecializations;
        }
        if (data.coiWithPersons && data.coiWithPersons.length) {
            this.coiWithPersons = data.coiWithPersons;  
        }
        this._extReviewerMaintenanceService.setExternalReviewerDetails(this.externalReviewerDetails);
        this._extReviewerMaintenanceService.isDataChange = false;
    }

    saveAdditionalDetails() {
        if (!this.isSaving && this.additionalDetailsValidation() && this._extReviewerMaintenanceService.isDataChange) {
            this.isSaving = true;
            const REQUEST_REPORT_DATA = this.setRequestObject();
            this.$subscriptions.push(this._extReviewerMaintenanceService.saveOrUpdateAdditionalDetails(REQUEST_REPORT_DATA)
                .subscribe((data: any) => {
                    if (data.externalReviewerExt.externalReviewerExtId) {
                        this.saveResponseData(data);
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, data.message);
                        this.isSaving = false;
                    }
                },
                    err => {
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating Additional Details failed. Please try again.');
                        this.isSaving = false;
                    }
                ));
        }

    }

    selectedCOIWith(event): void {
        this._extReviewerMaintenanceService.isDataChange = true;
        if (event) {
            this.updatePersonList(event);
            this.clearField = new String('true');
        }
    }

    private updatePersonList(event: any) {
        const PERSON_EXIST = this.coiWithPersons.find(person => person.personId === event.prncpl_id && person.actionType != 'D');
        if (!PERSON_EXIST) {
                this.coiWithPersons.push({
                    personId: event.prncpl_id,
                    person: this.mapPerson(event),
                    actionType: 'I',
                    externalReviewerId: this.externalReviewerDetails.extReviewerId
                });
        } else {
            this.coiAlreadyExistMsg = 'Person already added';
            setTimeout(() => this.coiAlreadyExistMsg = '', 4000);
        }
    }

    mapPerson(event): Person {
        return {
            personId: event.prncpl_id,
            fullName: event.full_name,
            principalName: event.prncpl_nm
        };
    }

    addKeywordToDatabase(event): void {
        this.$subscriptions.push(
            this._extReviewerMaintenanceService.addSpecialismKeyword({ 'specialismKeyword': event.searchString }).subscribe((data: any) => {
                if (data && data.code) {
                    this.keywordChangeHandler(data);
                } else {
                    this.setKeywordErrorMessage();
                }
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in adding new Keyword.');
            }));
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }
   
    private onQueryParamsChange() {
        this.$subscriptions.push(this._activatedRoute.queryParams.subscribe(params => {
            this.setInitialValues();
            this._extReviewerMaintenanceService.isDataChange = false;
        }));
    }
   
}
