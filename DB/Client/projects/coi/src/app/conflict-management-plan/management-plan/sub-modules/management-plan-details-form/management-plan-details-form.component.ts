import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { SharedComponentModule } from '../../../../shared-components/shared-component.module';
import { FormSharedModule } from '../../../../configuration/form-builder-create/shared/shared.module';
import { FBConfiguration, FormBuilderStatusEvent } from 'projects/coi/src/app/configuration/form-builder-create/shared/form-builder-view/form-builder-interface';
import { NO_FORM_CONFIGURED_MESSAGE } from 'projects/coi/src/app/no-info-message-constants';
import { COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS, NEW_FORM_HEADER_MSG, NEW_FORM_VERSION_MSG } from 'projects/coi/src/app/app-constants';
import { CommonModalConfig, ModalActionEvent } from 'projects/coi/src/app/shared-components/common-modal/common-modal.interface';
import { CommonService } from 'projects/coi/src/app/common/services/common.service';
import { ManagementPlanDataStoreService } from '../../services/management-plan-data-store.service';
import { ManagementPlanService } from '../../services/management-plan.service';
import { DataStoreEvent } from 'projects/coi/src/app/common/services/coi-common.interface';
import { subscriptionHandler } from 'projects/coi/src/app/common/utilities/subscription-handler';
import { closeCommonModal, openCommonModal } from 'projects/coi/src/app/common/utilities/custom-utilities';
import { COI_CMP_MODULE_CODE, COI_CMP_SUB_MODULE_CODE } from '../../../shared/management-plan-constants';
import { ManagementPlanStoreData } from '../../../shared/management-plan.interface';

@Component({
    selector: 'app-management-plan-details-form',
    templateUrl: './management-plan-details-form.component.html',
    styleUrls: ['./management-plan-details-form.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        SharedModule,
        FormSharedModule,
        SharedComponentModule,
    ],
})
export class ManagementPlanDetailsFormComponent implements OnInit {

    formList: any[] = [];
    isFormLoading = true;
    isFormEditMode = false;
    managementPlan = new ManagementPlanStoreData();
    fbConfiguration = new FBConfiguration();
    noFormDataMessage = NO_FORM_CONFIGURED_MESSAGE;

    versionModalMsg = NEW_FORM_VERSION_MSG;
    versionModalHeader = NEW_FORM_HEADER_MSG;
    versionModalConfig = new CommonModalConfig('NEW_VERSION_INFO_MODAL', 'Cancel', '');

    private $subscriptions: Subscription[] = [];
    private timeOutRef: ReturnType<typeof setTimeout>;

    constructor(private _commonService: CommonService,
        private _managementPlanDataStore: ManagementPlanDataStoreService,
        public managementPlanService: ManagementPlanService) {}

    ngOnInit(): void {
        this.getDataFromStore({ action: 'REFRESH', dependencies: [] });
        this.listenDataChangeFromStore();
        window.scrollTo(0, 0);
    }

    ngOnDestroy(): void {
        clearTimeout(this.timeOutRef);
        subscriptionHandler(this.$subscriptions);
    }

