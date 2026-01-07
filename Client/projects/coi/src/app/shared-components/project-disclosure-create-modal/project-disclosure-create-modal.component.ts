import { Component, Input, OnInit } from '@angular/core';
import { DEFAULT_UNIT_FORMAT, CREATE_DISCLOSURE_ROUTE_URL, DISCLOSURE_CREATE_UNIT_HELP_TEXT, DISCLOSURE_TYPE,
    HTTP_ERROR_STATUS, PROJECT_TYPE_LABEL } from '../../app-constants';
import { CommonModalConfig, ModalActionEvent } from '../common-modal/common-modal.interface';
import { CurrentHomeUnit, ProjectConfigAction, ProjectConfigInputAction,
    ProjectListConfiguration, UserProjectDetails } from '../configurable-project-list/configurable-project-list.interface';
import { Router } from '@angular/router';
import { CommonService } from '../../common/services/common.service';
import { DisclosureCreateModalService } from '../disclosure-create-modal/disclosure-create-modal.service';
import { Subscription } from 'rxjs';
import { openCommonModal } from '../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { FCOIDisclosureCreateRO } from '../shared-interface';
import { getEndPointOptionsForLeadUnit } from '../../../../../fibi/src/app/common/services/end-point.config';
import { CoiProjectType, COIValidationModalConfig, ProjDisclCreateModal } from '../../common/services/coi-common.interface';
import { CoiDisclosure } from '../../disclosure/coi-interface';
import { HeaderService } from '../../common/header/header.service';
import { COMMON_DISCL_LOCALIZE } from '../../app-locales';

@Component({
    selector: 'app-project-disclosure-create-modal',
    templateUrl: './project-disclosure-create-modal.component.html',
    styleUrls: ['./project-disclosure-create-modal.component.scss'],
    providers: [DisclosureCreateModalService]
})
export class ProjectDisclosureCreateModalComponent implements OnInit {

    @Input() projDisclCreateConfig = new ProjDisclCreateModal();

    private $subscriptions: Subscription[] = [];

    projectType = '';
    isSaving = false;
    clearField = false;
    isShowAllProjects = false;
    isShowUnitSearch = false;
    mandatoryList = new Map();
    unitSearchOptions: any = {};
    currentHomeUnit = new CurrentHomeUnit();
    userProjectList: UserProjectDetails[] = [];
    existingDisclosureDetails: CoiDisclosure = null;
    projectListConfiguration = new ProjectListConfiguration();
    DISCLOSURE_CREATE_UNIT_HELP_TEXT = DISCLOSURE_CREATE_UNIT_HELP_TEXT;
    DISCLOSURE_CREATION_MODAL_ID = 'coi-create-project-disclosure-modal';
    modalConfig = new CommonModalConfig(this.DISCLOSURE_CREATION_MODAL_ID, '', 'Cancel', 'xl');
    canEditDisclosureUnit = false;
    errorMessage = '';
    isShowErrorMessage = false;
    isLoading = true;
    activeProjectsTypes: CoiProjectType[] = [];
    projectDisclCreationValidationMsg = COMMON_DISCL_LOCALIZE.PROJECT_DISCL_CREATION_VALIDATION_MSG;

    constructor(private _router: Router,
        private _commonService: CommonService,
        private _headerService: HeaderService,
        private _disclosureCreateModalService: DisclosureCreateModalService) {}

    async ngOnInit(): Promise<void> {
        this.canEditDisclosureUnit = this._commonService.canEditDisclosureUnit;
        this.activeProjectsTypes = this._commonService.activeProjectsTypes;
        this.projectType = PROJECT_TYPE_LABEL[this.projDisclCreateConfig?.projectTypeCode];
        await this.checkForFcoiRequired();
        this.checkFcoiDisclosureExist();
        this.setDefaultValues();
        this.isShowAllProjects = !this.projDisclCreateConfig?.selectedProject;
        if (this.projDisclCreateConfig?.selectedProject) {
            this.modalConfig.namings.primaryBtnName = this.isShowErrorMessage ? '' : 'Create Disclosure';
            this.modalConfig.ADAOptions.isDisablePrimaryBtn = this.isShowErrorMessage;
            setTimeout(() => {
                openCommonModal(this.DISCLOSURE_CREATION_MODAL_ID);
            });
        }
    }

