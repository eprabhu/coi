import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { getEndPointOptionsForManpower } from '../../../common/services/end-point.config';
import { slideInOut } from '../../../common/utilities/animations';
import {
    convertToValidAmount, inputRestrictionForAmountField, setFocusToElement,
    validatePercentage
} from '../../../common/utilities/custom-utilities';
import {
    compareDates, getDateObjectFromTimeStamp, getDuration,
    parseDateWithoutTimestamp
} from '../../../common/utilities/date-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { CommonDataService } from '../../services/common-data.service';
import { ManPowerService } from '../man-power.service';
import {addResourceToList, calculateArraySum, updateEditedManpowerResource} from '../manpower-utilities';
declare var $: any;

@Component({
    selector: 'app-add-student-or-others',
    templateUrl: './add-student-or-others.component.html',
    styleUrls: ['./add-student-or-others.component.css']
})
export class AddStudentOrOthersComponent implements OnChanges, OnDestroy {
    @Input() manpowerCategory: any;
    @Input() resourceCategory: any;
    @Input() awardData: any;
    @Input() helpText: any;
    @Input() manpowerList: any;
    @Input() manpowerLookups: any;
    @Output() resourceOperations: EventEmitter<any> = new EventEmitter<any>();
    $subscriptions: Subscription[] = [];
    isShowManpowerInfo = true;
    map = new Map();
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    candidateTitle: any;
    resourceDetails: any = {};
    resourceSearchOption: any = {};
    employeeSearchOption: any = {};
    clearField: String;
    positionId: any;
    resourceType: any;
    isEmployeeFlag = true;
    setFocusToElement = setFocusToElement;
    isAddNonEmployeeModal = false;
    isSaving = false;
    costAllocationList: any = [];
    isCostAllocationFocused = false;

    constructor(public _commonService: CommonService, private _commonData: CommonDataService,
        private _elasticConfig: ElasticConfigService, private _manpowerService: ManPowerService) { }

    ngOnChanges(change: SimpleChanges) {
        if (change.resourceCategory) {
            this.initializeModal();
            this.resourceCategory && this.resourceCategory.index === null ? this.setDataForNewResource() : this.setDataForEditResource();
            $('#addManpowerResource-students-others').modal('show');
        }
    }

    initializeModal(): void {
        this.map.clear();
        this.resourceDetails = {};
        this.candidateTitle = null;
        this.resourceType = null;
        this.positionId = null;
        this.setResourceSearchOption();
        this.changeResourceType();
    }

    setResourceSearchOption(): void {
        this.resourceSearchOption = getEndPointOptionsForManpower('fullName', 'fullName (userName)', 'findPersonsWithPositionId',
            {
                'isGraduateStudent': true, 'awardId': this.awardData.award.awardId
            });
    }

    setDataForNewResource(): void {
        this.resourceDetails.chargeDuration = '0 year(s) , 0 month(s) & 0 day(s)';
    }

    setDataForEditResource(): void {
        this.resourceDetails = Object.assign({}, this.resourceCategory.resourceObject);
        this.resourceSearchOption.defaultValue = this.resourceCategory.categoryType === 'Student' ? this.resourceDetails.fullName : '';
        this.candidateTitle = this.resourceCategory.categoryType === 'Student' ?
            this.resourceDetails.manpowerCandidateTitleType.candidateTitleTypeCode : null;
        if (this.resourceCategory.categoryType === 'Others') {
            this.isEmployeeFlag = !this.resourceCategory.resourceObject.rolodexId;
            (this.isEmployeeFlag) ? this.setElasticPersonOption() : this.setElasticRolodexOption();
            this.employeeSearchOption.defaultValue = this.resourceDetails.fullName;
            this.resourceType = this.resourceDetails.manpowerResourceType.resourceTypeCode;
        }
        this.getResourceDates(this.resourceDetails);
    }

