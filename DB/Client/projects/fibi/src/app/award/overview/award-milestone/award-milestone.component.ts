import { Component, Input, OnDestroy, OnChanges } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';
import { AwardService } from '../../services/award.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { compareDates, getDuration, getDateObjectFromTimeStamp,
         compareDatesWithoutTimeZone, parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';
import { DEFAULT_DATE_FORMAT } from '../../../app-constants';
import { CommonDataService } from '../../services/common-data.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { scrollIntoView } from '../../../common/utilities/custom-utilities';
import { setFocusToElement } from '../../../common/utilities/custom-utilities';
declare var $: any;
@Component({
    selector: 'app-award-milestone',
    templateUrl: './award-milestone.component.html',
    styleUrls: ['./award-milestone.component.css']
})
export class AwardMilestoneComponent implements OnDestroy, OnChanges {

    @Input() isEditable;
    @Input() result;
    @Input() lookupData;
    awardMilestone: any = {};
    isDesc: any;
    column = '';
    direction: number = -1;
    mandatoryList = new Map();
    isShowCollapse = true;
    isEditMilestone = false;
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    duration = '0 year(s) , 0 month(s) & 0 day(s)';
    awardMileStones: any = [];
    isHighlighted = false;
    $subscriptions: Subscription[] = [];
    awardMilestoneIndex: any;
    awardMileStoneId: any;
    deleteMilestoneIndex: any;
    warningMsg: any = [];
    setFocusToElement = setFocusToElement;
    isSaving = false;
    milestoneComments: any;
    isLineItemEdit: boolean[] = [];
    milestoneStatusCodes: any = null;
    isCommentView: boolean[] = [];


    constructor(public _commonService: CommonService,
        private _awardService: AwardService, public _commonData: CommonDataService
    ) { }