    private getDataFromStore(storeEvent: DataStoreEvent): void {
        this.managementPlan = this._managementPlanDataStore.getData();
        if (storeEvent.action === 'REFRESH') {
            this.getApplicableForms();
        } else {
            this.updateFormEditMode();
        }
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._managementPlanDataStore.dataEvent.subscribe((storeEvent: DataStoreEvent) => {
                this.getDataFromStore(storeEvent);
            })
        );
    }

    private getApplicableForms(): void {
        this.isFormLoading = true;
        this._commonService.setLoaderRestriction();
        this.$subscriptions.push(
            this.managementPlanService.getApplicableForms(this.managementPlan.plan)
                .subscribe({
                    next: (data: any) => {
                        this.formList = data || [];
                        const FORM_STATUS_MAP: Map<number, 'Y' | 'N'> = this.managementPlanService.setFormStatus(this.formList);
                        setTimeout(() => {
                            const FORM_BUILDER_ID = this.managementPlanService.setFormBuilderId(
                                this.formList[0],
                                this._managementPlanDataStore.isFormEditable()
                            );
                            FORM_BUILDER_ID ? this.configureForm(FORM_STATUS_MAP) : (this.isFormLoading = false);
                        });
                    },
                    error: () => {
                        this.isFormLoading = false;
                        this.updateFormEditMode();
                        this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                    }
                }));
        this._commonService.removeLoaderRestriction();
    }

    private configureForm(formStatusMap: Map<number, 'Y' | 'N'>): void {
        this._commonService.setLoaderRestriction();
        this.fbConfiguration = {
            ...this.fbConfiguration,
            formBuilderId: this.managementPlanService.formBuilderId,
            moduleItemCode: COI_CMP_MODULE_CODE.toString(),
            moduleSubItemCode: COI_CMP_SUB_MODULE_CODE.toString(),
            moduleItemKey: this.managementPlan.plan?.cmpId?.toString(),
            moduleSubItemKey: this.managementPlan.plan?.cmpNumber?.toString() || '',
            documentOwnerPersonId: this.managementPlan.plan?.person?.personId
        };
        if (formStatusMap.get(Number(this.managementPlanService.formBuilderId)) === 'Y') {
            this.fbConfiguration.formBuilderId = this.managementPlanService.answeredFormId;
            this.fbConfiguration.newFormBuilderId = this.managementPlanService.formBuilderId;
            this.managementPlanService.formBuilderEvents.next({ eventType: 'REVISION_REQUESTED', data: this.fbConfiguration });
            this.timeOutRef = setTimeout(() => {
                openCommonModal(this.versionModalConfig.namings.modalName);
            }, 200);
            formStatusMap.set(Number(this.managementPlanService.formBuilderId), 'N');
        } else {
            this.managementPlanService.formBuilderEvents.next({ eventType: 'CONFIGURATION', data: this.fbConfiguration });
        }
        this._commonService.removeLoaderRestriction();
        this.updateFormEditMode();
    }

    private updateFormEditMode(): void {
        const IS_FORM_EDIT_MODE = this._managementPlanDataStore.isFormEditable();
        this.managementPlanService.formBuilderEvents.next({ eventType: 'IS_EDIT_MODE', data: IS_FORM_EDIT_MODE });
        this.isFormEditMode = IS_FORM_EDIT_MODE;
    }

    versionModalPostConfirmation(modalActionEvent: ModalActionEvent) {
        closeCommonModal(this.versionModalConfig.namings.modalName);
    }

    certifyAndSubmit(): void {
        this.managementPlanService.triggerManagementPlanActions('FORM_SUBMIT');
    }

    formBuilderDataChanged(formEvent: FormBuilderStatusEvent) {
        switch (formEvent?.action) {
            case 'COPY_FORM_FETCHING_COMPLETE':
            case 'FORM_FETCHING_COMPLETE':
                this.isFormLoading = false;
                break;
            case 'CHANGED':
                this._commonService.setChangesAvailable(true);
                this.managementPlanService.isFormBuilderDataChangePresent = true;
                break;
            case 'SAVE_COMPLETE':
                const EVENT = { ...formEvent, isFormBuilderDataChangePresent: this.managementPlanService.isFormBuilderDataChangePresent }
                this.managementPlanService.triggerManagementPlanActions('FORM_SAVE_COMPLETE', EVENT);
                this.managementPlanService.isAnyAutoSaveFailed = false;
                break;
            case 'ERROR':
                this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                break;
            case 'AUTO_SAVE_ERROR':
                this._commonService.setChangesAvailable(false);
                this.managementPlanService.isAnyAutoSaveFailed = true;
                break;
            default: break;
        }
    }


}
