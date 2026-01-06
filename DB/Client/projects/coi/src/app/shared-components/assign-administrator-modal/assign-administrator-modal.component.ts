import { Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { CompleterOptions } from '../../../../../fibi/src/app/service-request/service-request.interface';
import { CommonService } from '../../common/services/common.service';
import { Subscription } from 'rxjs';
import { AssignAdministratorModalService } from './assign-administrator-modal.service';
import { subscriptionHandler } from '../../../../../fibi/src/app/common/utilities/subscription-handler';
import { AssignAdminGroup, AssignAdminRO, DefaultAssignAdminDetails } from '../shared-interface';
import {COI_MODULE_CODE, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS, OPA_MODULE_CODE, TRAVEL_MODULE_CODE, CONSULTING_MODULE_CODE} from '../../app-constants';
import { COI_DECLARATION_MODULE_CODE } from '../../declarations/declaration-constants';

declare const $: any;

@Component({
    selector: 'app-assign-administrator-modal',
    templateUrl: './assign-administrator-modal.component.html',
    styleUrls: ['./assign-administrator-modal.component.scss'],
    providers: [AssignAdministratorModalService]
})
export class AssignAdministratorModalComponent implements OnInit, OnChanges, OnDestroy {

    isAssignToMe = false;
    adminSearchOptions: any = {};
    clearAdministratorField: String;
    assignAdminMap = new Map();
    addAdmin = new AssignAdminRO();
    adminGroupsCompleterOptions: CompleterOptions = new CompleterOptions();
    clearAdminGroupField: any;
    $subscriptions: Subscription[] = [];
    isSaving = false;
    adminGrpWarningMessage: string;
    isConcurrency = false;
    isShowErrorMessage = false;

    @Input() disclosureId = null;
    @Input() currentAssignedAdminId = null;
    @Input() disclosureNumber = null;
    @Input() defaultAdminDetails = new DefaultAssignAdminDetails();
    @Input() actionType: 'R' | 'A';
    @Input() path: 'DISCLOSURES' | 'TRAVEL_DISCLOSURES' | 'OPA_DISCLOSURES' | 'CONSULTING_DISCLOSURES' | 'DECLARATIONS' = 'DISCLOSURES';
    @Output() closeModal: EventEmitter<any> = new EventEmitter<any>();

    constructor(private _commonService: CommonService, private _assignAdminService: AssignAdministratorModalService) { }

    ngOnInit(): void {
        document.getElementById('toggle-assign-admin').click();
        if (this.checkDefaultAdminPersonId()) {
            this.isAssignToMe = true;
        }
        this.setDefaultAdminDetails();
    }

    ngOnChanges(): void {
        this.getAdminDetails();
        this.setDisclosureId();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private getAdminDetails() {
        this.$subscriptions.push(this._assignAdminService.getAdminDetails(this.getModuleCode()).subscribe((data: any) => {
            this.setAdminGroupOptions(data.adminGroups);
            this.setCompleterOptions(data.persons, 'fullName', this.adminSearchOptions);
        }));
    }

    getModuleCode() {
        if (this.path === 'OPA_DISCLOSURES') {
            return OPA_MODULE_CODE;
        } else if (this.path === 'TRAVEL_DISCLOSURES') {
            return TRAVEL_MODULE_CODE;
        } else if (this.path === 'CONSULTING_DISCLOSURES') {
            return CONSULTING_MODULE_CODE;
        } else if (this.path === 'DECLARATIONS') {
            return COI_DECLARATION_MODULE_CODE;
        } else {
            return COI_MODULE_CODE;
        }
    }

    private checkDefaultAdminPersonId(): boolean {
        return this.defaultAdminDetails.adminPersonId === this._commonService.getCurrentUserDetail('personID');
    }

    private setDefaultAdminDetails(): void {
        this.addAdmin.adminGroupId = this.defaultAdminDetails.adminGroupId;
        this.addAdmin.adminPersonId = this.defaultAdminDetails.adminPersonId;
        this.adminSearchOptions.defaultValue = this.defaultAdminDetails.adminPersonName;
    }

    private setDisclosureId(): void {
        this.addAdmin.actionType = this.actionType;
        if (this.path === 'TRAVEL_DISCLOSURES') {
            this.addAdmin.travelDisclosureId = this.disclosureId;
        } else if (this.path === 'OPA_DISCLOSURES') {
            this.addAdmin.opaDisclosureId = this.disclosureId;
            this.addAdmin.opaDisclosureNumber = this.disclosureNumber;
        } else if (this.path === 'DECLARATIONS') {
            this.addAdmin.declarationId = this.disclosureId;
            this.addAdmin.declarationNumber = this.disclosureNumber;
        } else {
            this.addAdmin.disclosureId = this.disclosureId;
        }
    }

    private setAdminGroupOptions(adminGroups: AssignAdminGroup[]): void {
        this.adminGroupsCompleterOptions = {
            arrayList: this.getActiveAdminGroups(adminGroups),
            contextField: 'adminGroupName',
            filterFields: 'adminGroupName',
            formatString: 'adminGroupName',
            defaultValue: this.defaultAdminDetails.adminGroupName
        };
    }

    private getActiveAdminGroups(adminGroups: AssignAdminGroup[]) {
        return adminGroups.filter(element => element.isActive);
    }

    private setCompleterOptions(arrayList: any, searchShowField: string, searchOption: any = null) {
        searchOption.defaultValue = '';
        searchOption.arrayList = arrayList || [];
        searchOption.contextField = searchShowField;
        searchOption.filterFields = searchShowField;
        searchOption.formatString = searchShowField;
    }
    public assignToMe(checkBoxEvent: any) {
        if (checkBoxEvent.target.checked) {
            this.adminSearchOptions.defaultValue = this._commonService.getCurrentUserDetail('fullName');
            this.addAdmin.adminPersonId = this._commonService.getCurrentUserDetail('personID');
            this.isShowErrorMessage = this.currentAssignedAdminId === this.addAdmin?.adminPersonId;
            this.isAssignToMe = true;
            this.getPersonGroup();
            this.assignAdminMap.clear();
        } else {
            this.isShowErrorMessage = false;
            this.addAdmin.adminPersonId = null;
            this.adminSearchOptions.defaultValue = null;
            this.isAssignToMe = false;
        }
        this.clearAdministratorField = new String('false');
    }

    public adminSelect(event: any) {
        if (event) {
            this.isShowErrorMessage = this.currentAssignedAdminId === event.personId;
            this.addAdmin.adminPersonId = event.personId;
            this.isAssignToMe = this.setAssignToMe();
            this.getPersonGroup();
            this.assignAdminMap.clear();
        } else {
            this.isShowErrorMessage = false;
            this.addAdmin.adminPersonId = null;
            this.addAdmin.adminGroupId = null;
            this.clearAdministratorField = new String('true');
            this.adminSearchOptions.defaultValue = '';
            this.clearAdminGroupField = new String('true');
            this.adminGroupsCompleterOptions.defaultValue = '';
            this.isAssignToMe = false;
        }
    }

    public adminGroupSelect(event) {
        this.addAdmin.adminGroupId = (event?.adminGroupId) || null;
    }

    public assignAdministrator() {
        this.isShowErrorMessage = false;
        if (!this.isSaving && this.validateAdmin()) {
            this.isSaving = true;
            this.setDisclosureId();
            this.$subscriptions.push(this._assignAdminService.assignAdmin(this.path, this.addAdmin)
                .subscribe((data: any) => {
                    this.isAssignToMe = false;
                    this.addAdmin = new AssignAdminRO();
                    this.isSaving = false;
                    this.clearAdministratorField = new String('true');
                    this.closeModal.emit(data);
                    document.getElementById('toggle-assign-admin').click();
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Administrator assigned successfully.');
                }, err => {
                    if (err.status === 405) {
                        this.isShowErrorMessage = true;
                        this.isSaving = false;
                    } else {
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in adding administrator.');
                        this.isSaving = false;
                    }
                }));
        }
    }

    private validateAdmin(): boolean {
        this.assignAdminMap.clear();
        if (!this.addAdmin.adminPersonId) {
            this.assignAdminMap.set('adminName', 'adminName');
        }
        return this.assignAdminMap.size > 0 ? false : true;
    }

    private setAssignToMe(): boolean {
        return this.addAdmin.adminPersonId === this._commonService.getCurrentUserDetail('personID') ? true : false;
    }

    public clearData() {
        this.isAssignToMe = false;
        this.closeModal.emit();
        this.addAdmin = new AssignAdminRO();
        this.clearAdminGroupField = new String('true');
        this.clearAdministratorField = new String('true');
    }

    getPersonGroup() {
        this.adminGrpWarningMessage = '';
        if(!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._assignAdminService.getPersonGroup(this.addAdmin.adminPersonId, this.getModuleCode()).subscribe((data: any) => {
                if(data && data.adminGroupId) {
                    this.addAdmin.adminGroupId = data.adminGroupId;
                    this.adminGroupsCompleterOptions.defaultValue = data.adminGroupName;
                    this.clearAdminGroupField = new String('false');
                    this.isSaving = false;
                } else {
                    this.adminGrpWarningMessage = data;
                    this.adminGroupsCompleterOptions.defaultValue = '';
                    this.clearAdminGroupField = new String('true');
                    this.addAdmin.adminGroupId = null;
                    this.isSaving = false;
                }
            }, error => {
                this.isSaving = false;
                this._commonService.showToast(HTTP_ERROR_STATUS, "Error in fetching group details");
            }));
        }
    }

    @HostListener('document:keydown.escape', ['$event'])
    handleEscapeEvent(event: any): void {
        if ((event.key === 'Escape' || event.key === 'Esc')) {
            this.clearData();
        }
    }
}