    ngOnChanges() {
        this.isHighlighted = this._commonData.checkSectionHightlightPermission('123');
        this.fetchMilestones();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    fetchMilestones() {
        this.awardMileStones = this.result.awardMileStones;
    }

    /**
     * function sets the object to save the milestone
     */
    setMilestoneObject() {
        const isValid = this.milestoneValidation();
        if (isValid && this.warningMsg && !this.warningMsg.length) {
            this.awardMilestone.awardId = parseInt(this.result.award.awardId, 10);
            this.awardMilestone.awardNumber = this.result.award.awardNumber;
            this.awardMilestone.updateUser = this._commonService.getCurrentUserDetail('userName');
            this.awardMilestone.updateTimeStamp = new Date().getTime();
            this.awardMilestone.sequenceNumber = this.result.award.sequenceNumber;
            this.awardMilestone.milestoneStatusCode = this.milestoneStatusCodes;
            this.awardMilestone.milestoneStatus = this.awardMilestone.milestoneStatus !== 'null' ?
                this.lookupData.milestoneStatus.find(element => element.milestoneStatusCode === this.milestoneStatusCodes) : null;
            this.setDateFormatWithoutTimeStamp();
            this.saveMilestone();
        }
    }

    setDateFormatWithoutTimeStamp() {
        this.awardMilestone.startDate = parseDateWithoutTimestamp(this.awardMilestone.startDate);
        this.awardMilestone.endDate = parseDateWithoutTimestamp(this.awardMilestone.endDate);
    }

    clearMilestoneObject() {
        this.awardMilestone = {};
        this.mandatoryList.clear();
        this.warningMsg = [];
        this.isEditMilestone = false;
        this.duration = '0 year(s) , 0 month(s) & 0 day(s)';
        this.milestoneStatusCodes = null;
    }

    saveMilestone() {
        const isMilestoneUpdate = false;
        const mileStoneObject = {
            'awardId': parseInt(this.result.award.awardId, 10),
            'awardMilestone': this.awardMilestone,
        };
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._awardService.saveAwardMilestone(mileStoneObject).subscribe((data: any) => {
                this.updateOrPushMilestoneList(data, isMilestoneUpdate);
                this.sortBy(this.column);
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, (this.isEditMilestone ? 'Updating ' : 'Adding ') + 'Milestone failed. Please try again.');
            },
                () => {
                    if (this.isEditMilestone) {
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Milestone updated successfully.');
                    } else {
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Milestone added successfully.');
                    }
                    this.result.awardMileStones = this.awardMileStones;
                    this.updateAwardStoreData();
                    this.clearMilestoneObject();
                    this.isSaving = false;
                    $('#add-milestone-modal').modal('hide');
                }));
        }
    }
    checkDateBetweenValidation() {
        this.warningMsg = [];
        const AWARD_START_DATE = getDateObjectFromTimeStamp(this._commonData.beginDate);
        const AWARD_END_DATE = getDateObjectFromTimeStamp(this._commonData.finalExpirationDate);
        if (this.awardMilestone.startDate) {
            if (compareDatesWithoutTimeZone(this.awardMilestone.startDate, AWARD_END_DATE) === 1) {
                this.warningMsg.push('* Choose a Milestone Start Date on or before the Award End Date');
            }
            if (compareDatesWithoutTimeZone(this.awardMilestone.startDate, AWARD_START_DATE) === -1) {
                this.warningMsg.push('* Choose a Milestone Start Date between Award Start and End Dates');
            }
        }
        if (this.awardMilestone.endDate) {
            if (compareDatesWithoutTimeZone(this.awardMilestone.endDate, AWARD_START_DATE) === -1) {
                this.warningMsg.push('* Choose a Milestone End Date on or after the Award Start Date');
            }
            if (compareDatesWithoutTimeZone(this.awardMilestone.endDate, AWARD_END_DATE) === 1) {
                this.warningMsg.push('* Choose a Milestone End Date between Award Start and End Dates');
            }
        }
    }

    updateAwardStoreData() {
        this.result = JSON.parse(JSON.stringify(this.result));
        this._commonData.setAwardData(this.result);
    }

    /**
     * @param  {} data : response of a service
     * @param  {} isMilestoneUpdate : condition to update the milestone list or to add a new value to the list
     */
    updateOrPushMilestoneList(data, isMilestoneUpdate) {
        if (this.awardMileStones) {
            this.awardMileStones.forEach(element => {
                if (this.awardMilestone.awardMilestoneId === element.awardMilestoneId) {
                    this.awardMileStones[this.awardMileStones.indexOf(element)] = Object.assign({}, data.awardMilestone);
                    isMilestoneUpdate = true;
                }
            });
        }
        if (isMilestoneUpdate === false) {
            this.awardMileStones.push(data.awardMilestone);
        }
        this.awardMileStones = Object.assign([], this.awardMileStones);
    }

    dateValidation() {
        if (this.awardMilestone.endDate) {
            this.mandatoryList.delete('startDate');
            this.mandatoryList.delete('endDate');
            if (compareDates(this.awardMilestone.startDate, this.awardMilestone.endDate, 'dateObject', 'dateObject') === 1) {
                this.mandatoryList.set('endDate', '* Please pick an End Date after Start Date');
            } else {
                if (this.awardMilestone.startDate && this.awardMilestone.endDate) {
                    let dateDuration: any = {};
                    dateDuration = getDuration(this.awardMilestone.startDate, this.awardMilestone.endDate, true);
                    this.duration = dateDuration.durInYears + ' year(s), ' + dateDuration.durInMonths + ' month(s) & ' +
                    dateDuration.durInDays + ' day(s)';
                    this.awardMilestone.duration = this.duration;
                }
            }
        }
    }

    /** Clears validation as soon as date gets picked and also shows validation when field gets cleared.
      *  This validation occurs before action(save or proceed).
     * */
    dateValidationBeforeAction(dateToCheck: any, mappedString: string, validationMessage: string) {
        this.mandatoryList.delete(mappedString);
        if (!dateToCheck) {
            this.mandatoryList.set(mappedString, validationMessage);
        }
    }

    /**
     * @param  {} awardMilestone : instance from the array of milestones to be deleted
     */
    editMilestone(awardMilestone, index) {
        this.mandatoryList.clear();
        this.isEditMilestone = true;
        this.awardMilestoneIndex = index;
        delete awardMilestone.slicedMilestoneDescriptions;
        this.awardMilestone = Object.assign({}, awardMilestone);
        this.duration = awardMilestone.duration;
        this.milestoneStatusCodes = this.awardMilestone.milestoneStatusCode;
        this.awardMilestone.startDate = getDateObjectFromTimeStamp(this.awardMilestone.startDate);
        this.awardMilestone.endDate = getDateObjectFromTimeStamp(this.awardMilestone.endDate);
        scrollIntoView('milestone-title');
    }

    temporarySaveMilestone(awardMileStoneId, milestones) {
        this.awardMileStoneId = awardMileStoneId;
        this.deleteMilestoneIndex = this.awardMileStones.indexOf(milestones);
    }

    /**
     * @param  {} awardMileStoneId : milestone Id
     * @param  {} awardId : proposal id
     * deletes the specific milestone
     */
    deleteMilestone() {
        this.$subscriptions.push(this._awardService.deleteProposalMileStone({
            'awardMilestoneId': this.awardMileStoneId, 'awardId': this.result.award.awardId,
            'updateUser': this._commonService.getCurrentUserDetail('userName')
        }).subscribe((data: any) => {
            this.awardMileStones.splice(this.deleteMilestoneIndex, 1);
        },
            err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Milestone failed. Please try again.'); },
            () => {
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Milestone deleted successfully.');
                this.awardMileStoneId = null;
                this.deleteMilestoneIndex = null;
                this.result.awardMileStones = this.awardMileStones;
                this.updateAwardStoreData();
            }));
    }

    milestoneValidation() {
        this.mandatoryList.clear();
        if (!this.awardMilestone.milestone || (this.awardMilestone.milestone && !this.awardMilestone.milestone.trim())) {
            this.mandatoryList.set('mileStone', '* Please enter a Milestone');
        } if (!this.awardMilestone.startDate) {
            this.mandatoryList.set('startDate', '* Please pick a valid Start Date');
        } if (!this.awardMilestone.endDate) {
            this.mandatoryList.set('endDate', '* Please pick a valid End Date');
        } if (this.awardMilestone.endDate && this.awardMilestone.startDate &&
            this.awardMilestone.endDate < this.awardMilestone.startDate) {
            this.mandatoryList.set('endDate', '* Please pick an End Date after Start Date');
        } if (this.awardMilestone.endDate || this.awardMilestone.startDate) {
            this.checkDateBetweenValidation();
        }
        return this.mandatoryList.size === 0 ? true : false;
    }

    sortBy(property) {
        this.column = property;
        this.direction = this.isDesc ? 1 : -1;
    }
}
