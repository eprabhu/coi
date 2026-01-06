import { ProposalService } from './../../../services/proposal.service';
/** Last updated by Ramlekshmy on 28-07-2020 */
import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';

import { CommonService } from '../../../../common/services/common.service';
import { ProposalHomeService } from '../../proposal-home.service';
import { ElasticConfigService } from '../../../../common/services/elastic-config.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS, KEY_PERSON_LABEL } from '../../../../app-constants';
import { Subject, Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { getCurrentTimeStamp } from '../../../../common/utilities/date-utilities';
import { getEndPointOptionsForDepartment } from '../../../../common/services/end-point.config';
import { WafAttachmentService } from '../../../../common/services/waf-attachment.service';
import { concatUnitNumberAndUnitName, fileDownloader, setHelpTextForSubItems, validatePercentage } from '../../../../common/utilities/custom-utilities';
import { environment } from '../../../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { ProposalAttachmentTypes, ProposalPerson } from '../../../interface/proposal.interface';
import { AutoSaveService } from '../../../../common/services/auto-save.service';
import { DataStoreService } from '../../../services/data-store.service';

declare var $: any;

@Component({
    selector: 'app-key-person',
    templateUrl: './key-person.component.html',
    styleUrls: ['./key-person.component.css'],
    providers: [WafAttachmentService]
})
export class KeyPersonComponent implements OnInit, OnChanges, OnDestroy {
    @Input() result: any = {};
    @Input() dataVisibilityObj: any = {};
    @Input() helpText: any = {};

    isNonEmployee = false;
    isAddNonEmployeeModal = false;
    isShowPersonResultCard = false;
    isUnitExist = false;
    clearField;
    deletePersonId = null;
    replaceAttachmentId = null;
    elasticSearchOptions: any = {};
    deptHttpOptions: any = {};
    personDetails: any = {
        units: [],
        proposalPersonRole: null,
        department: '',
        projectRole: null
    };
    mandatoryList = new Map();
    roleTypesArray = [];
    uploadedFile = [];
    uploadedFiles = [];
    selectedPersonDetails: any = {};
    clearDeptField;
    $subscriptions: Subscription[] = [];
    $unitList = new Subject();
    editIndex: number = null;
    deleteProposalCV: any;
    deployMap = environment.deployUrl;
    selectedMemberObject: any = {};
    previousProposalPersonId = null;
    previousNonEmployeeFlag = null;
    isSaving = false;
    isProposalAndPersonUnitSame: any;
    noRightOnUnitMsg: any;
    keyPersonnelLabel = KEY_PERSON_LABEL;
    isShowMoreOptions = false;
    selectedPersonEdit: any = {};
    selectedAttachmentType: any[] = [];
    selectedAttachmentDescription = [];
    attachmentWarningMsg = null;
    isReverse: any;
    direction = 1;
    sortListBy: any;
    personCertificationHistory = [];
    isEnableViewMore = false;
    isMaintainRolodex = false;
    isMaintainPerson = false;
    isMaintainTraining = false;
    isShowConfidentialAttachment = false;
    canShowCertification = false;
    canShowTraining = false;
    canViewTrainingDetails = false;
    isRolodexViewModal = false;
    type = 'PERSON';
    isTraining = false;
    id: string;
    personDescription: string;
    trainingStatus: string;
    proposalPersonId: string;
    concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;
    proposalIdBackup = null;

    constructor(public _commonService: CommonService,
                private _proposalHomeService: ProposalHomeService,
                private _elasticConfig: ElasticConfigService,
                private _wafAttachmentService: WafAttachmentService,
                public _proposalService: ProposalService,
                public _autoSaveService: AutoSaveService,
                private _router: Router,
                private _dataStore: DataStoreService,
                private _activatedRoute: ActivatedRoute) { }

    ngOnInit() {
        this.getProposalDetailsFromRoute();
        this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
        this.deptHttpOptions = Object.assign({}, getEndPointOptionsForDepartment());
        this.$unitList.subscribe(data => {
            this.checkIfUnitExist();
        });
        this.filterRoleTypes();
        this.getPermissions();
        this.setCanShowCertificationAndTraining();
        this.isShowConfidentialAttachment = this.result.availableRights.includes('VIEW_CONFIDENTIAL_PROPOSAL_ATTACHMENTS');
    }

    ngOnChanges() {
        if (Object.keys(this.helpText).length && this.helpText.keyPersons && this.helpText.keyPersons.parentHelpTexts.length) {
            this.helpText = setHelpTextForSubItems(this.helpText, 'keyPersons');
        }
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
        this._autoSaveService.clearUnsavedChanges();
    }

    private getProposalDetailsFromRoute() {
        this.$subscriptions.push(this._activatedRoute.queryParams.subscribe(params => {
            if (this.proposalIdBackup != this.result.proposal.proposalId) {
                this.proposalIdBackup = params['proposalId'];
                this.resetPersonFields();
            }
        }));
    }

    async getPermissions() {
        this.isMaintainTraining = await this._commonService.checkPermissionAllowed('MAINTAIN_TRAINING');
        this.isMaintainPerson = await this._commonService.checkPermissionAllowed('MAINTAIN_PERSON');
        this.isMaintainRolodex = await this._commonService.checkPermissionAllowed('MAINTAIN_ROLODEX');
    }
    /**checkIfUnitExist - isUnitExist false units are empty or all the units are deleted.
     * isUnitExist is used to change the placeholder and information message of department
     * method is called each time a change is occured in units array
    */
    checkIfUnitExist() {
        this.isUnitExist = this.personDetails.units.length === 0 || this.personDetails.units.every(unit => unit.isDeleted) ? false : true;
    }

    /** filterRoleTypes - change role types according to change in Multi-PI checkbox */
    filterRoleTypes() {
        this.roleTypesArray = this.personDetails.isMultiPi ?
            this.result.proposalPersonRoles.filter(roleTypeObject =>
                roleTypeObject.isMultiPi === 'Y' || roleTypeObject.isMultiPi === 'D' || !roleTypeObject.isMultiPi) :
            this.result.proposalPersonRoles.filter(roleTypeObject =>
                roleTypeObject.isMultiPi === 'N' || roleTypeObject.isMultiPi === 'D' || !roleTypeObject.isMultiPi);
    }

    changeMultiPI() {
        this.personDetails.proposalPersonRole = null;
        this.personDetails.projectRole = null;
        this.noRightOnUnitMsg = null;
        this.filterRoleTypes();
    }

    /**selectedMemberName - assigns elastic result to an member object and desired function is called as per person type
     * @param  {} value
     */
    selectedMemberName(value) {
        this.isShowPersonResultCard = false;
        this.isProposalAndPersonUnitSame = false;
        this.clearUnits();
        this.noRightOnUnitMsg = null;
        if (value) {
            this.isProposalAndPersonUnitSame = this.result.proposal.homeUnitNumber === value.unit_number;
            if (!this.isProposalAndPersonUnitSame && (this.personDetails.proposalPersonRole && this.personDetails.proposalPersonRole.id === 3)) {
                this.prepareUnitObject(this.result.proposal.homeUnitNumber, this.result.proposal.homeUnitName, true);
            }
            this.isShowPersonResultCard = true;
            this.selectedMemberObject = value;
            !this.isNonEmployee ? this.setEmployeeDetails(value) : this.setNonEmployeeDetails(value);
            if (value.unit_number) {
                this.prepareUnitObject(value.unit_number, value.unit_name, this.isProposalAndPersonUnitSame);
            }
        } else {
            this.clearPersonDetails();
        }
    }

    checkAndFilterPrivateAttachmentTypes(attachmentTypes: Array<ProposalAttachmentTypes>): Array<ProposalAttachmentTypes> {
        if (this.isShowConfidentialAttachment) {
            return attachmentTypes;
        } else {
            return attachmentTypes.filter(element => !element.isPrivate);
        }
    }

    /**
     * Executes every time when user changes the role of keyperson drop down field.
     * proposalPersonRole.id as 3 indicates Lead Principal Investigator. If that is selected,
     * then we need to take Proposal's lead unit and assign as selected PI's leadunit by default and
     * if user selects other roles, then remove merged proposals lead unit from person's unit list.
     */
    checkLeadPISelected() {
        this.noRightOnUnitMsg = null;
        (this.personDetails.proposalPersonRole && this.personDetails.proposalPersonRole.id === 3) ?
            this.checkProposalUnit() : this.checkAndDeleteProposalUnit();
    }

    /**
     * This function will be triggered whenever the user selects Lead PI from role dropdown.
     * This will take proposals lead unit and check if that unit is already there in person's
     * saved units list. If no, then proposal's lead unit will merged into persons units list
     * as lead unit. If already exists, then just mark that unit as lead unit.
     */
    checkProposalUnit() {
        this.clearLeadUnitFlag();
        const duplicateUnitIndex = this.personDetails.units.length ?
            this.personDetails.units.findIndex(unit => unit.unitNumber === this.result.proposal.homeUnitNumber && !unit.isDeleted) : -1;
        (duplicateUnitIndex === -1) ? this.prepareUnitObject(this.result.proposal.homeUnitNumber, this.result.proposal.homeUnitName, true) :
            this.personDetails.units[duplicateUnitIndex].leadUnit = true;
    }

    /**
     * Deletes the proposal lead unit from the person unit list if it is not a saved one.
     * This will trigger when user choose any roles other than Lead PI.
     */
    checkAndDeleteProposalUnit() {
        if (!this.isProposalAndPersonUnitSame) {
            const deleteIndex = this.personDetails.units.findIndex(unit => unit.unitNumber === this.result.proposal.homeUnitNumber && !unit.isDeleted);
            if (deleteIndex !== -1 && !this.personDetails.units[deleteIndex].propPersonUnitId) {
                this.deleteDepartment(deleteIndex);
            }
        }
    }

    /** Bind the value of rolodex to elastic search field after adding new non employee
    * @param rolodexObject
    */
    setRolodexPersonObject(rolodexObject) {
        if (rolodexObject.rolodex) {
            this.mandatoryList.delete('name');
            this.clearField = new String('false');
            this.elasticSearchOptions.defaultValue = rolodexObject.rolodex.fullName;
            this.personDetails.fullName = rolodexObject.rolodex.fullName;
            this.personDetails.rolodexId = rolodexObject.rolodex.rolodexId;
            this.personDetails.designation = rolodexObject.rolodex.designation;
            if (rolodexObject.rolodex.organization) {
              this.personDetails.department = rolodexObject.rolodex.organizations ?
              rolodexObject.rolodex.organizations.organizationName : '';
             } else {
              this.personDetails.department = rolodexObject.rolodex.organizationName ?
              rolodexObject.rolodex.organizationName : '';
             }
             this.selectedMemberObject = rolodexObject.rolodex;
            this.isShowPersonResultCard = true;
        }
        $('#add-key-person-modal').modal('show');
        this.isAddNonEmployeeModal = rolodexObject.nonEmployeeFlag;
    }

    clearUnits() {
        if (this.personDetails.units.length !== 0) {
            this.clearLeadUnitFlag();
            this.clearUnSavedDepartments();
            this.clearSavedDepartments();
        }
    }

    /**clearLeadUnitFlag - method set all leadUnitFlag of units to false*/
    clearLeadUnitFlag() {
        this.personDetails.units.map(unit => unit.leadUnit = false);
    }

    /**clearSavedDepartments - sets isDeleted = true for departments of earlier chosed */
    clearSavedDepartments() {
        if (this.personDetails.units.some(unit => unit.propPersonUnitId)) {
            this.personDetails.units.forEach((element, index) => {
                if (element.propPersonUnitId) {
                    this.personDetails.units[index].isDeleted = true;
                }
            });
            this.$unitList.next();
        }
    }

    /**clearUnSavedDepartments - Clears departments of earlier chosed person if they were not saved*/
    clearUnSavedDepartments() {
        const index = this.personDetails.units.findIndex((element) => !element.propPersonUnitId);
        if (index !== -1) {
            this.personDetails.units.splice(index, this.personDetails.units.length);
            this.$unitList.next();
        }
    }

    /**setEmployeeDetails - To set person id and full name if an employee is selected from elastic search
    * @param  {} value
    */
    setEmployeeDetails(value) {
        this.personDetails.personId = value.prncpl_id;
        this.personDetails.fullName = value.full_name;
        this.personDetails.designation = value.primary_title;
    }

    /**setNonEmployeeDetails - To set rolodex id and full name if a non-employee is selected from elastic search
    * @param  {} value
    */
    setNonEmployeeDetails(value) {
        this.personDetails.rolodexId = parseInt(value.rolodex_id, 10);
        value.first_name = value.first_name || '';
        value.middle_name = value.middle_name || '';
        value.last_name = value.last_name || '';
        value.organization = !value.organization ? '' : value.organization;
        this.personDetails.fullName = value.full_name ? value.full_name :
            !value.first_name && !value.middle_name && !value.last_name ?
                value.organization : value.last_name + ' , ' + value.middle_name + value.first_name;
        this.personDetails.department = value.organization;
        this.personDetails.designation = value.designation;
    }

    /** prepareUnitObject - prepares and push selected department into list of
     *  departments if there is no duplication
     * */
    prepareUnitObject(unitNumber, unitName, isLeadUnit) {
        const unitDetails: any = {
            isDeleted: false,
            leadUnit: isLeadUnit,
            unit: {
                unitName: unitName,
                unitNumber: unitNumber
            },
            unitNumber: unitNumber,
            updateTimestamp: getCurrentTimeStamp,
            updateUser: this._commonService.getCurrentUserDetail('userName')
        };
        this.personDetails.units.push(unitDetails);
        this.$unitList.next();
    }

    /**clearPersonDetails - clears person's Id, and choosed departments if person is cleared or not valid */
    clearPersonDetails() {
        delete this.personDetails['personId'];
        delete this.personDetails['rolodexId'];
        this.mandatoryList.delete('name');
        this.elasticSearchOptions.errorMessage = this.deptHttpOptions.errorMessage = null;
    }

    /** changeMemberType - if a person is employee then sets fibiperson elastic search otherwise sets fibirolodex elastic search */
    changeMemberType() {
        this.clearField = new String('true');
        this.elasticSearchOptions.defaultValue = '';
        this.isShowPersonResultCard = false;
        delete this.personDetails['personId'];
        delete this.personDetails['rolodexId'];
        this.personDetails.fullName = null;
        this.personDetails.department = null;
        this.clearUnits();
        this.mandatoryList.clear();
        this.noRightOnUnitMsg = null;
        this.elasticSearchOptions = (!this.isNonEmployee) ?
            this._elasticConfig.getElasticForPerson() : this._elasticConfig.getElasticForRolodex();
    }

    /**triggerUnitChange - method is triggered when a department is chosed from the list and validates it.
     * @param {} result
    */
    triggerUnitChange(result) {
        this.noRightOnUnitMsg = null;
        if (result) {
            this.validateUnitSelected(result);
        }
       
    }

    /**validateUnitSelected - validates if duplicate department is added if unitNumber is same and unit is not deleted
     * @param {} result
     */
    validateUnitSelected(result) {
        this.clearDeptField = new String('true');
        const keyUnit = this.personDetails.units.find(unit => unit.unitNumber === result.unitNumber && !unit.isDeleted);
        keyUnit ? this.deptHttpOptions.errorMessage = 'Department already added' : this.setUnitDetails(result);
    }

    setUnitDetails(result: any) {
        this.checkLeadUnitAdded() ? this.prepareUnitObject(result.unitNumber, result.unitName, false) :
            this.checkRightForNewUnit(result, 'CREATE_PROPOSAL');
        this.deptHttpOptions.errorMessage = null;
    }

    checkLeadUnitAdded() {
        return this.personDetails.units.length && this.personDetails.units.some(unit => unit.leadUnit === true) ? true : false;
    }

    checkRightForNewUnit(result, right) {
        this.$subscriptions.push(this._proposalHomeService.checkUnitRight({
            'unitNumber': result.unitNumber, 'rightName': right
        }).subscribe((data: any) => {
            this.prepareUnitObject(result.unitNumber, result.unitName, data.isRightExist);
        }));
    }

    /**deleteDepartment - isDeleted is set true to delete already saved departments from db,
     * otherwise just splices the array from the view
     * */
    deleteDepartment(index) {
        this.personDetails.units[index].leadUnit = false;
        this.personDetails.units[index].propPersonUnitId ? this.personDetails.units[index].isDeleted = true :
            this.personDetails.units.splice(index, 1);
        this.$unitList.next();
    }

    /**keyPersonValidation - validation on adding and editing keypersonnal data */
    keyPersonValidation() {
        this.mandatoryList.clear();
        this.elasticSearchOptions.errorMessage = this.deptHttpOptions.errorMessage = null;
        this.validateMandatoryFields();
        if (this.result.proposalPersons && this.result.proposalPersons.length) {
            for (const PERSON of this.result.proposalPersons) {
                this.isDuplicatePerson(PERSON);
                this.isDuplicatePI(PERSON);
            }
        }
        this.mandatoryList.size ? '' : this.saveKeyPerson();
    }

    validateMandatoryFields() {
        if ((!this.isNonEmployee && !this.personDetails.personId) || (this.isNonEmployee && !this.personDetails.rolodexId)) {
            this.elasticSearchOptions.errorMessage = '* Please provide a person name.';
            this.mandatoryList.set('name', 'fullname');
        }
        if (this.personDetails.proposalPersonRole === 'null' || !this.personDetails.proposalPersonRole) {
            this.mandatoryList.set('role', '* Please provide a role.');
        } else {
            this.personDetails.personRoleId = this.personDetails.proposalPersonRole.id;
            this.personDetails.isPi = this.personDetails.proposalPersonRole.code === 'PI' ? true : false;
            if (!this.personDetails.isPi) {
                this.clearLeadUnitFlag();
            }
        }
        this.limitKeypress(this.personDetails.percentageOfEffort);
        if (this.personDetails.isPi && !this.personDetails.units.find(unit => unit.leadUnit === true)) {
            this.deptHttpOptions.errorMessage = 'Please add one Lead Unit for adding Principal Investigator.';
            // dummy map to trigger validation.
            this.mandatoryList.set('dept', 'Please add one Lead Unit for adding Principal Investigator');
        }
    }

    isDuplicatePerson(PERSON) {
        if (this.isDuplicateEmployee(PERSON) || this.isDuplicateNonEmployee(PERSON)) {
            if (!PERSON.proposalPersonId || (PERSON.proposalPersonId !== this.personDetails.proposalPersonId)) {
                this.elasticSearchOptions.errorMessage = 'You have already added ' + this.personDetails.fullName + '.';
                this.clearField = new String('false');
                this.mandatoryList.set('name', 'fullname');
                this.isShowPersonResultCard = false;
            }
        }
    }

    /**isDuplicateEmployee - Function to check if currently added person under employee is already added
    *  and returns true if match found
    */
    isDuplicateEmployee(PERSON) {
        return (!this.isNonEmployee && PERSON.personId === this.personDetails.personId) ? true : false;
    }

    /**isDuplicateNonEmployee - Function to check if currently added person under non-employee is already added
    *  and returns true if match found
    */
    isDuplicateNonEmployee(PERSON) {
        return (this.isNonEmployee && PERSON.rolodexId === this.personDetails.rolodexId) ? true : false;
    }

    isDuplicatePI(PERSON) {
        if (PERSON.isPi && this.personDetails.isPi) {
            if (!PERSON.proposalPersonId || (PERSON.proposalPersonId !== this.personDetails.proposalPersonId)) {
                this.mandatoryList.set('role', 'You have already added a Principal Investigator.');
                this.isShowPersonResultCard = false;
            }
        }
    }

    /**limitKeypress - limit the input field b/w 0 and 100 with 2 decimal points
     * @param {} value
     */
    limitKeypress(value) {
        this.mandatoryList.delete('percentageOfEffort');
        if (validatePercentage(value)) {
            this.mandatoryList.set('percentageOfEffort', validatePercentage(value));
        }
    }

    /**addPersonAttachment - Adds(if Key Person add) or Updates(if Key Person edit) CV
    */
    addPersonAttachment() {
        const tempArrayForAdd = [];
        if (this.checkMandatoryFilled() && !this.isSaving) {
            this.isSaving = true;
            this.setRequestObjectForPersonnelAttachment(tempArrayForAdd);
            this.result.newAttachments = tempArrayForAdd;
            this.$subscriptions.push(
                this._proposalService
                    .uploadProposalPersonAttachment(this.result.newAttachments, this.uploadedFile, this.result.proposal.proposalId)
                    .subscribe((success: any) => {
                        this.isSaving = false;
                        const selectedProposalPersonId = success.newPersonAttachments[0].proposalPersonId;
                        const originalProposalPersonObj = this.result.proposalPersons
                            .find(person => person.proposalPersonId == selectedProposalPersonId);
                        const isSelectedPersonEdited = (this.personDetails && this.personDetails.proposalPersonAttachment
                            && selectedProposalPersonId === this.personDetails.proposalPersonId);
                        success.newPersonAttachments.forEach(attachment => {
                            this.uploadedFiles.push(attachment);
                            originalProposalPersonObj.proposalPersonAttachment.push(attachment);
                            if (isSelectedPersonEdited) {
                                this.personDetails.proposalPersonAttachment.push(attachment);
                            }
                        });
                        this._dataStore.updateStore(['proposalPersons'], this.result);
                    },
                        error => {
                            this._commonService.showToast(HTTP_ERROR_STATUS, 'Adding ' + this.keyPersonnelLabel + ' Attachment failed. Please try again.')
                            this.isSaving = false;
                        },
                        () => {
                            const toastMsg = 'Attachment added successfully.';
                            this._commonService.showToast(HTTP_SUCCESS_STATUS, toastMsg);
                            this.isSaving = false;
                            this.clearCVData();
                        }));
        }
    }

    /**
     * setRequestObjectForPersonnelAttachment- set request object for adding personnel attachment
     * @param tempArrayForAdd
     */
    setRequestObjectForPersonnelAttachment(tempArrayForAdd) {
        for (let uploadIndex = 0; uploadIndex < this.uploadedFile.length; uploadIndex++) {
            const tempObjectForAdd: any = {};
            tempObjectForAdd.attachmentType = this.result.personnelAttachTypes.find(attachtype =>
                attachtype.attachmentTypeCode === parseInt(this.selectedAttachmentType[uploadIndex], 10));
            tempObjectForAdd.attachmentTypeCode = tempObjectForAdd.attachmentType.attachmentTypeCode;
            tempObjectForAdd.proposalPersonId = this.selectedPersonEdit.proposalPersonId;
            tempObjectForAdd.description = this.selectedAttachmentDescription[uploadIndex];
            tempObjectForAdd.fileName = this.uploadedFile[uploadIndex].name;
            tempArrayForAdd[uploadIndex] = tempObjectForAdd;
        }
    }

    /**
     *
     * @returns returns warning message if field is empty
     */
    checkMandatoryFilled() {
        this.attachmentWarningMsg = null;
        for (let uploadIndex = 0; uploadIndex < this.uploadedFile.length; uploadIndex++) {
            if (this.selectedAttachmentType[uploadIndex] === 'null' || this.selectedAttachmentType[uploadIndex] == null) {
                this.attachmentWarningMsg = '* Please fill all the mandatory fields';
            }
        }
        return !this.attachmentWarningMsg;
    }

    /** if cv is uploaded, sets parameters,  calls saveAttachment,
   * Otherwise calls saveWafRequest function in wafAttachment service.
   */
    async addPersonAttachmentWaf() {
        const requestForWaf: any = {
            proposalId: this.result.proposal.proposalId,
            userFullName: this._commonService.getCurrentUserDetail('fullName')
        };
        const requestSetAtRemaining = {
            newPersonAttachments: this.personDetails.proposalPersonAttachment
        };
        if (this.uploadedFile.length > 0) {
            const data = await this._wafAttachmentService.saveAttachment(requestForWaf, requestSetAtRemaining, this.uploadedFile,
                '/addProposalPersonAttachmentForWaf', null, null);
            this.checkCvSaved(data);
        } else {
            requestForWaf.newPersonAttachments = this.personDetails.proposalPersonAttachment;
            this._wafAttachmentService.saveWafRequest(requestForWaf, '/addProposalPersonAttachmentForWaf').then(data => {
                this.checkCvSaved(data);
            }).catch(error => {
                this.checkCvSaved(error);
            });
        }
    }
    /**
    * @param  {} data
    * if data doesn't contains error, cv details is added and sets to personDetails for saving the keyperson
    */
    checkCvSaved(data) {
        if (data && !data.error) {
            this.personDetails.proposalPersonAttachment = data.newPersonAttachments;
            this.saveKeyPerson();
        } else {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Waf blocked adding CV.');
        }
        this.isSaving = false;
    }

    /**saveKeyPerson - Add or Update person details to the database
    */
    saveKeyPerson() {
        this.setCommonRequestObject();
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._proposalHomeService.addKeyPerson({
                'proposalId': this.result.proposal.proposalId,
                'proposalPerson': this.personDetails,
                'previousProposalPersonId': this.checkPersonReplacedOrNot(),
                'previousNonEmployeeFlag': this.previousProposalPersonId ? this.previousNonEmployeeFlag : null,
                'updateUser': this._commonService.getCurrentUserDetail('userName')
            }).subscribe((data: any) => {
                this.result.grantEligibilityStatus = data.grantEligibilityStatus;
                if (data.grantEligibilityStatus && data.grantEligibilityStatus.status === 'TRUE') {
                    this.addOrUpdateProposalPersons(data);
                    this.result.proposal.investigator = data.proposal.investigator;
                    this.result.proposal.homeUnitName = data.proposal.homeUnitName;
                    this.result.proposal.homeUnitNumber = data.proposal.homeUnitNumber;
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, (this.editIndex !== null) ?
                        (this.keyPersonnelLabel + ' updated successfully.') : (this.keyPersonnelLabel + ' added successfully'));
                    this._dataStore.updateStore(['grantEligibilityStatus', 'proposal', 'proposalPersons'], this.result);
                } else {
                    $('#EligibilityWarningKeyPersonModal').modal('show');
                }
                this.isSaving = false;
                this.resetPersonFields();
                $('#add-key-person-modal').modal('hide');
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, (this.editIndex !== null) ?
                    ('Updating ' + this.keyPersonnelLabel + '  failed. Please try again.') :
                    ('Adding ' + this.keyPersonnelLabel + '  failed. Please try again.'));
                this.isSaving = false;
            }));
        }
    }

    private addOrUpdateProposalPersons(data: any) {
        if (this.editIndex != null) {
            this.result.proposalPersons[this.editIndex] = data.proposalPerson;
        } else {
            this.result.proposalPersons.push(data.proposalPerson);
        }
    }

    checkPersonReplacedOrNot() {
        if (this.personDetails.personId) {
            return this.previousProposalPersonId === this.personDetails.personId ? null : this.previousProposalPersonId;
        } else {
            return this.previousProposalPersonId === this.personDetails.rolodexId ? null : this.previousProposalPersonId;
        }
    }

    /**Remove unitNumber, phoneNo, unitName from personDetails as they are not required for calling service
     */
    setCommonRequestObject() {
        ['unitNumber', 'phoneNo', 'unitName'].forEach(detail => delete this.personDetails[detail]);
        this.personDetails.updateTimeStamp = (new Date()).getTime();
        this.personDetails.updateUser = this._commonService.getCurrentUserDetail('userName');
        this.personDetails.proposalId = this.result.proposal.proposalId;
    }

    /** resetPersonFields - to clear all the details of the person and to disable all the flags  */
    resetPersonFields() {
        this.personDetails = {};
        this.personDetails.units = [];
        this.$unitList.next();
        this.personDetails.proposalPersonRole = null;
        this.uploadedFile = [];
        this.isNonEmployee = false;
        this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
        this.filterRoleTypes();
        this.elasticSearchOptions.defaultValue = '';
        this.clearField = new String('true');
        this.editIndex = null;
        this.mandatoryList.clear();
        this.isShowPersonResultCard = false;
        this.previousProposalPersonId = null;
        this.previousNonEmployeeFlag = null;
        this.noRightOnUnitMsg = null;
        this.deptHttpOptions.errorMessage = null;
    }

    /** deletePerson - deletes project person details */
    deletePerson() {
        this.$subscriptions.push(this._proposalHomeService.deleteProposalPerson({
            'proposalId': this.result.proposal.proposalId,
            'proposalPersonId': this.deletePersonId
        }).subscribe((data: any) => {
            this.result.proposal.investigator = data.proposal.investigator;
            this.result.proposalPersons = data.proposalPersons;
            this._dataStore.updateStore(['proposal', 'proposalPersons'], this.result);
        },
            err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Removing ' + this.keyPersonnelLabel + ' failed. Please try again.');
            },
            () => {
                this._commonService.showToast(HTTP_SUCCESS_STATUS, this.keyPersonnelLabel + ' removed successfully.');
            }));
    }

    /**
     *
     * @param files
     * Able to add multiple attachments
     */
    cvDrop(files) {
        if (files && files.length > 0) {
            for (let index = 0; index < files.length; index++) {
                this.updateAddAttachmentDetails(files, index);
            }
        }
    }

    /**
     * updateAddAttachmentDetail()- updates with dropped files to push
     * @param files
     * @param index
     */
    updateAddAttachmentDetails(files, index) {
        this.uploadedFile.push(files[index]);
        this.selectedAttachmentType[this.uploadedFile.length - 1] = null;
        this.selectedAttachmentDescription[this.uploadedFile.length - 1] = '';
    }

    /**
     * deleteFromUploadedFileList - to delete the attachment before pushing
     * @param index
     */
    deleteFromUploadedFileList(index) {
        this.selectedAttachmentType.splice(index, 1);
        this.selectedAttachmentDescription.splice(index, 1);
        this.uploadedFile.splice(index, 1);
        this.attachmentWarningMsg = null;
    }

    deleteCV(deleteProposalCV) {
        deleteProposalCV.splice(0, 1);
    }

    clearCVData() {
        this.uploadedFile = [];
    }

    addCV() {
        if (this.uploadedFile.length !== 0) {
            this.setCVObject(this.uploadedFile);
        }
    }

    setCVObject(files) {
        this.personDetails.proposalPersonAttachment = [];
        const tempOjectForAdd: any = {};
        tempOjectForAdd.fileName = files ? files[0].name : null;
        tempOjectForAdd.mimeType = files ? files[0].type : null;
        tempOjectForAdd.description = null;
        this.personDetails.proposalPersonAttachment.push(tempOjectForAdd);
    }

    downloadProposalPersonCV(attachment) {
        this.$subscriptions.push(this._proposalHomeService.downloadProposalPersonAttachment(attachment.attachmentId)
            .subscribe(data => {
                fileDownloader(data, attachment.fileName);
            })
        );
    }

    /*viewKeyPerson - Function navigates to desired page to view details of a person */
    viewKeyPerson() {
        const a = document.createElement('a');
        this.selectedPersonDetails.hasOwnProperty('personId') ?
            a.href = '#/fibi/person/person-details?personId=' + this.selectedPersonDetails.personId :
            a.href = '#/fibi/rolodex?rolodexId=' + this.selectedPersonDetails.rolodexId;
        a.target = '_blank';
        a.click();
        a.remove();
    }

    getPersonId(person: ProposalPerson) {
        return person.personId ? person.personId : person.rolodexId;
    }

    fetchKeyPersonDetails(person): void {
      this.isRolodexViewModal = true;
      this.personDescription = person.proposalPersonRole.description;
      this.isTraining = this.canShowTraining;
      this.trainingStatus = person.trainingStatus;
      this.proposalPersonId = person.proposalPersonId;
      if (person.personId) {
        this.id = person.personId;
      } else {
        this.id = person.rolodexId;
        this.type = 'ROLODEX';
      }
    }

    checkPersonViewPermission(person) {
        if (person.personId) {
            this.isEnableViewMore = this.isMaintainPerson || (person.personId === this._commonService.getCurrentUserDetail('personID'));
        } else {
            this.isEnableViewMore = this.isMaintainRolodex;
        }
    }

    setCanViewTrainingDetails(person) {
        this.canViewTrainingDetails = this.hasTrainingRightOrIsLoggedInUser(person);
    }

    hasTrainingRightOrIsLoggedInUser(person) {
        return this.isMaintainTraining ||
            (person.personId === this._commonService.getCurrentUserDetail('personID'));
    }

    private getPersonRes(person, res) {
        return person.personId ? res.person : res.rolodex;
    }


    updateSelectedPersonDetails(selectedPersonDetails, person) {
        this.selectedPersonDetails = selectedPersonDetails;
        this.selectedPersonDetails.proposalPersonRole = person.proposalPersonRole;
        this.selectedPersonDetails.trainingStatus = person.trainingStatus;
    }

    /**setLeadUnitFlag - sets all leadUnit values to false and set leadUnit of selected unit to true
     * @param unitIndex
     */
    setLeadUnitFlag(unitIndex) {
        this.clearLeadUnitFlag();
        this.personDetails.units[unitIndex].leadUnit = true;
        this.$unitList.next();
    }

    /**
     * This will invoked when user try to change lead unit when clicking on a unit.
     * If user try to mark a unit as lead unit which is current proposal leadunit then no API will be called.
     * Otherwise it will call API to check passed right as parameter is matched thus changing lead unit accordingly.
     * @param unitIndex
     * @param right
     */
    checkUnitRight(unitIndex, right) {
        this.noRightOnUnitMsg = null;
        if (this.personDetails.units[unitIndex].unitNumber !== this.result.proposal.homeUnitNumber) {
            this.$subscriptions.push(this._proposalHomeService.checkUnitRight({
                'unitNumber': this.personDetails.units[unitIndex].unitNumber, 'rightName': right
            }).subscribe((data: any) => {
                data.isRightExist ? this.setLeadUnitFlag(unitIndex) :
                    this.noRightOnUnitMsg = `You don't have right on unit '${this.personDetails.units[unitIndex].unit.unitName}' to mark as lead unit.`;
            }));
        } else {
            this.setLeadUnitFlag(unitIndex);
        }
    }

    /**@param  {} index
     * @param  {} rolodexId
     * sets details to edit key personnel
     */
    editKeyPerson(index) {
        this.selectedMemberObject = {};
        this.isShowPersonResultCard = false;
        this.mandatoryList.clear();
        this.deptHttpOptions.errorMessage = null;
        this.editIndex = index;
        this.personDetails = JSON.parse(JSON.stringify(this.result.proposalPersons[index]));
        this.isNonEmployee = this.personDetails.personId ? false : true;
        this.elasticSearchOptions = (!this.isNonEmployee) ?
            this._elasticConfig.getElasticForPerson() : this._elasticConfig.getElasticForRolodex();
        this.filterRoleTypes();
        this.personDetails.proposalPersonRole = this.roleTypesArray.find(role => role.id ===
            this.result.proposalPersons[index].proposalPersonRole.id);
        this.elasticSearchOptions.defaultValue = this.personDetails.fullName;
        this.elasticSearchOptions = Object.assign({}, this.elasticSearchOptions);
        this.replaceAttachmentId = this.personDetails.proposalPersonAttachment.length !== 0 ?
            this.personDetails.proposalPersonAttachment[0].attachmentId : null;
        this.clearField = new String('false');
        this.$unitList.next();
        this.previousProposalPersonId = (!this.isNonEmployee) ? this.personDetails.personId : this.personDetails.rolodexId;
        this.previousNonEmployeeFlag = this.isNonEmployee;
    }

    /**loadPersonnelAttachTypes()-
     * to load personnel Attachment types
     */
    loadPersonnelAttachTypes() {
        if (!this.result.personnelAttachTypes) {
            this.$subscriptions.push(this._proposalHomeService
                .loadPersonnelAttachTypes()
                .subscribe((data: any) => {
                    this.result.personnelAttachTypes = this.checkAndFilterPrivateAttachmentTypes(data);
                    this._dataStore.updateStore(['personnelAttachTypes'], this.result);
                }, _err => this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching Personnel Attachment Types failed. Please try again.')));
        }
    }

    /**
     * sortResult- to sort the data in modal
     * @param type
     */
    sortResult(type) {
        this.isReverse = !this.isReverse;
        this.sortListBy = type;
        this.direction = this.isReverse ? 1 : -1;
    }

    /**
     * getVersion - get latest version of the attachments
     * @param files
     */
    getVersion(files) {
        this.uploadedFiles = files.filter(attachObj => attachObj.documentStatusCode === 1);
    }

    notifyPersonCertification(person: ProposalPerson) {
        this._proposalService.notifyModalData.next({ mode: 'SINGLE', selectedPerson: person });
    }

    navigateToCertification({ proposalPersonId }: ProposalPerson) {
        this._router.navigate(['/fibi/proposal/certification'],
            { queryParamsHandling: 'merge', queryParams: { proposalPersonId: proposalPersonId } });
    }

    setCanShowCertificationAndTraining() {
        this.canShowCertification = this._proposalService.proposalSectionConfig['DP315']
            && this._proposalService.proposalSectionConfig['DP315'].isActive;
        this.canShowTraining = this._proposalService.proposalSectionConfig['347']
            && this._proposalService.proposalSectionConfig['347'].isActive;
    }

    clearProjectRole(): void {
        if (!this.personDetails.proposalPersonRole.showProjectRole) {
            this.personDetails.projectRole = null;
        }
    }

    setPersonRolodexModalView(personRolodexObject) {
      this.isRolodexViewModal = personRolodexObject.isPersonRolodexViewModal;
      this.isTraining = false;
      this.trainingStatus = null;
      this.type = 'PERSON';
    }

    switchToNonEmployeeModal() {
        $('#add-key-person-modal').modal('hide');
        this.isAddNonEmployeeModal = true;
    }
    setShowElasticResults(elasticResultShow) {
        this.isShowPersonResultCard = elasticResultShow.isShowElasticResults;
    }

}