    getResourceDates(resource: any): void {
        resource.chargeStartDate = getDateObjectFromTimeStamp(resource.chargeStartDate);
        resource.chargeEndDate = getDateObjectFromTimeStamp(resource.chargeEndDate);
        resource.previousChargeStartDate = getDateObjectFromTimeStamp(resource.previousChargeStartDate);
        resource.previousChargeEndDate = getDateObjectFromTimeStamp(resource.previousChargeEndDate);
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    selectedPerson(result: any): void {
        if (result) {
            this.resourceDetails.personId = result.personId;
            this.resourceDetails.fullName = result.fullName;
        } else {
            this.resourceDetails.personId = null;
            this.resourceDetails.fullName = null;
        }
    }

    validatePerson(): void {
        if (!(this.resourceDetails.personId || this.resourceDetails.rolodexId) &&
            !this.resourceDetails.fullName) {
            this.map.set('personError', `* Enter ${this.getPersonValidationMessage()} name`);
        }
    }

    getPersonValidationMessage(): string {
        return this.resourceCategory.categoryType === 'Others' ? 'resource' : 'student';
    }

    costAllocationValidation(): void {
        this.limitKeypress(this.resourceDetails.costAllocation);
        if (!this.resourceDetails.costAllocation) {
            this.map.set('costAllocation', '* Enter cost allocation %');
        }
    }

    addResourceValidation(): boolean {
        this.dateValidation();
        this.validatePerson();
        if (this.resourceCategory.categoryType !== 'Others') {
            this.costAllocationValidation();
        }
        if (this.resourceCategory.categoryType === 'Student') {
            if (!this.candidateTitle || this.candidateTitle === 'null') {
                this.map.set('candidateTitle', '* Select a candidate title');
            }
            this.committedCostValidation();
        }
        if (this.resourceCategory.categoryType === 'Others' && (!this.resourceType || this.resourceType === 'null')) {
            this.map.set('resourceTypes', '* Enter resource type');
        }
        return (this.map.size === 0) ? true : false;
    }

    committedCostValidation(): void {
        this.limitAmount(this.resourceDetails.committedCost, 'committedCost');
        if (!this.resourceDetails.committedCost) {
            this.map.set('committedCost', '* Enter committed cost');
        }
        if (this.resourceDetails.committedCost > this.manpowerCategory.budgetAmount) {
            this.map.set('committedCost', '* Committed amount cannot be more than the Cost Element Budget Amount.');
        }
        if (this.checkCommittedAmount(this.resourceDetails.committedCost)) {
            this.map.set('committedCost', '* Sum of committed amount should be less or equal to budget amount');
        }
    }

    /**limitKeypress - limit the input field b/w 0 and 100 with 2 decimal points
     * @param {} value
     */
    limitKeypress(value): void {
        this.map.delete('costAllocation');
        if (validatePercentage(value)) {
            this.map.set('costAllocation', validatePercentage(value));
        }
    }

    limitAmount(value, fieldName: string): void {
        this.map.delete(fieldName);
        if (inputRestrictionForAmountField(value)) {
            this.map.set(fieldName, inputRestrictionForAmountField(value));
        }
    }

    checkCommittedAmount(value): boolean {
        const committed = this.manpowerCategory.awardManpowerResource.length ? (parseInt(value, 10) +
            calculateArraySum(this.manpowerCategory.awardManpowerResource, 'committedCost',
                this.resourceDetails.manpowerResourceId)) : parseInt(value, 10);
        return value && this.manpowerCategory.budgetAmount < committed;
    }

    dateValidation(): void {
        this.map.clear();

        this.validateChargeDates();
        this.calculateDuration();
    }

    validateChargeDates(): void {
        this.validateDate(this.resourceDetails.chargeStartDate, 'chargeStartDate', this.resourceCategory.categoryType !== 'Others' ?
            'charge start date' : 'actual start date');
        this.validateDate(this.resourceDetails.chargeEndDate, 'chargeEndDate', this.resourceCategory.categoryType !== 'Others' ?
            'charge end date' : 'actual end date');
        if (this.resourceDetails.chargeStartDate && this.resourceDetails.chargeEndDate &&
            compareDates(this.resourceDetails.chargeStartDate, this.resourceDetails.chargeEndDate) === 1) {
            this.map.set('chargeEndDate', '* Enter a charge end date after charge start date');
        }
    }

    /**
     * @param  {} date date to be validated
     * @param  {string} mapValue value in which the map has to set
     * @param  {string} msgVariable message which has to be displayed in the validation
     * function validates a date which is passed
     */
    validateDate(date: any, mapValue: string, msgVariable: string): void {
        if (!date) {
            this.map.set(mapValue, '* Enter ' + msgVariable);
        } else {
            this.compareWithAwardDates(date, mapValue, msgVariable);
        }
    }

    compareWithAwardDates(date: any, mapValue: string, msgVariable: string): void {
        const AWARDSTARTDATE = getDateObjectFromTimeStamp(this._commonData.beginDate);
        const AWARDENDDATE = getDateObjectFromTimeStamp(this._commonData.finalExpirationDate);
        if (compareDates(date, AWARDSTARTDATE) === -1) {
            this.map.set(mapValue, '* Enter a valid ' + msgVariable + '  after award begin date');
        }
        if (compareDates(date, AWARDENDDATE) === 1) {
            this.map.set(mapValue, '* Enter a valid ' + msgVariable + ' before award expiration date');
        }
    }

    /**
     * @param  {string} string
     * converts every 1st letter in the sentence to upper case
     */
    upperCaseFirstLetters(string: string): string {
        return string.replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase());
    }

