import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { getEndPointOptionsForManpower, getEndPointOptionsForPosititonId } from '../../../common/services/end-point.config';
import { slideInOut } from '../../../common/utilities/animations';
import {
    convertToValidAmount, deepCloneObject, inputRestrictionForAmountField, setFocusToElement,
    validatePercentage
} from '../../../common/utilities/custom-utilities';
import {
    compareDates, getDateObjectFromTimeStamp, getDuration,
    parseDateWithoutTimestamp
} from '../../../common/utilities/date-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { CommonDataService } from '../../services/common-data.service';
import { ManPowerService } from '../man-power.service';
import {
    addResourceToList, calculateArraySum, getNumberOfDays,
    getSystemDate,
    personDuplicationCheck, updateEditedManpowerResource, validateApproverHeadCount
} from '../manpower-utilities';
declare var $: any;


@Component({
    selector: 'app-add-manpower-resource',
    templateUrl: './add-manpower-resource.component.html',
    styleUrls: ['./add-manpower-resource.component.css'],
    animations: [slideInOut]
})

export class AddManpowerResourceComponent implements OnChanges, OnDestroy {
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

    resourceDetails: any = {};
    resourceSearchOption: any = {};
    employeeSearchOption: any = {};
    jobProfileSearchOption: any = {};
    clearJobProfile: String;
    clearField: String;
    isReadyToHire: any;
    resourceType: any;
    isEmployeeFlag = true;
    isSalaryValidation: string;
    setFocusToElement = setFocusToElement;
    isAddNonEmployeeModal = false;
    isSaving = false;
    manpowerWarning: Set<String> = new Set();
    canModifyChargeEndDate = false;
    isCostAllocationFocused = false;
    previousUpgradeType: any;
    isChangeInCalculationRelatedFields = false;
    manpowerReminder: any = [];
    accountWarning = 'Please only select one main account when using multiple charging account as only one Position ID needs to be created.';
    planStartDate: number | Date | string;
    awardManpowerResources: any = [];
    isDateChanged = false;
    isManpowerAdminCorrection: any;
    isEditNewHire: any = false;
    isPositionIdChanged: any = false;
    isEditWhileAdminCorrection: any = false;
    positionIdRegEx: any;


    constructor(public _commonService: CommonService, private _commonData: CommonDataService,
        private _elasticConfig: ElasticConfigService, private _manpowerService: ManPowerService) {}


    ngOnChanges(changes: SimpleChanges) {
        if (changes.resourceCategory) {
            if (this.resourceCategory.awardManpowerResources.length) {
                this.awardManpowerResources = this.resourceCategory.awardManpowerResources;
            }
            this.initializeModal();
            this.setHeadCountWarning();
            this.resourceCategory && this.resourceCategory.index === null ? this.setDataForNewResource() : this.setDataForEditResource();
            $('#addManpowerResource').modal('show');
        }
        if (this.manpowerLookups.manpowerPositionRegex) {
            this.positionIdRegEx = new RegExp(this.manpowerLookups.manpowerPositionRegex);
        }
    }
    /**
     * section code 131 is for manpower staff variation
     */
     getPermissions(): void {
        this.canModifyChargeEndDate = this._commonData.getSectionEditableFlag('131') &&
        this._commonData.checkDepartmentLevelRightsInArray('MANPOWER_MODIFY_STAFF_CHARGE_END_DATE');
        this.isManpowerAdminCorrection = this._commonData.getSectionEditableFlag('136');
        this.isEditNewHire = this._commonData.getSectionEditableFlag('131');
        const REQUISITION = this.resourceCategory.resourceObject.workdayPositionRequisition;
        // tslint:disable-next-line: max-line-length
        this.isEditWhileAdminCorrection = !REQUISITION || !REQUISITION.jobRequisitionStatus || REQUISITION.jobRequisitionStatus == 'Open' ;
    }

    initializeModal(): void {
        this.map.clear();
        this.manpowerWarning = new Set();
        this.manpowerReminder = [];
        this.resourceDetails = {};
        this.resourceType = null;
        this.isReadyToHire = false;
        this.previousUpgradeType = null;
        this.isChangeInCalculationRelatedFields = false;
        this.isSalaryValidation = '';
        this.setJobProfileOptions();
        this.changeResourceType();
    }

    setJobProfileOptions(): void {
        this.jobProfileSearchOption = getEndPointOptionsForManpower('description (jobFamily)', 'description (jobFamily)', 'findManpowerJobProfile',
            { costElementCode: this.manpowerCategory.costElementCode });
    }

