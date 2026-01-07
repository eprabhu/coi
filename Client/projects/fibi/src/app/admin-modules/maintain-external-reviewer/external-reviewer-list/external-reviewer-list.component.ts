import { Component, OnInit, OnDestroy } from '@angular/core';
import { getEndPointOptionsForCountry } from '../../../common/services/end-point.config';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { ExtReviewerMaintenanceService } from '../external-reviewer-maintenance-service';
import { fadeDown, itemAnim } from '../../../common/utilities/animations';
import { DEFAULT_DATE_FORMAT } from '../../../app-constants';
import { parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';
import { setFocusToElement } from '../../../common/utilities/custom-utilities';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { Router } from '@angular/router';
import { CommonService } from '../../../common/services/common.service';
import {TempExtRequestObject} from '../external-reviewer-list/external-reviewer-list.interface';

@Component({
    selector: 'app-external-reviewer-list',
    templateUrl: './external-reviewer-list.component.html',
    styleUrls: ['./external-reviewer-list.component.css'],
    animations: [fadeDown, itemAnim]
})
export class ExternalReviewerListComponent implements OnInit, OnDestroy {

    isShowHelpInfo = false;
    externalReviewerList = [];
    result: any;
    extRequestObject = {
        extReviewer: null, externalReviewerExt: null, externalReviewerRight: null,
        extReviewerId: null, message: null, currentPage: 1, pageNumber: 20, totalExtReviewer: 0,
        property1: '',
        property2: '',
        property3: '',
        property4: '',
        property5: '',
        property6 : '',
        property7: '',
        property8: '',
        property9: '',
        property10: [],
        property11: [],
        property12: '',
        property13: [],
        property14: [],
        property15: [],
        extReviewers: [],
        externalReviewerSpecializations: null,
        reverse: 'DESC',
        sort: {}
    };
    tempExtRequestObject: TempExtRequestObject = new TempExtRequestObject();
    setFocusToElement = setFocusToElement;
    DEFAULT_DATE_FORMAT = DEFAULT_DATE_FORMAT;
    lookUpData;
    isMaintainReviewer: any;
    countrySearchHttpOptions: any;
    clearCountryField: any;
    lookupValues: any = [];
    academicAreaTypeOptions = 'EXT_REVIEWER_ACADEMIC_AREA#ACADEMIC_AREA_CODE#true#false';
    subAcademicAreaTypeOptions = 'EXT_REVIEWER_ACADEMIC_SUB_AREA#ACADEMIC_SUB_AREA_CODE#true#false';
    hIndexTypeOptions = 'H_INDEX#ID#true#false';
    specializationTypeOptions = 'EXT_SPECIALISM_KEYWORD#SPECIALISM_KEYWORD_CODE#true#true';
    academicRankTypeOptions = 'EXT_REVIEWER_ACADEMIC_RANK#ACADEMIC_RANK_CODE#true#true';
    sortCountObj = {
        'externalReviewerId': 0, 'passportName': 0, 'hindex': 0, 'academicRank.description': 0,
        'countryDetails.countryName': 0, 'agreementEndDate': 0, 'status': 0,
    };
    sortMap: any = {};
    $subscriptions: Subscription[] = [];
    externalReviewerElasticConfig: any;
    affiliatedInstitutionSearchOptions: any = {};
    clearAffiliatedInstitution;
    isReadMore: boolean[] = [];
    datePlaceHolder = DEFAULT_DATE_FORMAT;

    constructor(
        public _extReviewerMaintenanceService: ExtReviewerMaintenanceService,
        private _elasticConfig: ElasticConfigService,
        private _router: Router,
        public _commonService: CommonService
    ) { }

    async ngOnInit() {
        this.getEndPointOptions();
         this.getLookUpData();
        this.isMaintainReviewer = await this._extReviewerMaintenanceService.getMaintainReviewerPermission();
        this.externalReviewerElasticConfig = this._elasticConfig.getElasticForExternalReviewer();
    }
    async setAffiliatedInstitutionSearchOptions() {
        this.affiliatedInstitutionSearchOptions.arrayList = await this.lookUpData.extReviewerAffiliation;
        this.affiliatedInstitutionSearchOptions.contextField = 'description';
        this.affiliatedInstitutionSearchOptions.filterFields = 'description';
        this.affiliatedInstitutionSearchOptions.formatString = 'description';
    }

    selectExternalElasticResult(event) {
        if (event) {
            this._router.navigate(['/fibi/maintain-external-reviewer/external-reviewer-details/overview'],
                { queryParams: { 'externalReviewerId': event.prncpl_id, 'mode': 'view' } });
        }
    }

    getEndPointOptions() {
        this.countrySearchHttpOptions = getEndPointOptionsForCountry();
    }

    getLookUpData() {
        this.$subscriptions.push(this._extReviewerMaintenanceService.getAllExtReviewersLookup().subscribe(
            (data: any) => {
                this.lookUpData = data;
                this.setAffiliatedInstitutionSearchOptions();
            }
        ));
    }

    loadExternalReviewers() {
        this.prepareRequestObject();
        this.$subscriptions.push(this._extReviewerMaintenanceService.fetchExternalReviewerData(this.extRequestObject).subscribe(
            (data: any) => {
                this.result = data;
                this.externalReviewerList = data.extReviewers;
                this.isReadMore = [];
            })
        );
    }

    prepareRequestObject() {
        this.extRequestObject.property1 = this.tempExtRequestObject.property1 || '';
        this.extRequestObject.property2 = this.tempExtRequestObject.property2 || '';
        this.extRequestObject.property3 = this.tempExtRequestObject.property3 || '';
        this.extRequestObject.property4 = this.tempExtRequestObject.property4 || '';
        this.extRequestObject.property5 = parseDateWithoutTimestamp(this.tempExtRequestObject.property5) || '';
        this.extRequestObject.property6 = this.tempExtRequestObject.property6 || '';
        this.extRequestObject.property7 = parseDateWithoutTimestamp(this.tempExtRequestObject.property7) || '';
        this.extRequestObject.property8 = this.tempExtRequestObject.property8 || '';
        this.extRequestObject.property9 = this.tempExtRequestObject.property9 || '';
        this.extRequestObject.property10 = this.tempExtRequestObject.property10 || [];
        this.extRequestObject.property11 = this.tempExtRequestObject.property11 || [];
        this.extRequestObject.property12 = this.tempExtRequestObject.property12 || '';
        this.extRequestObject.property13 = this.tempExtRequestObject.property13 || [];
        this.extRequestObject.property14 = this.tempExtRequestObject.property14 || [];
        this.extRequestObject.property15 = this.tempExtRequestObject.property15 || [];

    }

    clearSearch() {
        this.extRequestObject.property1 = '';
        this.extRequestObject.property2 = '';
        this.extRequestObject.property3 = '';
        this.extRequestObject.property4 = '';
        this.extRequestObject.property5 = '';
        this.extRequestObject.property6 = '';
        this.extRequestObject.property7 = '';
        this.extRequestObject.property8 = '';
        this.extRequestObject.property9 = '';
        this.extRequestObject.property10 = [];
        this.extRequestObject.property11 = [];
        this.extRequestObject.property12 = '';
        this.extRequestObject.property13 = [];
        this.extRequestObject.property14 = [];
        this.extRequestObject.property15 = [];
        this.clearCountryField = new String('true');
        this.clearAffiliatedInstitution = new String('true');
        this.lookupValues = [];
        this.tempExtRequestObject = new TempExtRequestObject();
    }

    actionsOnPageChange(event) {
        this.extRequestObject.currentPage = event;
        this.loadExternalReviewers();
        this._commonService.pageScroll('pageScrollToTop');
      }

    sortResult(sortFieldBy: string) {
        this.sortCountObj[sortFieldBy]++;
        if (this.sortCountObj[sortFieldBy] < 3) {
                this.sortMap[sortFieldBy] = !this.sortMap[sortFieldBy] ? 'asc' : 'desc';
        } else {
            this.sortCountObj[sortFieldBy] = 0;
            delete this.sortMap[sortFieldBy];
        }
        this.extRequestObject.sort = this.sortMap;
        this.loadExternalReviewers();
    }

    countryChangeFunction(event: any) {
        this.tempExtRequestObject.property9 = event && event.countryCode ? event.countryCode : '';
    }

    onLookupSelect(data: any, property: string) {
        this.lookupValues[property] = data;
        this.tempExtRequestObject[property] = data.length ? data.map(d => d.code) : [];
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    onAffiliatedInstitutionSelect(event) {
        if (event) {
            this.tempExtRequestObject.property12 = event.affiliationInstitutionCode;
        }else {
            this.tempExtRequestObject.property12 = '';
        }
    }

}
