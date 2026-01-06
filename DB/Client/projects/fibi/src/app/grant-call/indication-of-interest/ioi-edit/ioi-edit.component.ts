import { Component, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';
import { IndicationOfInterestService } from '../indication-of-interest.service';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { GrantCommonDataService } from '../../services/grant-common-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { convertToValidAmount, inputRestrictionForAmountField } from '../../../common/utilities/custom-utilities';
import { getEndPointOptionsForDepartment } from '../../../common/services/end-point.config';
import { GrantCallService } from '../../services/grant.service';

@Component({
    selector: 'app-ioi-edit',
    templateUrl: './ioi-edit.component.html',
    styleUrls: ['./ioi-edit.component.css']
})
export class IoiEditComponent implements OnInit, OnChanges, OnDestroy {

    isNonEmployee = false;
    isViewMode = true;
    deletePersonId;
    clearField: String;
    clearDeptField: String;
    clearPIField: String;
    clearPiDeptField: String;
    deptHttpOptions: any = {};
    piDeptHttpOptions: any = {};
    piElasticSearchOptions: any = {};
    elasticSearchOptions: any = {};
    propPersonRole: any = {};
    ioiPerson: any = {};
    ioiLookUps: any = {};
    warningMsg: any = {};
    ioiFetchValues: any = {};
    teamMemberList = [];
    spliceIndex: any;
    grantCallId;
    isQuestionnaireViewMode = false;
    $subscriptions: Subscription[] = [];
    result: any = {};
    grantCallIOIId: any;
    roleType = null;
    currency;
    isSaving = false;

    configuration: any = {
        moduleItemCode: null,
        moduleSubitemCodes: [1],
        moduleItemKey: '',
        moduleSubItemKey: 0,
        actionUserId: this._commonService.getCurrentUserDetail('personID'),
        actionPersonName: this._commonService.getCurrentUserDetail('fullName'),
        enableViewMode: false,
        isChangeWarning: true,
        isEnableVersion: true,
        questionnaireNumbers: []
    };
    memberRoleWarning = '';

    constructor(
        private _commonService: CommonService,
        private _elasticConfig: ElasticConfigService,
        public _ioiService: IndicationOfInterestService,
        private _commonData: GrantCommonDataService,
        private route: ActivatedRoute,
        public _grantService: GrantCallService,
        private _router: Router) { }

    ngOnChanges() {
        this.isQuestionnaireViewMode = this.ioiFetchValues.grantCallIOIId != null ? false : true;
    }

    ngOnInit() {
        this.getGrantCallGeneralData();
        this.grantCallIOIId = this.route.snapshot.queryParams['ioiId'];
        this.isQuestionnaireViewMode = this.grantCallIOIId != null ? false : true;
        this._grantService.ioiFetchValues = this.ioiFetchValues;
        this.ioiFetchValues.grantCallIOI = {};
        this.ioiFetchValues.grantCallIOIMemberList = {};
        this.loadIOIbyGrant();
        this._commonData.$isIoiActive.next(false);
        this.currency = this._commonService.currencyFormat;
        this.configuration.moduleItemKey = this.grantCallId;
        this.setQuestionnaireMode();
        this.subscriptionSubmit();
    }

    setQuestionnaireMode() {
        this.configuration.enableViewMode = this.route.snapshot.routeConfig.path === 'view' ? [1] : [0];
    }

    getGrantCallGeneralData() {
        this.$subscriptions.push(this._commonData.$grantCallData.subscribe((data: any) => {
            if (data) {
                this.result = JSON.parse(JSON.stringify(data));
                this.grantCallId = this.result.grantCall.grantCallId;
            }
        }));
    }

    /**
     * @param  {this.grantCallId}} when grant call id and update user is  passed lookup data will load for ioi.
     * @param  {updateUser}} when grant call id and update user is  passed lookup data will load for ioi.
     * @param  {this.grantCallIOIId}} when the grantCallIOIId is not null, the function edits the previously created IOI.
     */
    // this.ioiLookUps = data; and this.ioiFetchValues = data; used here ???
    loadIOIbyGrant() {
        this.$subscriptions.push(this._ioiService.fetchDetails({
            'grantCallId': this.grantCallId,
            'updateUser': this._commonService.getCurrentUserDetail('userName'),
            'grantCallIOIId': this.grantCallIOIId
        }).subscribe((data: any) => {
            this.ioiLookUps = data;
            this.fetchIoiValues(data);
            this.searchInitialization();
            this.ioiFetchValues.grantCallIOIMemberList = {};
            this.elasticSearchOptions = !this.isNonEmployee ? this._elasticConfig.getElasticForPerson() :
                this.elasticSearchOptions = this._elasticConfig.getElasticForRolodex();
        }));
    }

    updateConfigurationData() {
        if (this.ioiLookUps.grantCallIOIQuestionnaire) {
            this.configuration.questionnaireNumbers = [this.ioiLookUps.grantCallIOIQuestionnaire.questionnaireId];
            this.configuration.moduleItemCode = 15;
            this.configuration.moduleSubItemCode = 1;
            this.configuration.moduleSubItemKey = this.ioiFetchValues.grantCallIOIId || this.grantCallIOIId;
            this.configuration.moduleItemKey = this.grantCallId;
            this.configuration = JSON.parse(JSON.stringify(this.configuration));
        }
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
        this._commonData.$isIoiActive.next(true);
    }

    submitIOI() {
        this.ioiFetchValues.grantCallIOI.grantIOIStatusCode = 2;
        this.saveBasicIOIDetails();
        (this.ioiFetchValues.grantCallIOIId) ? this.isQuestionnaireViewMode = false : this.isQuestionnaireViewMode = true;
    }

    fetchIoiValues(data) {
        if (this.grantCallIOIId) {
            this.ioiFetchValues = data;
            this._grantService.ioiFetchValues = this.ioiFetchValues;
            if (this.ioiFetchValues.grantCallIOIMemberList.length > 0) {
                this.teamMemberList = this.ioiFetchValues.grantCallIOIMemberList;
            }
            this.updateConfigurationData();
        }
    }

    /** for initializing the elastic and endpoint searches */
    searchInitialization() {
        this.piElasticSearchOptions = this._elasticConfig.getElasticForPerson();
        this.deptHttpOptions = getEndPointOptionsForDepartment();
        this.piDeptHttpOptions = getEndPointOptionsForDepartment();
        this.piElasticSearchOptions.defaultValue = this.ioiFetchValues.grantCallIOIId ?
            this.ioiFetchValues.grantCallIOI.person.fullName : null;
        this.deptHttpOptions.defaultValue = this.ioiFetchValues.grantCallIOIId ?
            this.ioiFetchValues.grantCallIOI.submittingUnitDetails.unitName : null;
        this.piDeptHttpOptions.defaultValue = this.ioiFetchValues.grantCallIOIId ?
            this.ioiFetchValues.grantCallIOI.unitDetails.unitName : null;
    }

    /** for selecting the department ID */
    getDepartmentId(selectedDepartment) {
        this.ioiFetchValues.grantCallIOI.submittingUnitNumber = this.getSelectedDepartment(selectedDepartment);
    }

    /** for selection the department ID of PI (to be submitted field) */
    getPiDepartmentId(selectedDepartment) {
        this.ioiFetchValues.grantCallIOI.unitNumber = this.getSelectedDepartment(selectedDepartment);
    }

    /** used for switching between employee and non employee */
    switchElasticConfig() {
        this.ioiFetchValues.grantCallIOIMemberList = {};
        this.getElasticForEmployeeAndNonEmployee();
    }

    getElasticForEmployeeAndNonEmployee() {
        this.ioiFetchValues.grantCallIOIMemberList.memberName = '';
        this.ioiFetchValues.grantCallIOIMemberList.memberId = null;
        this.elasticSearchOptions = !this.isNonEmployee ? this._elasticConfig.getElasticForPerson() :
            this.elasticSearchOptions = this._elasticConfig.getElasticForRolodex();
    }

    /** selecting the department from endpoint search */
    getSelectedDepartment(selectedDepartment) {
        if (selectedDepartment) {
            return selectedDepartment.unitNumber;
        }
    }

    /** for selecting the PI through elastic search */
    selectedPiName(value) {
        this.clearPiDeptField = new String('false');
        (value) ? this.setObjectsIfValidPiName(value) : this.resetPiDepartmentAndId();
    }

    setObjectsIfValidPiName(value) {
        const piDepartment = { 'unitNumber': null };
        piDepartment.unitNumber = value.unit_number;
        this.getPiDepartmentId(piDepartment);
        this.warningMsg.unitNumber = null;
        this.warningMsg.principalInvestigatorId = null;
        this.piDeptHttpOptions.defaultValue = value.unit_name;
        this.piDeptHttpOptions = Object.assign({}, this.piDeptHttpOptions);
        this.ioiFetchValues.grantCallIOI.principalInvestigatorId = value.prncpl_id;
    }

    resetPiDepartmentAndId() {
        this.ioiFetchValues.grantCallIOI.principalInvestigatorId = null;
        this.ioiFetchValues.grantCallIOI.unitNumber = null;
    }

    /** saving the IOI as draft. add persons and questionnaire will be active */
    saveDraft() {
        this.ioiFetchValues.grantCallIOI.grantIOIStatusCode = 1;
        (!this.ioiFetchValues.grantCallIOI.createTimestamp) ?
            this.ioiFetchValues.grantCallIOI.createTimestamp = new Date().getTime() :
            this.ioiFetchValues.grantCallIOI.createTimestamp = this.ioiFetchValues.grantCallIOI.createTimestamp;
        this.saveBasicIOIDetails();
    }

    /** for saving the basic details of the IOI (if grantIOIStatusCode == 1 then saved as draft
     * & if grantIOIStatusCode ==2 then saved as submitted )  */
    saveBasicIOIDetails() {
        this.setIoiSaveObject();
        if (this.validateIoiEdit() && !this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._ioiService.saveOrUpdateGrantCallIOI(
                {
                    'grantCallIOI': this.ioiFetchValues.grantCallIOI
                }).subscribe((data: any) => {
                    this.ioiFetchValues = data;
                    this._grantService.ioiFetchValues = this.ioiFetchValues;
                    this.updateConfigurationData();
                    this.checkGrantIoiStatusCode();
                    this.grantCallIOIId = this.ioiFetchValues.grantCallIOIId;
                    this.isSaving = false;
                }, err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Adding IOI failed. Please try again.');
                    this.isSaving = false;
                }, () => {
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'IOI added successfully.');
                    this.isSaving = false;
                }));
        }
    }

    setIoiSaveObject() {
        this.ioiFetchValues.grantCallIOI.createUser = (this.ioiFetchValues.grantCallIOI.createUser) ?
            this.ioiFetchValues.grantCallIOI.createUser : this._commonService.getCurrentUserDetail('userName');
        this.ioiFetchValues.grantCallIOI.updateUser = this._commonService.getCurrentUserDetail('userName');
        this.ioiFetchValues.grantCallIOI.grantCallId = parseInt(this.grantCallId, 10);
        this.ioiFetchValues.grantCallIOI.grantCallIOIId = this.ioiFetchValues.grantCallIOIId;
        this.ioiFetchValues.grantCallIOI.requestedDirectCost = this.ioiFetchValues.grantCallIOI.requestedDirectCost ?
            convertToValidAmount(this.ioiFetchValues.grantCallIOI.requestedDirectCost) : null;
    }

    getIOIQuestionnaireNumbers() {
        return this.ioiLookUps.grantCallIOIQuestionnaire ? [this.ioiLookUps.grantCallIOIQuestionnaire.questionnaireId] : [];
    }

    /** validation for basic details */
    validateIoiEdit() {
        this.warningMsg = {};
        if (!this.ioiFetchValues.grantCallIOI.projectTitle) {
            this.warningMsg.ioiValuesprojectTitle = 'Please provide a Project Title';
        }
        if (!this.ioiFetchValues.grantCallIOI.submittingUnitNumber) {
            this.warningMsg.submittingUnitNumber = '* Please provide a Unit';
        }
        if (!this.ioiFetchValues.grantCallIOI.requestedDirectCost) {
            this.warningMsg.ioiValuesrequestedDirectCost = 'Please provide a valid value';
        }
        if (!this.ioiFetchValues.grantCallIOI.unitNumber) {
            this.warningMsg.unitNumber = '* Please provide a Department';
        }
        if (!this.ioiFetchValues.grantCallIOI.principalInvestigatorId) {
            this.warningMsg.principalInvestigatorId = '* Please provide Principal Investigator';
        }
        return this.isEmptyObject(this.warningMsg);
    }

    checkGrantIoiStatusCode() {
        if (this.ioiFetchValues.grantCallIOI.grantIOIStatusCode === 1 && this.ioiLookUps.grantCallIOIQuestionnaire !== null) {
            this.isQuestionnaireViewMode = false;
        }
        if (!this.ioiFetchValues.grantCallIOIMemberList) {
            this.ioiFetchValues.grantCallIOIMemberList = {};
        }
        this.ioiFetchValues.grantCallIOIMemberList.memberRoleId = null;
        if (this.ioiFetchValues.grantCallIOI.grantIOIStatusCode === 2) {
            this.goBackToIOI();
        }
    }

    goBackToIOI() {
        this._router.navigate(['fibi/grant/ioi/list'], { queryParamsHandling: 'merge' });
    }

    /** for selecting the member from elastic search*/
    selectedMemberName(value) {
        this.ioiFetchValues.grantCallIOIMemberList.memberId = null;
        value ? this.setEmployeeAndNonEmployeeDetails(value) : this.ioiFetchValues.grantCallIOIMemberList.memberName = null;
    }

    setEmployeeAndNonEmployeeDetails(value) {
        (this.isNonEmployee) ? this.setNonEmployeeDetails(value) : this.setEmployeeDetails(value);
    }

    setNonEmployeeNameAndOrganization(value) {
        value.first_name = (value.first_name) ? value.first_name : '';
        value.middle_name = (value.middle_name) ? value.middle_name : '';
        value.last_name = (value.last_name) ? value.last_name : '';
        value.organization = (value.organization) ? value.organization : '';
    }

    setNonEmployeeDetails(value) {
        this.setNonEmployeeNameAndOrganization(value);
        this.ioiFetchValues.grantCallIOIMemberList.memberId = parseInt(value.rolodex_id, 10);
        this.setNonEmployeeMemberName(value);
    }

    setNonEmployeeMemberName(value) {
        if (value.full_name) {
            this.ioiFetchValues.grantCallIOIMemberList.memberName = value.full_name;
        } else if ((value.first_name) &&
            (value.middle_name) && (value.last_name)) {
            this.ioiFetchValues.grantCallIOIMemberList.memberName = value.organization;
        } else {
            this.ioiFetchValues.grantCallIOIMemberList.memberName = value.last_name + ' , ' + value.middle_name + value.first_name;
        }
    }

    setEmployeeDetails(value) {
        this.ioiFetchValues.grantCallIOIMemberList.memberId = value.prncpl_id;
        this.ioiFetchValues.grantCallIOIMemberList.memberName = value.full_name;
    }

    fetchIoiMemberDetails() {
        if (this.ioiFetchValues.grantCallIOIMemberList.memberRoleId) {
            this.setGrantCallIOIMemberListObject();
            this.$subscriptions.push(this._ioiService.addIOIMember({ 'grantCallIOIMembers': this.ioiFetchValues.grantCallIOIMemberList })
                .subscribe(data => {
                    this.ioiPerson = data;
                }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Adding Team Member failed. Please try again.'); },
                    () => {
                        this.successStatusAfterAddingIoiMember();
                    }));
        }
    }

    /** function for adding team member in IOI */
    addPerson() {
        if (this.ioiFetchValues.grantCallIOIId) {
            const ioiPersonValidation = this.validateIoiEditPerson();
            if (ioiPersonValidation) {
                this.ioiFetchValues.grantCallIOIMemberList.memberRoleId = this.roleType;
                this.fetchIoiMemberDetails();
            }
        }
    }

    checkForDuplicatePerson() {
        for (const PERSON of this.teamMemberList) {
            if (this.isNonEmployee === PERSON.isNonEmployee) {
                this.isDuplicatePerson(PERSON);
            }
        }
    }

    isDuplicatePerson(PERSON) {
        if (PERSON.memberId === this.ioiFetchValues.grantCallIOIMemberList.memberId) {
            // tslint:disable-next-line:triple-equals
            if (PERSON.memberRoleId == this.roleType) {
                this.elasticSearchOptions.errorMessage = 'You have already added this person with same role.';
                this.clearField = new String('false');
            }
        }
    }

    successStatusAfterAddingIoiMember() {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Team Member added successfully.');
        this.propPersonRole = this.ioiLookUps.proposalPersonRoles.find(x =>
            x.id === this.ioiFetchValues.grantCallIOIMemberList.memberRoleId);
        this.ioiFetchValues.grantCallIOIMemberList.propPersonRole = this.propPersonRole;
        this.ioiFetchValues.grantCallIOIMemberList.grantIOIMemberId = this.ioiPerson.grantCallIOIMembers.grantIOIMemberId;
        this.teamMemberList.push(JSON.parse(JSON.stringify(this.ioiFetchValues.grantCallIOIMemberList)));
        this.clearField = new String('true');
        this.ioiFetchValues.grantCallIOIMemberList = {};
        this.roleType = null;
    }

    /** validation for adding person details */
    // explain the purpose of filter and foEach here. Also why is there a separate if condition inside the forEach for validating memberID
    // can we just memberID and memberROleID as input and return the result as found or not found ??
    // then use another code block to do a waring message thing. this is really confusing
    validateIoiEditPerson() {
        this.memberRoleWarning = '';
        this.elasticSearchOptions.errorMessage = '';
        if (!this.ioiFetchValues.grantCallIOIMemberList.memberId) {
            this.elasticSearchOptions.errorMessage = '* Please select a Person';
        }
        if (!this.roleType || this.roleType === 'null') {
            this.memberRoleWarning = '* Please select a Role';
        }
        if (this.ioiFetchValues.grantCallIOIMemberList.memberId && this.roleType &&
            this.teamMemberList && this.teamMemberList.length) {
            this.checkForDuplicatePerson();
        }
        return !this.elasticSearchOptions.errorMessage && !this.memberRoleWarning;
    }

    setGrantCallIOIMemberListObject() {
        this.ioiFetchValues.grantCallIOIMemberList.grantCallIOIId = this.ioiFetchValues.grantCallIOI.grantCallIOIId;
        this.ioiFetchValues.grantCallIOIMemberList.memberRoleId = parseInt(this.ioiFetchValues.grantCallIOIMemberList.memberRoleId, 10);
        this.ioiFetchValues.grantCallIOIMemberList.isNonEmployee = this.isNonEmployee;
        this.ioiFetchValues.grantCallIOIMemberList.updateUser = this._commonService.getCurrentUserDetail('userName');
    }

    /** deletes project team member details */
    sendDeleteData(index, id) {
        this.deletePersonId = id;
        this.spliceIndex = index;
    }

    deletePerson() {
        this.$subscriptions.push(this._ioiService.deleteIOIMember({ 'grantIOIMemberId': this.deletePersonId }).subscribe((data: any) => {
        },
            err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Removing Team Member failed. Please try again.'); },
            () => {
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Team Member removed successfully.');
                this.teamMemberList.splice(this.spliceIndex, 1);
            }));
        this.isNonEmployee = false;
    }

    filterMemberListToCheckDuplication() {
        if (this.teamMemberList.filter(filterMember =>
            filterMember.memberId === this.ioiFetchValues.grantCallIOIMemberList.memberId)) {
            this.checkForMemberDuplication();
        }
    }

    checkForMemberDuplication() {
        this.teamMemberList.forEach(element => {
            if (element.memberId === this.ioiFetchValues.grantCallIOIMemberList.memberId) {
                if (this.roleType === element.memberRoleId) {
                    this.warningMsg.existingUser = 'User already exists';
                }
            }
        });
    }

    // what is this?? iterating objects abd checking if key is found inside??
    // this only works only on empty objects if this is the case this iteration makes no sense.
    // use Object.hasOwnProperty of Object,values.length etc
    isEmptyObject(ioiObject) {
        for (const key in ioiObject) {
            if (ioiObject.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }

    inputDigitRestriction(field: any) {
        if (inputRestrictionForAmountField(field)) {
            this.warningMsg.ioiValuesrequestedDirectCost = inputRestrictionForAmountField(field);
        }
    }

    getSaveEvent(event) {
        event ? this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Your IOI Questionnaire saved successfully.') :
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving IOI Questionnaire failed. Please try again.');
    }

    subscriptionSubmit() {
        this.$subscriptions.push(
              this._grantService.ioiSubmit$.subscribe(() => {
                this.submitIOI();
            }));
    }
}
