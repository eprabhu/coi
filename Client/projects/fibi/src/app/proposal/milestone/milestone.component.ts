import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { CommonService } from '../../common/services/common.service';
import { ProposalService } from '../services/proposal.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { DataStoreService } from '../services/data-store.service';

declare var $: any;
@Component({
    selector: 'app-milestone',
    templateUrl: './milestone.component.html',
    styleUrls: ['./milestone.component.css']
})
export class MilestoneComponent implements OnInit, OnDestroy {
    @Input() result: any = {};
    @Input() mode = null;
    proposalMileStone: any = {};
    mileStoneData: any = {};
    deleteMilestoneEntry: any = {};
    slicedMilestoneDescriptions;
    isDesc: any;
    column = 'startMonth';
    direction: number = -1;
    mandatoryList = new Map();
    isDataChangeFlag = false;
    isShowMilestone = true;
    editIndex: number = null;
    $subscriptions: Subscription[] = [];
    isSaving = false;
    hasUnsavedChanges = false;
    proposalIdBackup = null;

    constructor(private _commonService: CommonService,
                private _proposalService: ProposalService,
                private _dataStore: DataStoreService,
                private _activatedRoute: ActivatedRoute
    ) { }

    ngOnInit() {
        this.getProposalDetailsFromRoute();
    }

    private getProposalDetailsFromRoute() {
        this.$subscriptions.push(this._activatedRoute.queryParams.subscribe(params => {
            if (this.proposalIdBackup != this.result.proposal.proposalId) {
                this.proposalIdBackup = params['proposalId'];
                this.cancelMilestone();
            }
        }));
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    /** function sets the object to save the milestone
     */
    setMilestoneObject() {
        const isValid = this.milestoneValidation();
        if (isValid && !this.isSaving) {
            this.isSaving = true;
            this.proposalMileStone.proposalId = this.result.proposal.proposalId;
            this.proposalMileStone.updateUser = this._commonService.getCurrentUserDetail('userName');
            this.proposalMileStone.updateTimeStamp = new Date().getTime();
            this.mileStoneData.proposalMileStone = this.proposalMileStone;
            this.mileStoneData.proposalId = this.result.proposal.proposalId;
            this.mileStoneData.updateUser = this._commonService.getCurrentUserDetail('userName');
            this.saveMilestone();
        }
    }

    saveMilestone() {
        this.$subscriptions.push(this._proposalService.saveUpdateMilestone(this.mileStoneData).subscribe((data: any) => {
                this.result.proposalMileStones = data;
                this._dataStore.updateStore(['proposalMileStones'], this.result);
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, (this.editIndex !== null) ? 'Updating Milestone failed. Please try again.' : 'Adding Milestone failed. Please try again.');
                this.isSaving = false;
                this.editIndex = null;
            },
            () => {
                if (this.editIndex !== null) {
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Milestone updated successfully.');
                } else {
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Milestone added successfully.');
                }
                this.proposalMileStone = {};
                this.isSaving = false;
                this.editIndex = null;
                $('#add-milestone-modal').modal('hide');
            }));
    }

    /**
     * @param  {} proposalMileStone : instance from the array of milestones to be deleted
     */
    editMilestone(proposalMileStone, index) {
        this.editIndex = index;
        this.mandatoryList.clear();
        delete proposalMileStone.slicedMilestoneDescriptions;
        this.proposalMileStone = Object.assign({}, proposalMileStone);
    }

    /**
     * @param  {} proposalMileStoneId : milestone Id
     * @param  {} proposalId : proposal id
     * sets the object properties of the selected milestone for deletion.
     */
    setMilestoneDeletionObject(proposalMileStoneId, proposalId) {
        this.deleteMilestoneEntry.proposalMileStoneId = proposalMileStoneId;
        this.deleteMilestoneEntry.proposalId = proposalId;
        this.deleteMilestoneEntry.updateUser = this._commonService.getCurrentUserDetail('userName');

    }

    /**deleted the selected milestone */
    deleteMilestone() {
        this.$subscriptions.push(this._proposalService.deleteProposalMileStone(this.deleteMilestoneEntry).subscribe((data: any) => {
            this.result.proposalMileStones = data;
        },
        err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Milestone failed. Please try again.');
        },
        () => {
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Milestone deleted successfully.');
        }));
    }

    /** for validating the milestone
     */
    milestoneValidation() {
        this.mandatoryList.clear();
        const pattern = /^(100|[1-9][0-9]|[0-9])$/;
        if (!this.proposalMileStone.mileStone || (this.proposalMileStone.milestone && !this.proposalMileStone.milestone.trim())) {
            this.mandatoryList.set('mileStone', 'mileStone');
        }
        if (this.proposalMileStone.startMonth === null || this.proposalMileStone.startMonth === undefined) {
            this.mandatoryList.set('startMonth', 'startMonth');
        } else if (!pattern.test(this.proposalMileStone.startMonth)) {
            this.mandatoryList.set('isValidStartMonthPattern', 'isValidStartMonthPattern');
        }
        if (!this.proposalMileStone.duration) {
            this.mandatoryList.set('duration', 'duration');
        } else if (!pattern.test(this.proposalMileStone.duration)) {
            this.mandatoryList.set('isValidDurationPattern', 'isValidDurationPattern');
        }
        return this.mandatoryList.size === 0 ? true : false;
    }

    /**
     * @param  {any} event
     * Restrict all special character only accept integers.
     */
    milestoneValueInput(event: any) {
        const pattern = /[0-9]\d*/;
        if (!pattern.test(String.fromCharCode(event.charCode))) {
            event.preventDefault();
        }
    }

    sortBy(property) {
        this.isDesc = !this.isDesc;
        this.column = property;
        this.direction = this.isDesc ? 1 : -1;
    }

    cancelMilestone() {
        this.proposalMileStone = {};
        this.isSaving = false;
        this.editIndex = null;
        this.mandatoryList.clear();
    }

}