    calculateDuration(): void {
        let durationObject: any;
        if (this.resourceDetails.chargeStartDate && this.resourceDetails.chargeEndDate) {
            durationObject = getDuration(this.resourceDetails.chargeStartDate, this.resourceDetails.chargeEndDate, true);
            this.resourceDetails.chargeDuration = durationObject.durInYears + ' year(s), ' +
                durationObject.durInMonths + ' month(s) & ' + durationObject.durInDays + ' day(s)';
        }
    }
    /**
     * for setting elastic options for the search
     */
    changeResourceType(): void {
        this.resourceDetails.personId = this.resourceDetails.fullName =
            this.resourceDetails.rolodexId = null;
        this.employeeSearchOption.defaultValue = '';
        (this.isEmployeeFlag) ? this.setElasticPersonOption() : this.setElasticRolodexOption();
    }
    /**setElasticPersonOption - Set Elastic search option for Fibi Person */
    setElasticPersonOption(): void {
        this.employeeSearchOption = this._elasticConfig.getElasticForPerson();
    }
    /**setElasticRolodexOption - Set Elastic search option for Fibi rolodex */
    setElasticRolodexOption(): void {
        this.employeeSearchOption = this._elasticConfig.getElasticForRolodex();
    }
    /**
     * @param  {} result
     * for selecting the elastic result
     */
    selectedEmployee(result: any): void {
        if (result) {
            this.resourceDetails.personId = result.prncpl_id;
            this.resourceDetails.fullName = result.full_name;
            this.resourceDetails.rolodexId = result.rolodex_id;
        } else {
            this.resourceDetails.personId = this.resourceDetails.fullName =
                this.resourceDetails.rolodexId = null;
        }
    }
    /**
     * add or update resource details. This function emits the data to the main component where the service is called
     */
    addResource(): void {
        if (this.addResourceValidation()) {
            if (!this.resourceDetails.manpowerResourceId && this.resourceCategory.categoryType === 'Student') {
                this.resourceDetails.candidateTitleTypeCode = this.candidateTitle;
                this.resourceDetails.manpowerCandidateTitleType = this.getManpowerCandidateTitleType();
            }
            if (this.resourceCategory.categoryType === 'Others') {
                this.resourceDetails.resourceTypeCode = this.resourceType;
                this.resourceDetails.manpowerResourceType = this.getManpowerResourceType();
            }
            this.resourceDetails.awardManpowerId = this.manpowerCategory.awardManpowerId;
            this.saveOrUpdateManpowerResource();
        }
    }

