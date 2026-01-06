// last updated by Aravind on 09-03-2021
import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { ProposalHomeService } from '../../proposal-home.service';
import { ProposalService } from '../../../services/proposal.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { CommonService } from '../../../../common/services/common.service';
import { areaOfResearchProposal } from '../../../proposal-interfaces';
import { DataStoreService } from '../../../services/data-store.service';
import { AutoSaveService } from '../../../../common/services/auto-save.service';
import { ActivatedRoute } from '@angular/router';

declare var $: any;
@Component({
    selector: 'app-area-of-research',
    templateUrl: './area-of-research.component.html',
    styleUrls: ['./area-of-research.component.css']
})
export class AreaOfResearchDetailsComponent implements OnInit {

    @Input() result: any = {};
    @Input() dataVisibilityObj: any = {};
    @Input() proposalDataBindObj: any = {};
    @Input() helpText: any = {};

    isError = false;
    clearAreaField: String;
    clearSubAreaField: String;

    researchWarningMsg = null;
    selectedArea: any = null;
    selectedSubArea: any = null;

    areaHttpOptions: any = {};
    subAreaHttpOptions: any = {};
    areaToRemove: any = {};
    $subscriptions: Subscription[] = [];
    isSaving = false;
    editIndex: number = null;
    areaOfResearchProposalEditObject: areaOfResearchProposal;
    researchType = null;
    proposalIdBackup = null;

    constructor(private _proposalHomeService: ProposalHomeService,
        private _proposalService: ProposalService,
        private _commonService: CommonService,
        private _dataStore: DataStoreService,
        private _autoSaveService: AutoSaveService,
        private _activatedRoute: ActivatedRoute) { }

    ngOnInit(): void {
        this.getProposalDetailsFromRoute();
        this.researchTypeSet();
        this.setAreaOptions();
        this.setSubAreaOptions('');
    }

    private getProposalDetailsFromRoute() {
        this.$subscriptions.push(this._activatedRoute.queryParams.subscribe(params => {
            if (this.proposalIdBackup != this.result.proposal.proposalId) {
                this.proposalIdBackup = params['proposalId'];
                this.clearResearchArea();
            }
        }));
    }

    /** Check whether any research type is active or not */
    researchTypeSet(): void {
        const researchType = this.result.researchTypes.find(type => type.isActive === true);
        this.researchType = researchType ? researchType.researchTypeCode : null;
    }

    /** sets type code, type and endpoint search options for research area and sub-area */
    researchTypeChange(): void {
        this.researchAreaSelectedFunction(null);
        this.researchWarningMsg = null;
        this.isError = false;
        this.selectedArea = null;
        this.selectedSubArea = null;
        this.setAreaOptions('');
    }

    setAreaOptions(defaultValue = ''): void {
        this.areaHttpOptions = this._proposalService.setHttpOptions('description', 'description',
            'findResearchTypeArea', defaultValue, { 'researchTypeCode': this.researchType });
    }

    /** sets end point search options for sub-area with dynamic params based on conditions
     * @param defaultValue
     */
    setSubAreaOptions(defaultValue): void {
        let SUB_AREA_PARAM = {};
        if (this.selectedArea) {
            SUB_AREA_PARAM = {
                'researchTypeCode': this.researchType,
                'researchTypeAreaCode': this.selectedArea.researchTypeAreaCode
            };
        }
        this.subAreaHttpOptions = this._proposalService.setHttpOptions('description', 'description', 'findResearchTypeSubArea',
            defaultValue, SUB_AREA_PARAM);
    }

    /** sets area object from end point search, also clears sub-area field
     * @param result
     */
    researchAreaSelectedFunction(result): void {
        this.selectedArea = result ? result : null;
        this.selectedSubArea = null;
        this.setSubAreaOptions('');
    }

    /** sets sub-area object from end point search, also defaults the value of area
     * @param result
     */
    researchSubAreaSelectedFunction(result): void {
        if (result) {
            this.selectedSubArea = result;
            if (result.researchTypeArea != null && result.researchTypeArea.description != null) {
                this.selectedArea = result.researchTypeArea;
                this.areaHttpOptions.defaultValue = result.researchTypeArea.description;
                this.isError = false;
                this.clearAreaField = new String('false');
            }
        } else {
            this.selectedSubArea = null;
        }
    }