    setDataForNewResource(): void {
        this.isEditNewHire = this._commonData.getSectionEditableFlag('131');
        if (this.resourceDetails.isMultiAccount == null && this.resourceDetails.isMainAccount == null) {
            this.resourceDetails.isMultiAccount = false;
            this.resourceDetails.isMainAccount = true;
        }
        this.resourceDetails.planDuration = '0 year(s) , 0 month(s) & 0 day(s)';
        this.resourceDetails.costAllocation = this.resourceCategory.addStaffType === 'New' ? '100' : '';
    }

    setDataForEditResource(): void {
        this.resourceDetails = Object.assign({}, this.resourceCategory.resourceObject);
        this.resourceSearchOption.defaultValue = this.resourceCategory.addStaffType !== 'New' ? this.resourceDetails.fullName : '';
        this.isReadyToHire = this.resourceDetails.manpowerPositionStatus.positionStatusCode === '2';
        this.jobProfileSearchOption.defaultValue = this.resourceDetails.manpowerPlanJobProfileType ?
            this.resourceDetails.manpowerPlanJobProfileType.description : '';
        this.getPermissions();
        this.getResourceDates(this.resourceDetails);
    }

    getResourceDates(resource: any): void {
        resource.planStartDate = getDateObjectFromTimeStamp(resource.planStartDate);
        resource.planEndDate = getDateObjectFromTimeStamp(resource.planEndDate);
        resource.chargeStartDate = getDateObjectFromTimeStamp(resource.chargeStartDate);
        resource.chargeEndDate = getDateObjectFromTimeStamp(resource.chargeEndDate);
        resource.previousChargeStartDate = getDateObjectFromTimeStamp(resource.previousChargeStartDate);
        resource.previousChargeEndDate = getDateObjectFromTimeStamp(resource.previousChargeEndDate);
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    setHeadCountWarning(): void {
        if (this.validateHeadCount()) {
            this.manpowerWarning.add('Exceed headcount please ensure there is no overlap unless approved by the funder.');
        }
    }

    selectedJobProfile(result: any = null): void {
        this.resourceDetails.planJobProfileTypeCode = result ? result.jobProfileTypeCode : null;
        this.resourceDetails.manpowerPlanJobProfileType = result ? this.getSelectedJobProfileData(result) : null;
    }

    getSelectedJobProfileData(result: any): any {
        return {
            jobProfileTypeCode: result.jobProfileTypeCode,
            description: result.description
        };
    }

    validatePerson(): void {
        if (this.resourceCategory.addStaffType !== 'New' && !(this.resourceDetails.personId || this.resourceDetails.rolodexId) &&
            !this.resourceDetails.fullName) {
            this.map.set('personError', `* Enter staff name`);
        }
        if (personDuplicationCheck(
            this.manpowerList[this.resourceCategory.categoryType], this.resourceDetails, 'personId')) {
            this.map.set('personDuplication', 'Cost Allocation for a resource cannot be more than 100% for the given duration.');
        }

    }

    costAllocationValidation(): void {
        this.limitKeypress(this.resourceDetails.costAllocation);
        if (this.resourceDetails.costAllocation == null || this.resourceDetails.costAllocation === '' ) {
            this.map.set('costAllocation', '* Enter cost allocation %');
        }
    }

    addResourceValidation(): boolean {
        this.dateValidation();
        this.validatePerson();
        this.positionIdValidation();
        if ((this.resourceCategory.addStaffType === 'New') &&
            !this.resourceDetails.planJobProfileTypeCode) {
            this.map.set('jobProfile', '* Select a planned job profile');
        }
        this.costAllocationValidation();
        this.plannedSalaryValidations();
        return (this.map.size === 0) ? true : false;
    }

    plannedSalaryValidations(): void {
        this.limitAmount(this.resourceDetails.plannedBaseSalary, 'plannedBaseSalary');
        if (this.resourceDetails.costAllocation != 0 && !convertToValidAmount(this.resourceDetails.plannedBaseSalary)) {
            this.map.set('plannedBaseSalary', '* Enter proposed base salary');
        }
        if (this.resourceDetails.plannedBaseSalary > this.manpowerCategory.budgetAmount) {
            this.map.set('plannedBaseSalary', '* Proposed base salary cannot be more than the Cost Element Budget Amount.');
        }
        if (!(this.manpowerCategory.uncommittedAmount < 0) && (this.resourceDetails.plannedBaseSalary > this.manpowerCategory.uncommittedAmount)) {
            this.map.set('plannedSalary', '* Proposed commitment amount cannot be more than the Uncommitted Amount.');
        }
        if (!(this.manpowerCategory.uncommittedAmount < 0) && (this.manpowerCategory.uncommittedAmount + this.resourceDetails.plannedSalary) < this.resourceDetails.plannedBaseSalary) {
            this.map.set('plannedSalary', '* Proposed commitment amount cannot be more than the Uncommitted Amount.');
        }
        this.limitAmount(this.resourceDetails.plannedSalary, 'plannedSalary');
        if (this.resourceDetails.costAllocation != 0 && !convertToValidAmount(this.resourceDetails.plannedSalary)) {
            this.map.set('plannedSalary', '* Proposed committed amount is empty. Click CALCULATE or Enter Proposed Commitment Amount manually.');
        }
        if (this.resourceDetails.plannedSalary > this.manpowerCategory.budgetAmount) {
            this.map.set('plannedSalary', '* Proposed commitment amount cannot be more than the Cost Element Budget Amount.');
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
        if (value < 0) {
            this.map.set(fieldName, 'Enter the field with a non negative value');
        }
    }

    checkCommittedAmount(value): boolean {
        const committed = this.awardManpowerResources.length ? (parseInt(value, 10) +
            calculateArraySum(this.awardManpowerResources, 'committedCost',
                this.resourceDetails.manpowerResourceId)) : parseInt(value, 10);
        return value && this.manpowerCategory.budgetAmount < committed;
    }

    capitalizeFirstLetter(msg: string): string {
        return msg.charAt(0).toUpperCase() + msg.slice(1);
    }
    /**
     * @param  {} date
     * @param  {string} valueString
     * for checking if the start date is a past date on adding a resource or editing and changing the resource start dates
     */
    compareStartDateWithSystem(date: any, valueString: string): boolean {
        const editOrNew = this.resourceCategory.index === null ? true :
            compareDates(date, this.getDateFromParent(valueString)) !== 0;
        return date && editOrNew && compareDates(date, getSystemDate()) === -1;
    }
    /**
     * @param  {} date
     * @param  {string} valueString
     * for checking if the start date is a past date on adding a resource or editing and changing the resource start dates
     */
    staffStartDate45Days(date: any, valueString: string): boolean {
        const isEdit = this.resourceCategory.index === null ? true :
            compareDates(date, this.getDateFromParent(valueString))
            !== 0;
        return date && this.resourceCategory.addStaffType === 'New' && isEdit && getNumberOfDays(date, getSystemDate()) < 45;
    }

    getDateFromParent(valueString: string): any {
        return getDateObjectFromTimeStamp(this.resourceCategory.resourceObject[valueString]);
    }
    /**
     * for validating the approved head count of a resource in staff or student category
     */
    validateHeadCount(): boolean {
        return this.resourceCategory.index === null &&
            validateApproverHeadCount(this.manpowerCategory.approvedHeadCount,
                this.awardManpowerResources);
    }

    dateValidation(): void {
        if (this.resourceCategory.index == null || (this.resourceCategory.index != null && this.isDateChanged)) {
            this.map.clear();
            this.manpowerWarning = new Set();
            this.setHeadCountWarning();
            this.validatePlanDates();
            this.calculateDuration();
        }
        this.planStartDateExtendedValidation();
        this.detectChangeRelatedToCommittedCost();
    }

    detectChangeRelatedToCommittedCost() {
        if (this.resourceCategory.index !== null && this.resourceCategory.categoryType === 'Staff') {
            this.detectChangeInCalculationRelatedFields(this.awardManpowerResources[this.resourceCategory.index]);
            if (this.isChangeInCalculationRelatedFields) {
                this.manpowerWarning.add('Click CALCULATE after making changes to update Proposed Commitment Amount.');
            }
        }
    }

    private planStartDateExtendedValidation() {
        if ((this.isManpowerAdminCorrection && this.awardData.award.awardDocumentTypeCode != 1)
        && this.compareStartDateExtendWithinLimit(Number(this.manpowerLookups.manpowerAdminCorrectionPlanStartDateBuffer))) {
            this.map.set('planStartDate',
                `* Plan start date cannot be greater than Current Date + ${this.manpowerLookups.manpowerAdminCorrectionPlanStartDateBuffer} days.`);
        }

    }

    private compareStartDateExtendWithinLimit(bufferDays: number) {
        const newDate = new Date();
        newDate.setDate(newDate.getDate() + bufferDays);
        const NEW_DATE = new Date(newDate.setHours(0, 0, 0, 0));
        return compareDates(this.resourceDetails.planStartDate, NEW_DATE) === 1;
    }

    validatePlanDates(): void {
        this.validateDate(this.resourceDetails.planStartDate, 'planStartDate', 'plan start date');
        this.validateDate(this.resourceDetails.planEndDate, 'planEndDate', 'plan end date');
        if (this.resourceDetails.planStartDate && this.resourceDetails.planEndDate &&
            compareDates(this.resourceDetails.planStartDate, this.resourceDetails.planEndDate) === 1) {
            this.map.set('planEndDate', '* Enter a plan end date after plan start date');
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
            this.pastDateValidation(date, mapValue, msgVariable);
            this.startDate45DaysWarning(date, mapValue, msgVariable);
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
     * @param  {any} date
     * @param  {string} mapValue
     * @param  {string} msgVariable
     * compares system date and blocks the date if user selects a past date
     */
    pastDateValidation(date: any, mapValue: string, msgVariable: string): void {
        if (((!this.canModifyChargeEndDate && ['planEndDate', 'chargeEndDate'].includes(mapValue)) ||
            ['planStartDate', 'chargeStartDate'].includes(mapValue)) && this.compareStartDateWithSystem(date, mapValue)) {
            this.map.set(mapValue, '* ' + this.capitalizeFirstLetter(msgVariable) + ' cannot be a past date.');
        }
    }
    /**
     * @param  {any} date
     * @param  {string} mapValue
     * @param  {string} msgVariable
     * warning message shown when the start date selected for staff is not at least 45 days from the system date
     */
    startDate45DaysWarning(date: any, mapValue: string, msgVariable: string): void {
        if (mapValue === 'planStartDate' && !this.map.has(mapValue) && this.staffStartDate45Days(date, mapValue)) {
            this.manpowerWarning.add(this.capitalizeFirstLetter(msgVariable) +
                ' is less than 45 days as hiring process may not be completed in time.');
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
        if (this.resourceDetails.planStartDate && this.resourceDetails.planEndDate) {
            durationObject = getDuration(this.resourceDetails.planStartDate, this.resourceDetails.planEndDate, true);
            this.resourceDetails.planDuration = durationObject.durInYears + ' year(s), ' +
                durationObject.durInMonths + ' month(s) & ' + durationObject.durInDays + ' day(s)';
        }
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
            this.resourceDetails.awardManpowerId = this.manpowerCategory.awardManpowerId;
            this.resourceDetails.positionId = this.resourceDetails.positionId ? this.resourceDetails.positionId : null;
            this.saveOrUpdateManpowerResource();
        }
    }
    /**
     * set the required details for adding or updating a resource
     */
    setRequestObject(): void {
        this.resourceDetails.createUser = this._commonService.getCurrentUserDetail('userName');
        this.resourceDetails.updateUser = this._commonService.getCurrentUserDetail('userName');
        this.resourceDetails.planStartDate = parseDateWithoutTimestamp(this.resourceDetails.planStartDate);
        this.resourceDetails.planEndDate = parseDateWithoutTimestamp(this.resourceDetails.planEndDate);
        this.resourceDetails.chargeStartDate = parseDateWithoutTimestamp(this.resourceDetails.chargeStartDate);
        this.resourceDetails.chargeEndDate = parseDateWithoutTimestamp(this.resourceDetails.chargeEndDate);
        this.resourceDetails.previousChargeStartDate = parseDateWithoutTimestamp(this.resourceDetails.previousChargeStartDate);
        this.resourceDetails.previousChargeEndDate = parseDateWithoutTimestamp(this.resourceDetails.previousChargeEndDate);
        this.resourceDetails.plannedSalary = convertToValidAmount(this.resourceDetails.plannedSalary);
        this.resourceDetails.plannedBaseSalary = convertToValidAmount(this.resourceDetails.plannedBaseSalary);
    }

    setSaveRequestObject(): any {
        if (this.isManpowerAdminCorrection && !this.resourceDetails.positionId) {
            this.resourceDetails.workdayPositionRequisition = {};
        }
        return {
            'addManpowerCategoryType': this.resourceCategory.addStaffType,
            'awardId': this.awardData.award.awardId,
            'awardNumber': this.awardData.award.awardNumber,
            'budgetAmount': this.manpowerCategory.budgetAmount,
            'awardManpowerResource': this.resourceDetails,
            'sequenceNumber': this.awardData.award.sequenceNumber,
            'isUpdateInitialCommittedAmount': this.resourceCategory.index !== null && (this.resourceDetails.plannedSalary !==
                this.awardManpowerResources[this.resourceCategory.index].plannedSalary),
            'isBaseSalaryFieldValuesChanged': this.resourceCategory.index === null ? true : this.isChangeInCalculationRelatedFields,
            'isManpowerAdminCorrection' : this.isManpowerAdminCorrection && this.awardData.award.awardDocumentTypeCode != 1,
            'isPositionIdChanged': this.isPositionIdChanged
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
                    this.saveManpowerResponse(data);
                    this.isSaving = false;
                    this.isPositionIdChanged =  false ;
                }, err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, (this.resourceCategory.index !== null ? 'updating ' : 'Adding ') + 'Resource failed. Please try again.');
                    $('#addManpowerResource').modal('hide');
                    this.resourceOperations.emit({});
                    this.isSaving = false;
                }));
        }
    }

    /**
     * @param  {} editedObject the resource which is being edited
     * checks if any changes are made in the fields which affect the calculation of initial committed amount
     */
    detectChangeInCalculationRelatedFields(editedObject: any): void {
        const PLAN_START_DATE = getDateObjectFromTimeStamp(editedObject.planStartDate);
        const PLAN_END_DATE = getDateObjectFromTimeStamp(editedObject.planEndDate);
        this.isChangeInCalculationRelatedFields = (this.resourceDetails.plannedBaseSalary !== editedObject.plannedBaseSalary ||
            this.resourceDetails.costAllocation !== editedObject.costAllocation ||
            compareDates(this.resourceDetails.planStartDate, PLAN_START_DATE) !== 0 ||
            compareDates(this.resourceDetails.planEndDate, PLAN_END_DATE) !== 0);
    }

    /**
     * @param  {} index
     * @param  {} data
     * used for updating the data on the success of the service call.
     */
    resourceAddSuccess(index: number, data: any): void {
        index !== null ? updateEditedManpowerResource(this.manpowerCategory, index, data.awardManpowerResource) :
            addResourceToList(this.manpowerCategory, data.awardManpowerResource);
        if (data.awardManpowerDetail) {
            this.manpowerCategory.actualHeadCount = data.awardManpowerDetail.actualHeadCount;
            this.manpowerCategory.sapCommittedAmount = data.awardManpowerDetail.sapCommittedAmount;
        }
        this._commonService.showToast(HTTP_SUCCESS_STATUS,'Resource ' + (this.resourceCategory.index !== null ? 'updated' : 'added') + ' successfully.');
        $('#addManpowerResource').modal('hide');

        const RESOURCE = {
            resource: data.awardManpowerResource,
            index: index,
            childComponentIndex: this.resourceCategory.componentIndex,
            awardManpowerDetail: data.awardManpowerDetail,
            positionValidation : data.positionValidation
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

    /**
     * To calculate the initial committed cost
     */
    calculatePlannedSalary(): void {
        this.addResourceValidation();
        this.map.delete('plannedSalary');
        if (this.map.size === 0) {
            this.setRequestObject();
            this.$subscriptions.push(this._manpowerService.calculatePlannedSalary({
                'awardManpowerResource': this.resourceDetails, 'awardId': this.awardData.award.awardId
            }).subscribe((data: any) => {
                this.resourceDetails.plannedSalary = data ? data.validatedPlannedAmount : this.resourceDetails.plannedSalary;
                this.getResourceDates(this.resourceDetails);
            }));
        }
    }

    manageAccountWarning() {
        if (this.resourceDetails.isMultiAccount && this.resourceDetails.isMainAccount) {
            this.manpowerReminder.push(this.accountWarning);
            return;
        }
        if (this.manpowerReminder.find(element => element === this.accountWarning)) {
            this.manpowerReminder.splice(this.manpowerReminder.indexOf(this.accountWarning), 1);
        }
    }

    positionIdValidation() {
        this.map.delete('positionId');
        const isPositionIdEditable = this.isEditNewHire || (this.isManpowerAdminCorrection && this.awardData.award.awardDocumentTypeCode != 1 && this.isEditWhileAdminCorrection);
        if ( this.resourceDetails.positionId && isPositionIdEditable && !(this.positionIdRegEx.test(this.resourceDetails.positionId))) {
            this.map.set('positionId', 'Enter a valid position Id.');
        }
    }

}