    getManpowerCandidateTitleType(): any {
        return this.candidateTitle ? this.manpowerLookups.manpowerCandidateTitleType.find(
            (type: any) => type.candidateTitleTypeCode === this.candidateTitle) : null;
    }

    getManpowerResourceType(): any {
        return this.resourceType ? this.manpowerLookups.manpowerResourceType.find(
            (type: any) => type.resourceTypeCode === this.resourceType) : null;
    }


    /**
     * set the required details for adding or updating a resource
     */
    setRequestObject(): void {
        this.resourceDetails.createUser = this._commonService.getCurrentUserDetail('userName');
        this.resourceDetails.updateUser = this._commonService.getCurrentUserDetail('userName');
        this.resourceDetails.chargeStartDate = parseDateWithoutTimestamp(this.resourceDetails.chargeStartDate);
        this.resourceDetails.chargeEndDate = parseDateWithoutTimestamp(this.resourceDetails.chargeEndDate);
        this.resourceDetails.previousChargeStartDate = parseDateWithoutTimestamp(this.resourceDetails.previousChargeStartDate);
        this.resourceDetails.previousChargeEndDate = parseDateWithoutTimestamp(this.resourceDetails.previousChargeEndDate);
        this.resourceDetails.committedCost = convertToValidAmount(this.resourceDetails.committedCost);
    }

    setSaveRequestObject(): any {
        return {
            'awardId': this.awardData.award.awardId,
            'awardNumber': this.awardData.award.awardNumber,
            'budgetAmount': this.manpowerCategory.budgetAmount,
            'awardManpowerResource': this.resourceDetails,
            'sequenceNumber': this.awardData.award.sequenceNumber
        };
    }

    saveManpowerResponse(data: any): void {
        this.getResourceDates(this.resourceDetails);
        this.resourceAddSuccess(this.resourceCategory.index, data);
    }
    /**
     * service to add or update a resource
     */
    saveOrUpdateManpowerResource(): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.setRequestObject();
            this.$subscriptions.push(this._manpowerService.saveOrUpdateManpowerResource(
                this.setSaveRequestObject()).subscribe((data: any) => {
                    this.manpowerLookups.positionIds = data.positionIds ? data.positionIds : this.manpowerLookups.positionIds;
                    this.saveManpowerResponse(data);
                    this.isSaving = false;
                }, err => {
                    this.resourceCategory.index !== null ?
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating resources failed. Please try again') :
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Adding resources failed. Please try again.');
                    $('#addManpowerResource-students-others').modal('hide');
                    const RESOURCE = {
                        resource: '',
                        index: null,
                        childComponentIndex: null
                    };
                    this.resourceOperations.emit({});
                    this.isSaving = false;
                }));
        }
    }

    /**
     * @param  {} index
     * @param  {} data
     * used for updating the data on the success of the service call.
     */
    resourceAddSuccess(index: number, data: any): void {
        this.resourceCategory.index !== null ? this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Resource successfully updated.') :
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Resource successfully added.');
        $('#addManpowerResource-students-others').modal('hide');
        const RESOURCE = {
            resource: data,
            index: index,
            childComponentIndex: this.resourceCategory.componentIndex
        };
        this.resourceOperations.emit(RESOURCE);
    }
    /**
     * @param  {} rolodexObject
     * setting the value for rolodex when a new rolodex is added
     */
    setRolodexPersonObject(rolodexObject: any): void {
        if (rolodexObject.rolodex) {
            (this.isEmployeeFlag) ? this.setElasticPersonOption() : this.setElasticRolodexOption();
            this.resourceDetails.fullName = rolodexObject.rolodex.fullName;
            this.resourceDetails.rolodexId = rolodexObject.rolodex.rolodexId;
            this.employeeSearchOption.defaultValue = this.resourceDetails.fullName;
            this.map.delete('personError');
        }
        this.isAddNonEmployeeModal = rolodexObject.nonEmployeeFlag;
    }
}
