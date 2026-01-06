import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { getEndPointOptionsForDepartment } from '../../../common/services/end-point.config';
import { fileDownloader, validatePercentage } from '../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import {
    InstituteProposal, InstProposal, InstProposalPerson, PersonUnit,
    ProposalPersonRole, Unit
} from '../../institute-proposal-interfaces';
import { DataStoreService } from '../../services/data-store.service';
import { KeyPersonService } from './key-person.service';
import { environment } from '../../../../environments/environment';
import { concatUnitNumberAndUnitName } from '../../../common/utilities/custom-utilities';

declare var $: any;
@Component({
    selector: 'app-key-person',
    templateUrl: './key-person.component.html',
    styleUrls: ['./key-person.component.css']
})
export class KeyPersonComponent implements OnInit, OnDestroy {

    @Input() isViewMode = true;
    $subscriptions: Subscription[] = [];
    keyPersons: Array<InstProposalPerson> = [];
    isProjectTeamWidgetOpen = true;
    selectedPersonDetails: any = {};
    personType = 'EMPLOYEE';
    personRoles: Array<ProposalPersonRole> = [];
    personSearchOptions: any = {};
    personDetails: InstProposalPerson = new InstProposalPerson();
    errorMap = new Map();
    selectedPerson: any = {};
    departmentSearchOptions: any = {};
    isUnitNotExist = true;
    isShowResultCard = false;
    helpText: any = {};
    departmentClearField: String;
    editIndex = -1;
    isSaving = false;
    instProposalId = '';
    keyPersonnelLabel = 'Key personnel';
    deletePeronIndex = -1;
    newLeadUnit: Unit;
    generalDetails: InstProposal;
    uploadedFile: Array<File> = [];
    isAddNonEmployeeModal = false;
    deployMap = environment.deployUrl;
    deleteProposalCV: any;
    isEnableViewMore = false;
    isMaintainRolodex = false;
    isMaintainPerson = false;
    hasMaintainTrainingRight = false;
    isNonEmployee: boolean;
    $unitList = new Subject();
    concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;
    isRolodexViewModal = false;
    type = 'PERSON';
    isTraining: false;
    id: string;
    personDescription: string;
    noRightOnUnitMsg = '';

    constructor(public _commonService: CommonService,
        private _dataStore: DataStoreService, public _keyPerson: KeyPersonService,
        private _elasticConfig: ElasticConfigService,
        private _route: ActivatedRoute) { }

    ngOnInit() {
        this.getKeyPersonDetails();
        this.getDataStoreEvent();
        this.setPersonSearchOptions();
        this.setDepartmentSearchOptions();
        this.getPermissions();
        this.getProposalIdFromUrl();
        this.$unitList.subscribe(data => {
            this.checkIfUnitExist();
        });
        this.$subscriptions.push(this.$unitList.subscribe(data => {
            this.checkIfUnitExist();
        }));
    }