    /** function validates areas according to type chosed and calls method to add if validation is successful */
    validateAndSetReqObject(): void {
        if (!this.result.proposal.proposalId) {
            this.dataVisibilityObj.isProposalSaved = false;
            this._dataStore.updateStore(['dataVisibilityObj'], this);
        } else {
            this.validateAreaOfResearch();
            if (!this.researchWarningMsg) {
                this.setResearchAreaReqObject();
                this.clearResearchArea();
                this.clearResearchSubArea();
                this.setSubAreaOptions('');
            }
        }
    }

    /** main method to validate area of research */
    validateAreaOfResearch(): void {
        this.researchWarningMsg = null;
        if (this.selectedArea && this.result.proposalResearchAreas.length !== 0) {
            this.validateResearchArea();
        } else if (!this.selectedArea) {
            this.isError = true;
            this.researchWarningMsg = '* Please add an Area';
        }
    }

    /** method to validate research area */
    validateResearchArea(): void {
        for (const area of this.result.proposalResearchAreas) {
            if (!this.isEditMode(area)) {
                if ((area.researchTypeCode == this.researchType) &&
                    (area.researchTypeAreaCode == this.selectedArea.researchTypeAreaCode) &&
                    ((!area.researchTypeSubArea && !this.selectedSubArea) ||
                        (this.selectedSubArea && area.researchTypeSubAreaCode &&
                            area.researchTypeSubAreaCode == this.selectedSubArea.researchTypeSubAreaCode))) {
                    this.researchWarningMsg = 'Area already added';
                    break;
                }
            }
        }
    }

    isEditMode(researchArea) {
        if (this.editIndex !== null) {
            if (!researchArea.researchAreaId || researchArea.researchAreaId == this.areaOfResearchProposalEditObject.researchAreaId) {
                return true;
            }
        }
        return false;
    }
    /** sets request object for research area */
    setResearchAreaReqObject(): void {
        const areaObject: any = {};
        areaObject.researchTypeCode = this.researchType;
        areaObject.researchType = this.result.researchTypes
            .find(area => area.researchTypeCode == this.researchType);
        areaObject.researchTypeAreaCode = this.selectedArea.researchTypeAreaCode;
        areaObject.researchTypeArea = this.selectedArea;
        areaObject.researchTypeSubAreaCode = this.selectedSubArea == null ? null : this.selectedSubArea.researchTypeSubAreaCode;
        areaObject.researchTypeSubArea = this.selectedSubArea == null ? null : this.selectedSubArea;
        if (this.editIndex !== null) {
            areaObject.researchAreaId = this.areaOfResearchProposalEditObject.researchAreaId;
        }
        this.addAreaOfResearch(areaObject);
    }

