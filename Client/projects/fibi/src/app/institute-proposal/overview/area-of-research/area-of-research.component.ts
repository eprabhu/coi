import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';
import { getEndPointOptionsForArea, getEndPointOptionsForSubArea } from '../../../common/services/end-point.config';
import { AreaOfResearchService } from './area-of-research.service';
import { AreaOfResearch, InstituteProposal, InstProposal, ResearchType } from '../../institute-proposal-interfaces';
import { DataStoreService } from '../../services/data-store.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { AutoSaveService } from '../../../common/services/auto-save.service';
import { InstituteProposalService } from '../../services/institute-proposal.service';
import { OverviewService } from './../overview.service';
import { deepCloneObject } from '../../../common/utilities/custom-utilities';

declare var $: any;
@Component({
    selector: 'app-area-of-research',
    templateUrl: './area-of-research.component.html',
    styleUrls: ['./area-of-research.component.css']
})
export class AreaOfResearchComponent implements OnInit, OnDestroy {

    @Input() isViewMode = true;
    generalDetails: InstProposal = this._overviewService.generalDetails;
    isAreaOfResearchWidgetOpen = true;
    $subscriptions: Subscription[] = [];
    instProposalId: any;
    areaOfResearchList: Array<AreaOfResearch> = [];
    areaOfResearch: AreaOfResearch = new AreaOfResearch();
    helpText: any = {};
    researchTypes: Array<ResearchType> = [];
    errorMap = new Map();
    areaSearchOptions: any = {};
    subAreaSearchOptions: any = {};
    deleteIndex = -1;
    isSaving = false;
    isResearchDescriptionReadMore = false;
    isMultiDisciplinaryDescriptionReadMore = false;
    editIndex: number = null;
    clearSubAreaField: String;
    clearAreaField: String;
    constructor(public commonService: CommonService,
                private _instituteProposalService: InstituteProposalService,
                private _dataStore: DataStoreService,
                private _route: ActivatedRoute, private _areaOfResearch: AreaOfResearchService,
                private _autoSaveService: AutoSaveService,
                private _overviewService: OverviewService) { }