    private getProposalIdFromUrl() {
        this.$subscriptions.push(this._route.queryParams.subscribe(params => {
            this.instProposalId = params.instituteProposalId;
            this.personDetails.proposalId = parseInt(this.instProposalId, 10);
        }));
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    async getPermissions() {
        this.hasMaintainTrainingRight = await this._commonService.checkPermissionAllowed('MAINTAIN_TRAINING');
        this.isMaintainPerson = await this._commonService.checkPermissionAllowed('MAINTAIN_PERSON');
        this.isMaintainRolodex = await this._commonService.checkPermissionAllowed('MAINTAIN_ROLODEX');
    }

    getDataStoreEvent() {
        this.$subscriptions.push(this._dataStore.dataEvent
            .subscribe((data: any) => {
                if (data.includes('instituteProposalPersons')) {
                    this.getKeyPersonDetails();
                }
            }));
    }

    getKeyPersonDetails(): void {
        const data: InstituteProposal = this._dataStore.getData(['instituteProposalPersons', 'proposalPersonRoles', 'instProposal']);
        this.keyPersons = data.instituteProposalPersons;
        this.personRoles = data.proposalPersonRoles;
        this.generalDetails = data.instProposal;
    }

    viewKeyPersonDetail(person: InstProposalPerson): void {
        this.isRolodexViewModal = true;
        this.personDescription = person.proposalPersonRole.description;
        if (person.personId) {
            this.id = person.personId;
        } else {
            this.id = person.rolodexId;
            this.type = 'ROLODEX';
        }
    }

    checkPersonViewPermission(person) {
        if (person.personId) {
            this.isEnableViewMore = this.isMaintainPerson ||
                this.personDetails.personId === this._commonService.getCurrentUserDetail('personID');
        } else {
            this.isEnableViewMore = this.isMaintainRolodex;
        }
    }

    downloadProposalPersonCV(attachment: any): void {
        this.$subscriptions.push(this._keyPerson.downloadAttachment(attachment.attachmentId)
            .subscribe(data => {
                fileDownloader(data, attachment.fileName);
            }));
    }

    openPersonDetails(): void {
        let url = window.location.origin + window.location.pathname;
        url += this.selectedPersonDetails.hasOwnProperty('personId') ?
            '#/fibi/person/person-details?personId=' + this.selectedPersonDetails.personId :
            '#/fibi/rolodex?rolodexId=' + this.selectedPersonDetails.rolodexId;
        window.open(url, '_blank');
    }

    changePersonRoleType(): void {
        // tslint:disable:triple-equals
        this.personDetails.proposalPersonRole = this.personRoles.find(
            role => role.id == this.personDetails.personRoleId);
        this.errorMap.delete('role');
    }

    onPersonTypeChange() {
        this.isShowResultCard = false;
        this.personDetails.units = [];
        this.setPersonSearchOptions();
    }

    setPersonSearchOptions(): void {
        this.personSearchOptions = this.personType === 'EMPLOYEE' ?
            this._elasticConfig.getElasticForPerson() : this._elasticConfig.getElasticForRolodex();
    }

    resetPersonType() {
        this.personType = 'EMPLOYEE';
        this.onPersonTypeChange();
    }

    setDepartmentSearchOptions(): void {
        this.departmentSearchOptions = getEndPointOptionsForDepartment();
    }

    onPersonSelect(person: any): void {
        if (person) {
            this.selectedPerson = person;
            this.personDetails.personId = person.prncpl_id;
            this.personDetails.fullName = person.full_name;
            this.personDetails.rolodexId = person.rolodex_id ? parseInt(person.rolodex_id, 10) : null;
            this.personDetails.department = person.organization || null;
            this.personDetails.designation = person.prncpl_id ? person.primary_title : person.designation;
            this.isShowResultCard = true;
            this.onDepartmentSelect({ 'unitName': person.unit_name, 'unitNumber': person.unit_number });
        } else {
            this.personDetails.personId = null;
            this.personDetails.fullName = null;
            this.personDetails.rolodexId = null;
            this.personDetails.department = null;
            this.personDetails.units = [];
            this.isShowResultCard = false;
            this.errorMap.delete('full_name');
            this.errorMap.delete('dept');
        }
    }

    checkIfUnitExist() {
        this.isUnitNotExist = this.personDetails.units.length === 0;
    }

    onDepartmentSelect(department: Unit): void {
        this.errorMap.delete('dept');
        if (department) {
            if (this.checkDuplicateDepartment(department.unitNumber)) {
                this.departmentSearchOptions.errorMessage = 'Department already added';
                this.errorMap.set('dept', 'Department already added');
            } else {
                if (department.unitNumber) {
                    const NEW_UNIT = new PersonUnit();
                    NEW_UNIT.unit.unitName = department.unitName;
                    NEW_UNIT.unit.unitNumber = department.unitNumber;
                    NEW_UNIT.unitNumber = department.unitNumber;
                    this.personDetails.units.push(NEW_UNIT);
                    this.$unitList.next();
                }
            }
            this.departmentClearField = new String('true');
        }
    }

    checkDuplicateDepartment(unitNumber: string): boolean {
        return !!this.personDetails.units.find(unit => unit.unitNumber === unitNumber && !unit.isDeleted);
    }

    setLeadUnit(index: number): void {
        this.personDetails.units.forEach(unit => unit.leadUnit = false);
        this.personDetails.units[index].leadUnit = true;
        this.newLeadUnit = this.personDetails.units[index].unit;
    }

    deleteDepartment(index: number): void {
        this.personDetails.units[index].leadUnit = false;
        this.personDetails.units[index].propPersonUnitId ? this.personDetails.units[index].isDeleted = true :
            this.personDetails.units.splice(index, 1);
        this.$unitList.next();
    }

    validateKeyPerson(): boolean {
        this.errorMap.clear();
        if (!this.personDetails.personId && !this.personDetails.rolodexId) {
            this.personSearchOptions.errorMessage = 'Please provide a person name.';
            this.errorMap.set('person', 'Please provide a person name');
        }
        if (this.personDetails.personRoleId === 'null' || !this.personDetails.personRoleId) {
            this.errorMap.set('role', 'Please provide a person role.');
        }
        if (this.personDetails.personRoleId === 3 && !this.personDetails.units.some(unit => unit.leadUnit && !unit.isDeleted)) {
            this.departmentSearchOptions.errorMessage = 'Please add one Lead Unit for adding Principal Investigator.';
            this.errorMap.set('dept', 'Please add one Lead Unit for adding Principal Investigator');
        }
        if (this.checkDuplicatePerson()) {
            this.personSearchOptions.errorMessage = 'You have already added ' + this.personDetails.fullName + '.';
            this.errorMap.set('full_name', 'Already added Person');
        }
        if (this.checkForDuplicatePI()) {
            this.errorMap.set('role', 'You have already added a Principal Investigator.');
        }
        this.validatePercentageOfEffort();
        return this.errorMap.size > 0 ? false : true;
    }

    checkDuplicatePerson(): boolean {
        return !!this.keyPersons.find(person => {
            if (((this.personDetails.personId && person.personId === this.personDetails.personId) ||
                (this.personDetails.rolodexId && person.rolodexId === this.personDetails.rolodexId)) &&
                person.proposalPersonId !== this.personDetails.proposalPersonId) {
                return true;
            }
        });
    }

    checkForDuplicatePI(): boolean {
        // tslint:disable:triple-equals
        return !!this.keyPersons.find(person => (person.personRoleId == 3 && this.personDetails.personRoleId == 3) &&
            person.proposalPersonId != this.personDetails.proposalPersonId);
    }

    saveOrUpdateKeyPerson() {
        if (this.validateKeyPerson() && !this.isSaving) {
            if (this.personDetails.proposalPersonAttachment.length && !this.personDetails.proposalPersonAttachment[0].attachmentId) {
                this.saveCV();
            } else {
                this.removePreviousLeadUnit();
                this.saveKeyPerson();
            }
        }
    }

    /**Method to remove lead unit of previous PI, on editing new PI with different lead unit. */
    removePreviousLeadUnit() {
        if (this.editIndex !== -1 && this.personDetails.isPi) {
            const previousLeadUnit = this.keyPersons[this.editIndex].units.find(unit => unit.leadUnit === true);
            const isLeadUnitChanged = this.personDetails.units.find(unit =>
                unit.leadUnit).unitNumber === previousLeadUnit.unitNumber ? false : true;
            const checkNewLeadUnitInList = this.personDetails.units.findIndex(unit =>
                unit.propPersonUnitId === previousLeadUnit.propPersonUnitId) >= 0 ? true : false;
            if (isLeadUnitChanged && !checkNewLeadUnitInList) {
                previousLeadUnit.isDeleted = true;
                this.personDetails.units.push(previousLeadUnit);
            }
        }
    }

    setPIFlag(): void {
        this.personDetails.isPi = this.personDetails.personRoleId === 3;
    }

    setLeadUnitFlag() {
        if (!this.personDetails.isPi) {
            this.personDetails.units.forEach(unit => unit.leadUnit = false);
        }
    }

    saveKeyPerson(): void {
        this.setPIFlag();
        this.setLeadUnitFlag();
        this.isSaving = true;
        this.$subscriptions.push(this._keyPerson.saveOrUpdateKeyPerson({
            'instituteProposalPerson': this.personDetails
        }).subscribe((data: InstituteProposal) => {
            this._commonService.showToast(HTTP_SUCCESS_STATUS, this.editIndex !== -1 ?
                this.keyPersonnelLabel + ' updated successfully.' : this.keyPersonnelLabel + ' added successfully.');
            if (this.editIndex > -1) {
                this.keyPersons.splice(this.editIndex, 1, data.instituteProposalPerson);
            } else {
                this.keyPersons.push(data.instituteProposalPerson);
            }
            this.generalDetails.unit = this.newLeadUnit;
            this.generalDetails.principalInvestigator = this.getPrincipleInvestigator();
            this._dataStore.updateStoreData({ instituteProposalPersons: this.keyPersons, instProposal: this.generalDetails });
            this.clearPersonDetails();
            $('#add-key-person-modal').modal('hide');
            this.isSaving = false;
        }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, (this.editIndex === -1) ?
                ('Adding ' + this.keyPersonnelLabel + ' failed. Please try again.') :
                ('Updating ' + this.keyPersonnelLabel + ' failed. Please try again.'));
            this.isSaving = false;
        }));
    }

    saveCV(): void {
        this.$subscriptions.push(
            this._keyPerson.addAwardPersonAttachment(this.personDetails.proposalPersonAttachment, this.uploadedFile)
                .subscribe((data: any) => {
                    this.personDetails.proposalPersonAttachment = data.newIPPersonAttachments;
                    this.saveKeyPerson();
                }));
    }

    getPrincipleInvestigator(): string {
        // tslint:disable-next-line:triple-equals
        const PERSON: InstProposalPerson = this.keyPersons.find(person => (person.personRoleId == 3));
        return PERSON && PERSON.fullName;
    }

    clearPersonDetails() {
        this.personDetails = new InstProposalPerson();
        this.personDetails.proposalId = parseInt(this.instProposalId, 10);
        this.isShowResultCard = false;
        this.editIndex = -1;
        this.errorMap.clear();
        this.setDepartmentSearchOptions();
        this.setPersonSearchOptions();
        this.noRightOnUnitMsg = '';

    }

    uploadCV(files) {
        if (files.length > 0) {
            this.uploadedFile = [];
            this.uploadedFile.push(files[0]);
        }
    }

    createCVSave() {
        if (this.uploadedFile.length) {
            const replaceAttachmentId = this.personDetails.proposalPersonAttachment.length ?
                this.personDetails.proposalPersonAttachment[0].attachmentId : null;
            this.personDetails.proposalPersonAttachment = [];
            const DATA = {
                fileName: this.uploadedFile[0].name,
                mimeType: this.uploadedFile[0].type,
                description: null,
                replaceAttachmentId: replaceAttachmentId
            };
            this.personDetails.proposalPersonAttachment.push(DATA);
        }
    }

    editKeyPerson(person: InstProposalPerson, index: number): void {
        this.errorMap.clear();
        this.personDetails = JSON.parse(JSON.stringify(person));
        this.personType = this.personDetails.personId ? 'EMPLOYEE' : 'NON_EMPLOYEE';
        this.setPersonSearchOptions();
        this.personSearchOptions.defaultValue = this.personDetails.fullName;
        this.editIndex = index;
        this.$unitList.next();
    }

    validatePercentageOfEffort() {
        this.errorMap.delete('percentageOfEffort');
        const value = validatePercentage(this.personDetails.percentageOfEffort);
        if (value) {
            this.errorMap.set('percentageOfEffort', value);
        }
    }

    deleteKeyPerson() {
        if (!this.isSaving) {
            this.isSaving = true;
            const deletePersonId = this.keyPersons[this.deletePeronIndex].proposalPersonId;
            this.$subscriptions.push(this._keyPerson.deleteKeyPersonnel(this.instProposalId, deletePersonId)
                .subscribe((data: any) => {
                    this.keyPersons.splice(this.deletePeronIndex, 1);
                    this.generalDetails.principalInvestigator = this.getPrincipleInvestigator();
                    this._dataStore.updateStoreData({ instituteProposalPersons: this.keyPersons, instProposal: this.generalDetails });
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, this.keyPersonnelLabel + ' removed successfully.');
                    this.isSaving = false;
                }, err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Removing ' + this.keyPersonnelLabel + ' failed. Please try again.');
                    this.isSaving = false;
                }));
        }
    }

    setRolodexPersonObject(rolodexObject) {
        if (rolodexObject.rolodex) {
            this.setPersonSearchOptions();
            this.errorMap.delete('full_name');
            this.errorMap.delete('person');
            this.personSearchOptions.defaultValue = rolodexObject.rolodex.fullName;
            this.personDetails.fullName = rolodexObject.rolodex.fullName;
            this.personDetails.rolodexId = rolodexObject.rolodex.rolodexId;
            this.personDetails.department = rolodexObject.rolodex.organizations ?
                rolodexObject.rolodex.organizations.organizationName : '';
            if (rolodexObject.rolodex.organization) {
                this.personDetails.department = rolodexObject.rolodex.organizations ?
                    rolodexObject.rolodex.organizations.organizationName : '';
            } else {
                this.personDetails.department = rolodexObject.rolodex.organizationName ?
                    rolodexObject.rolodex.organizationName : '';
            }
            this.selectedPerson = rolodexObject.rolodex;
            this.isShowResultCard = true;
        }
        $('#add-key-person-modal').modal('show');
        this.isAddNonEmployeeModal = rolodexObject.nonEmployeeFlag;
    }

    deleteCV(deleteProposalCV: any): void {
        deleteProposalCV.splice(0, 1);
    }

    clearPersonRole() {
        this.personDetails.proposalPersonRole = null;
        this.personDetails.personRoleId = null;
        this.personDetails.projectRole = null;
    }

    clearProjectRole(): void {
        if (!this.personDetails.proposalPersonRole.showProjectRole) {
            this.personDetails.projectRole = null;
        }
    }

    setPersonRolodexModalView(personRolodexObject) {
        this.isRolodexViewModal = personRolodexObject.isPersonRolodexViewModal;
        this.isRolodexViewModal = personRolodexObject.isPersonRolodexViewModal;
        this.isTraining = false;
        this.type = 'PERSON';
    }

    setShowElasticResults(elasticResultShow) {
        this.isShowResultCard = elasticResultShow.isShowElasticResults;
    }

    switchToNonEmployeeModal() {
        $('#add-key-person-modal').modal('hide');
        this.isAddNonEmployeeModal = true;
    }

    switchToCVModal() {
        $('#deleteProposalCvAttachment').modal('hide');
        $('#add-key-person-modal').modal('show');
    }

    showCvDeleteConfirmation() {
        $('#add-key-person-modal').modal('hide');
        $('#deleteProposalCvAttachment').modal('show');
    }

    hideCvDeleteConfirmation() {
        $('#add-key-person-modal').modal('show');
        $('#deleteProposalCvAttachment').modal('hide');
    }
    /**
     * This will invoked when user try to change lead unit when clicking on a unit.
     * If user try to mark a unit as lead unit which is current proposal leadunit then no API will be called.
     * Otherwise it will call API to check passed right as parameter is matched thus changing lead unit accordingly.
     * @param unitIndex
     * @param right
     */
    checkUnitRight(unitIndex, right) {
        this.noRightOnUnitMsg = '';
        if (this.personDetails.units[unitIndex].unitNumber !== this.generalDetails.unit.unitNumber) {
            this.$subscriptions.push(this._keyPerson.checkUnitRight({
                unitNumber: this.personDetails.units[unitIndex].unitNumber, rightName: right
            }).subscribe((data: any) => {
                data.isRightExist ? this.setLeadUnit(unitIndex) :
                    this.noRightOnUnitMsg = `You don't have right on unit '${this.personDetails.units[unitIndex].unit.unitName}' to mark as lead unit.`;
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Lead Unit change failed. Please try again.');
            }
            ));
        } else {
            this.setLeadUnit(unitIndex);
        }
    }

}