    /** common request object for area of research and adds them
     * @param areaOfResearchObj
     */
    addAreaOfResearch(areaOfResearchObj: areaOfResearchProposal): void {
        areaOfResearchObj.proposalId = this.result.proposal.proposalId;
        areaOfResearchObj.updateTimeStamp = new Date().getTime();
        areaOfResearchObj.updateUser = this._commonService.getCurrentUserDetail('userName');
        this.$subscriptions.push(this._proposalHomeService.addAreaOfResearch(
            {
                'proposalId': this.result.proposal.proposalId, 'proposalResearchArea': areaOfResearchObj,
                'updateUser': this._commonService.getCurrentUserDetail('userName')
            })
            .subscribe((data: any) => {
                this.result.proposalResearchAreas = data;
                this._dataStore.updateStore(['proposalResearchAreas'], this.result);
                this.clearResearchArea();
                $('#add-area-modal').modal('hide');
            }, err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, (this.editIndex !== null) ? 'Updating Area failed. Please try again.' : 'Adding Area failed. Please try again.');
                    this.editIndex = null;
            }, () => {
                    if (this.editIndex !== null) {
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Area updated successfully.');
                    } else {
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Area added successfully.');

                    }
                    this.editIndex = null;
            }));
    }

    /** temporary saves area of research object before deletion
     * @param e
     * @param id
     */
    temporarySaveAreaOfResearch(e, area): void {
        e.preventDefault();
        this.areaToRemove = area;
    }

    /** clears area field */
    clearResearchArea(): void {
        this.selectedArea = null;
        this.isError = false;
        this.areaHttpOptions.defaultValue = '';
        this.clearAreaField = new String('true');
    }

    /** clears sub-area field*/
    clearResearchSubArea(): void {
        this.selectedSubArea = null;
        this.subAreaHttpOptions.defaultValue = '';
        this.clearSubAreaField = new String('true');
    }

    /** deletes area of research*/
    deleteAreaOfResearch(): void {
        const requestObj: any = {};
        requestObj.proposalId = this.result.proposal.proposalId;
        requestObj.researchAreaId = this.areaToRemove.researchAreaId;
        this.$subscriptions.push(this._proposalHomeService.deleteProposalResearchArea(requestObj)
            .subscribe((data: any) => {
                this.result.proposalResearchAreas = data.proposalResearchAreas;
                this._dataStore.updateStore(['proposalResearchAreas'], this.result);
                this.resetAreaOfResearch();
            },
                err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Removing Area failed. Please try again.');
                },
                () => {
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Area removed successfully.');
                    this.areaToRemove = {};
                }));
    }

    saveMoreInfo(): void {
        if (!this.isSaving) {
            this.isSaving = true;
            if (!this.result.proposal.proposalId) {
                this.dataVisibilityObj.isProposalSaved = false;
                this._dataStore.updateStore(['dataVisibilityObj'], this);
                this.isSaving = false;
            } else {
                this.$subscriptions.push(this._proposalHomeService.saveProposalMoreInfo({
                    'proposalId': this.result.proposal.proposalId, 'researchDescription': this.result.proposal.researchDescription,
                    'multiDisciplinaryDescription': this.result.proposal.multiDisciplinaryDescription, 'updateUser':
                        this._commonService.getCurrentUserDetail('userName')
                }).subscribe((data: any) => {
                    this.result.grantCallId = data.grantCallId;
                    this._dataStore.updateStore(['grantCallId'], this.result);
                    this.isSaving = false;
                    this.dataVisibilityObj.dataChangeFlag = false;
                    this._dataStore.updateStore(['dataVisibilityObj'], this);
                },
                    err => {
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving More Information failed. Please try again.');
                        this.isSaving = false;
                    },
                    () => {
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'More Information saved successfully.');
                        this.isSaving = false;
                    }));
            }
        }
    }

    editAreaOfResearch(index) {
        this.isError = false;
        this.researchWarningMsg = null;
        this.editIndex = index;
        this.areaOfResearchProposalEditObject = JSON.parse(JSON.stringify(this.result.proposalResearchAreas[index]));
        this.researchType = this.areaOfResearchProposalEditObject.researchTypeCode;
        this.clearSubAreaField = new String('false');
        this.clearAreaField = new String('false');
        this.selectedArea = this.areaOfResearchProposalEditObject.researchTypeArea;
        this.selectedSubArea = this.areaOfResearchProposalEditObject.researchTypeSubArea;
        this.setAreaOptions(this.areaOfResearchProposalEditObject.researchTypeArea.description);
        const editedSubAreaOption = this.areaOfResearchProposalEditObject.researchTypeSubArea ?
            this.areaOfResearchProposalEditObject.researchTypeSubArea.description : '';
        this.setSubAreaOptions(editedSubAreaOption);
        this.setUnsavedChanges(true);
    }

    resetAreaOfResearch() {
        this.isError = false;
        this.researchWarningMsg = null;
        this.editIndex = null;
        this.clearResearchArea();
        this.clearResearchSubArea();
    }

    setUnsavedChanges(flag: boolean) {
        this.dataVisibilityObj.dataChangeFlag = flag;
        this._autoSaveService.setUnsavedChanges('More Information', 'area-more-information', flag, true);
        this._dataStore.updateStore(['dataVisibilityObj'], this);
        this._proposalHomeService.hasProposalOverviewChanged = flag;
    }
}