    ngOnInit() {
        this.getKeyPersonDetails();
        this.getDataStoreEvent();
        this.researchTypeSet();
        this.setSearchOptionsForArea();
        this.setSearchOptionsForSubArea();
        this.getProposalIdFromUrl();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    researchTypeSet(): void {
        const researchType = this.researchTypes.find(type => type.isActive === true);
        if (researchType) {
            this.areaOfResearch.researchType = researchType;
            this.areaOfResearch.researchTypeCode = researchType.researchTypeCode;
        }
    }

    private getProposalIdFromUrl() {
        this.$subscriptions.push(this._route.queryParams.subscribe(params => {
            this.instProposalId = params.instituteProposalId;
            this.areaOfResearch.proposalId = Number(this.instProposalId);
        }));
    }

    getDataStoreEvent() {
        this.$subscriptions.push(this._dataStore.dataEvent
            .subscribe((data: any) => {
                if (data.includes('instituteProposalResearchAreas') || data.includes('instProposal')) {
                    this.getKeyPersonDetails();
                }
            }));
    }

    getKeyPersonDetails(): void {
        const data: InstituteProposal = this._dataStore.getData(['instituteProposalResearchAreas', 'researchTypes']);
        this.areaOfResearchList = data.instituteProposalResearchAreas;
        this.researchTypes = data.researchTypes;
    }

    researchTypeChange() {
        this.onResearchAreaSelect(null);
        this.areaOfResearch.researchType = this.researchTypes
            .find(area => area.researchTypeCode == this.areaOfResearch.researchTypeCode);
        this.setSearchOptionsForArea();
        this.setAreaOptions('');
    }

    setAreaOptions(defaultValue = ''): void {
        this.areaSearchOptions = this._instituteProposalService.setHttpOptions('description', 'description',
            'findResearchTypeArea', defaultValue, { researchTypeCode: this.areaOfResearch.researchType.researchTypeCode });
    }

    onResearchAreaSelect(area: any) {
        this.errorMap.clear();
        if (area) {
            this.areaOfResearch.researchTypeArea = area;
            this.areaOfResearch.researchTypeAreaCode = area.researchTypeAreaCode;
        } else {
            this.areaOfResearch.researchTypeArea = null;
            this.areaOfResearch.researchTypeAreaCode = null;
        }
        this.setSearchOptionsForSubArea();
        this.onResearchSubAreaSelect(null);
    }

    onResearchSubAreaSelect(subArea: any) {
        this.errorMap.clear();
        if (subArea) {
            this.areaOfResearch.researchTypeSubArea = subArea;
            this.areaOfResearch.researchTypeSubAreaCode = subArea.researchTypeSubAreaCode;
            this.clearAreaField = new String('false');
            this.clearSubAreaField = new String('false');
        } else {
            this.areaOfResearch.researchTypeSubArea = null;
            this.areaOfResearch.researchTypeSubAreaCode = null;
        }
    }

    setSearchOptionsForArea() {
        const PARAMS = this.areaOfResearch.researchType.researchTypeCode ?
        { researchTypeCode: this.areaOfResearch.researchType.researchTypeCode } : null;
        this.areaSearchOptions = getEndPointOptionsForArea(PARAMS);
    }

    setSearchOptionsForSubArea() {
        let PARAMS = {};
        if (this.areaOfResearch.researchType && this.areaOfResearch && this.areaOfResearch.researchTypeAreaCode) {
            PARAMS = {
                'researchTypeCode': this.areaOfResearch.researchType.researchTypeCode,
                'researchTypeAreaCode': this.areaOfResearch.researchTypeAreaCode
            };
        }
        this.subAreaSearchOptions = getEndPointOptionsForSubArea(PARAMS);
    }

    validateAreaOfResearch(): void {
        this.errorMap.clear();
        if (!this.areaOfResearch.researchTypeAreaCode) {
            this.errorMap.set('area', '* Please add an Area');
        }
        if (this.checkDuplicateArea()) {
            this.errorMap.set('area', '* Area already Added');
        }
        if (this.errorMap.size == 0 && !this.isSaving) {
            this.saveAreaOfResearch();
        }
    }

    checkDuplicateArea(): boolean {
        return !!this.areaOfResearchList.find(A =>
            this.areaOfResearch.researchTypeCode === A.researchTypeCode &&
            this.areaOfResearch.researchTypeAreaCode === A.researchTypeAreaCode &&
            this.areaOfResearch.researchTypeSubAreaCode === A.researchTypeSubAreaCode
            && A.researchAreaId !== this.areaOfResearch.researchAreaId);

    }

    saveAreaOfResearch() {
        if (this.validateAreaOfResearch && !this.isSaving) {
            this.isSaving = true;
            this.getProposalIdFromUrl();
            this.$subscriptions.push(this._areaOfResearch.saveOrUpdateAreaOfResearch(
                {
                    instituteProposalResearchArea: this.areaOfResearch,
                    proposalId: this.areaOfResearch.proposalId
                })
                .subscribe((data: InstituteProposal) => {
                    if (this.editIndex != null) {
                        this.areaOfResearchList.splice(this.editIndex, 1, data.instituteProposalResearchArea);
                    } else {
                        this.areaOfResearchList.push(data.instituteProposalResearchArea);
                    }
                    this._dataStore.updateStoreData({ instituteProposalResearchAreas: this.areaOfResearchList });
                    this.isSaving = false;
                    this.commonService.showToast(HTTP_SUCCESS_STATUS, this.editIndex !== null ?
                        'Area updated successfully.' : 'Area added successfully.');
                    $('#add-area-modal').modal('hide');
                    this.resetAreaOfResearch();
                }, err => {
                    this.isSaving = false;
                    this.commonService.showToast(HTTP_ERROR_STATUS, (this.editIndex !== null) ?
                    ('Updating Area failed. Please try again.') : ('Adding Area failed. Please try again.'));
                }));
        }
    }

    deleteAreaOfResearch(): void {
        if (!this.isSaving) {
            const ID = this.areaOfResearchList[this.deleteIndex].researchAreaId;
            this.isSaving = true;
            this.$subscriptions.push(this._areaOfResearch.deleteAreaOfResearch(this.instProposalId, ID)
                .subscribe(data => {
                    this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Area removed successfully.');
                    this.areaOfResearchList.splice(this.deleteIndex, 1);
                    this._dataStore.updateStoreData({ instituteProposalResearchAreas: this.areaOfResearchList });
                    this.deleteIndex = -1;
                    this.isSaving = false;
                }, err => {
                    this.isSaving = false;
                    this.commonService.showToast(HTTP_ERROR_STATUS, 'Removing Area failed. Please try again.');
                }));
        }
    }

    setUnsavedChanges(flag: boolean) {
        this._autoSaveService.setUnsavedChanges('More Information', 'area-more-information', flag, true);
        this._instituteProposalService.isInstituteProposalDataChange = flag;
    }

    resetAreaOfResearch() {
        this.areaOfResearch = new AreaOfResearch();
        this.errorMap.clear();
        this.researchTypeSet();
        this.setSearchOptionsForArea();
        this.setSearchOptionsForSubArea();
        this.isSaving = false;
        this.editIndex = null;
    }

    editAreaOfResearch(index) {
        this.errorMap.clear();
        this.editIndex = index;
        this.areaOfResearch = deepCloneObject(this.areaOfResearchList[index]);
        this.clearSubAreaField = new String('false');
        this.clearAreaField = new String('false');
        this.setAreaOptions(this.areaOfResearch.researchTypeArea.description);
        this.setSearchOptionsForSubArea();
    }

}