    ngOnDestroy(): void {
        this._commonService.closeProjDisclCreateModal();
        subscriptionHandler(this.$subscriptions);
    }

    private checkForFinancialEngagementCreated(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.$subscriptions.push(
                this._disclosureCreateModalService.checkFinancialEngagementCreated().subscribe((data) => {
                        resolve();
                    },
                    (error) => {
                        if (error?.status === 406) {
                            this.errorMessage = error.error ? error.error : `Error in creating ${this.projectType?.toLowerCase() || 'project'} disclosure, please try again.`;
                            this.isShowErrorMessage = !!this.errorMessage?.trim();
                        }
                        resolve();
                    }
                )
            );
        });
    }

    private checkFcoiDisclosureExist(): void {
        if(!this._headerService.activeDisclosures.length) {
            this.isShowErrorMessage = true;
            this.errorMessage = this.projectDisclCreationValidationMsg;
        }
    }

    private async checkForFcoiRequired(): Promise<void> {
        const IS_FCOI_REQUIRED = this.activeProjectsTypes?.length > 0;
        IS_FCOI_REQUIRED && await this.checkForFinancialEngagementCreated();
    }

    private setDefaultValues(): void {
        if (this.activeProjectsTypes?.length === 1) {
            this.changeProjectType(this.activeProjectsTypes[0]?.coiProjectTypeCode);
        } else {
            openCommonModal(this.DISCLOSURE_CREATION_MODAL_ID);
        }
        this.setHomeUnit(this._commonService.currentUserDetails.unitName, this._commonService.currentUserDetails.unitNumber);
        this.unitSearchOptions = getEndPointOptionsForLeadUnit(this.currentHomeUnit.homeUnit, this._commonService.fibiUrl, DEFAULT_UNIT_FORMAT);
    }

    private setHomeUnit(unitName: string, unitNumber: string): void {
        this.currentHomeUnit = {
            unitName: unitName,
            unitNumber: unitNumber,
            homeUnit: this._commonService.getPersonLeadUnitDetails({ unitName, unitNumber })
        }
    }

    private validateCreateDisclosure(): boolean {
        if (!this.currentHomeUnit.unitNumber) {
            this.mandatoryList.set('homeUnit', 'Please enter a valid unit to create a disclosure.');
        }
        return this.mandatoryList.size === 0;
    }

    private getProjectDisclosureCreateRO(): FCOIDisclosureCreateRO {
        return {
            homeUnit: this.currentHomeUnit.unitNumber,
            personId: this._commonService.getCurrentUserDetail('personID'),
            fcoiTypeCode: DISCLOSURE_TYPE.PROJECT,
            coiProjectTypeCode: this.projDisclCreateConfig?.selectedProject.projectTypeCode,
            moduleItemKey: this.projDisclCreateConfig?.selectedProject.projectNumber,
            moduleCode: this.projDisclCreateConfig?.selectedProject.projectTypeCode,
        }
    }

    private createProjectDisclosure(): void {
        if (!this.isSaving && this.validateCreateDisclosure()) {
            this.isSaving = true;
            this.$subscriptions.push(
                this._disclosureCreateModalService.createInitialDisclosure(this.getProjectDisclosureCreateRO())
                    .subscribe((response: any) => {
                        if (response) {
                            this.isSaving = false;
                            this.closeProjDisclCreateModal();
                            this._headerService.triggerProjectsTabCount();
                            this._router.navigate([CREATE_DISCLOSURE_ROUTE_URL], { queryParams: { disclosureId: response.disclosureId } });
                        }
                    }, (error: any) => {
                        this.isSaving = false;
                        if (error?.status === 405) {
                            this.closeProjDisclCreateModal();
                            this._commonService.concurrentUpdateAction = this.projectType?.toLowerCase();
                        } else if (error?.status === 406) {
                            this.closeProjDisclCreateModal();
                            const ERROR_MSG = error.error ? error.error : `Error in creating ${this.projectType?.toLowerCase()} disclosure, please try again.`;
                            const CONFIG = new COIValidationModalConfig();
                            CONFIG.errorList = [ERROR_MSG];
                            this._commonService.openCOIValidationModal(CONFIG);
                        } else {
                            const ERROR_MSG = (error.error && error.error.errorMessage) ? error.error.errorMessage : `Error in creating ${this.projectType?.toLowerCase()} disclosure, please try again.`;
                            this._commonService.showToast(HTTP_ERROR_STATUS, ERROR_MSG);
                        }
                    }));
        }
    }

    private closeProjDisclCreateModal(): void {
        this._commonService.closeProjDisclCreateModal();
        setTimeout(() => {
            this.projDisclCreateConfig.selectedProject = null;
            this.resetHomeUnit();
        }, 200);
    }

    postConfirmation(modalAction: ModalActionEvent): void {
        if (modalAction.action === 'PRIMARY_BTN') {
            this.createProjectDisclosure();
        } else {
            this.closeProjDisclCreateModal();
        }
    }

    selectedUnitEvent(event: any): void {
        if (event) {
            this.setHomeUnit(event.unitName, event.unitNumber);
            this.mandatoryList.delete('homeUnit');
        } else {
            this.currentHomeUnit = new CurrentHomeUnit();
        }
    }

    resetHomeUnit(): void {
        this.isShowUnitSearch = false;
        this.setHomeUnit(this._commonService.currentUserDetails.unitName, this._commonService.currentUserDetails.unitNumber);
        this.unitSearchOptions.defaultValue = this.currentHomeUnit.homeUnit;
        this.mandatoryList.delete('homeUnit');
    }

    cardInputActions(event: ProjectConfigInputAction): void {
        if (event.action === 'CREATE_DISCLOSURE_BTN') {
            this.projDisclCreateConfig.selectedProject = event.selectedProject;
            this.createProjectDisclosure();
            return;
        }
        if (['VIEW_DISCLOSURE_BTN', 'LINK_DISCLOSURE_BTN'].includes(event.action)) {
            this.closeProjDisclCreateModal();
            return;
        }
    }

    cardApiActions(event: ProjectConfigAction): void {
        if (['REFRESH', 'GET_ACTIVE_DISCLOSURE'].includes(event.action) && event.apiStatus === 'ERROR') {
            this._commonService.projDisclCreateModal = new ProjDisclCreateModal();
            return;
        }
        if (event.action === 'REFRESH') {
            this.userProjectList = event.projectList;
            if (this.activeProjectsTypes?.length === 1) {
                this.modalConfig.displayOptions.modalSize = this.userProjectList?.length ? 'xl' : 'lg';
                openCommonModal(this.DISCLOSURE_CREATION_MODAL_ID);
            }
        }
    }

    changeProjectType(projectTypeCode: string | number): void {
        this.isLoading = true;
        this.projectListConfiguration = {
            projectTypeCode: projectTypeCode,
            customClass: 'modal-body-sticky-top',
            isShowConfirmationModal: false,
            triggeredFrom: 'CREATE_MODAL',
            uniqueId: 'create-modal',
            currentPageNumber: null,
            paginationLimit: null,
            searchText: '',
            isSliderOrModal: true,
            isShowCreateDisclosureBtn: !this.isShowErrorMessage
        };
        this.userProjectList = [];
        this.projectType = PROJECT_TYPE_LABEL[this.projectListConfiguration?.projectTypeCode];
        setTimeout(() => {
            this.isLoading = false;
        });
    }

}
