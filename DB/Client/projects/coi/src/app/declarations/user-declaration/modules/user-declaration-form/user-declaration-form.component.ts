import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DECLARATION_LOCALIZE } from '../../../../app-locales';
import { SharedModule } from '../../../../shared/shared.module';
import { DeclarationType, UserDeclaration } from '../../../declaration.interface';
import { CommonService } from '../../../../common/services/common.service';
import { COI_DECLARATION_MODULE_CODE } from '../../../declaration-constants';
import { UserDeclarationService } from '../../services/user-declaration.service';
import { DataStoreEvent } from '../../../../common/services/coi-common.interface';
import { NO_FORM_CONFIGURED_MESSAGE } from '../../../../no-info-message-constants';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { SharedComponentModule } from '../../../../shared-components/shared-component.module';
import { FormSharedModule } from '../../../../configuration/form-builder-create/shared/shared.module';
import { UserDeclarationDataStoreService } from '../../services/user-declaration-data-store.service';
import { closeCommonModal, isEmptyObject, openCommonModal } from '../../../../common/utilities/custom-utilities';
import { CommonModalConfig, ModalActionEvent } from '../../../../shared-components/common-modal/common-modal.interface';
import { NEW_FORM_VERSION_MSG, NEW_FORM_HEADER_MSG, HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG } from '../../../../app-constants';
import { FBConfiguration, FormBuilderStatusEvent } from '../../../../configuration/form-builder-create/shared/form-builder-view/form-builder-interface';

@Component({
    selector: 'app-user-declaration-form',
    templateUrl: './user-declaration-form.component.html',
    styleUrls: ['./user-declaration-form.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        SharedModule,
        SharedComponentModule,
        FormSharedModule,
    ],
})
export class UserCertificationFormComponent implements OnInit, OnDestroy {

    formList: any[] = [];
    isFormLoading = true;
    isFormEditMode = false;
    userDeclaration = new UserDeclaration();
    fbConfiguration = new FBConfiguration();
    declarationLocalize = DECLARATION_LOCALIZE;
    noFormDataMessage = NO_FORM_CONFIGURED_MESSAGE;
    declarationTypeDetails: DeclarationType | null = null;

    versionModalMsg = NEW_FORM_VERSION_MSG;
    versionModalHeader = NEW_FORM_HEADER_MSG;
    versionModalConfig = new CommonModalConfig('NEW_VERSION_INFO_MODAL', 'Cancel', '');

    private $subscriptions: Subscription[] = [];
    private timeOutRef: ReturnType<typeof setTimeout>;

    constructor(private _commonService: CommonService,
        private _userDeclarationDataStore: UserDeclarationDataStoreService,
        public userDeclarationService: UserDeclarationService) {}

    ngOnInit(): void {
        this.getDataFromStore({ action: 'REFRESH', dependencies: []});
        this.listenDataChangeFromStore();
        window.scrollTo(0, 0);
    }
    
    ngOnDestroy(): void {
        clearTimeout(this.timeOutRef);
        subscriptionHandler(this.$subscriptions);
    }
    
    private getDataFromStore(storeEvent: DataStoreEvent): void {
        const USER_DECLARATION = this._userDeclarationDataStore.getData();
        if (isEmptyObject(USER_DECLARATION)) { return; }
        this.userDeclaration = USER_DECLARATION;
        this.declarationTypeDetails = this.userDeclaration?.declaration?.declarationType;
        if (storeEvent.action === 'REFRESH') {
            this.getApplicableForms();
        } else {
            this.updateFormEditMode();
        }
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._userDeclarationDataStore.dataEvent.subscribe((storeEvent: DataStoreEvent) => {
                this.getDataFromStore(storeEvent);
            })
        );
    }

    private getApplicableForms(): void {
        this.isFormLoading = true;
        this.$subscriptions.push(
            this.userDeclarationService.getApplicableForms(this.userDeclaration?.declaration)
                .subscribe({
                    next: (data: any) => {
                        this.formList = data || [];
                        const FORM_STATUS_MAP: Map<number, 'Y' | 'N'> = this.userDeclarationService.setFormStatus(this.formList);
                        setTimeout(() => {
                            const FORM_BUILDER_ID = this.userDeclarationService.setFormBuilderId(
                                this.formList[0],
                                this._userDeclarationDataStore.isFormEditable()
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
    }

    private configureForm(formStatusMap: Map<number, 'Y' | 'N'>): void {
        this.fbConfiguration = {
            ...this.fbConfiguration,
            formBuilderId: this.userDeclarationService.formBuilderId,
            moduleItemCode: COI_DECLARATION_MODULE_CODE.toString(),
            moduleSubItemCode: this.userDeclaration?.declaration?.declarationTypeCode?.toString(),
            moduleItemKey: this.userDeclaration?.declaration?.declarationId?.toString(),
            moduleSubItemKey: this.userDeclaration?.declaration?.declarationNumber?.toString(),
            documentOwnerPersonId: this.userDeclaration?.declaration?.person?.personId
        };
        if (formStatusMap.get(Number(this.userDeclarationService.formBuilderId)) === 'Y') {
            this.fbConfiguration.formBuilderId = this.userDeclarationService.answeredFormId;
            this.fbConfiguration.newFormBuilderId = this.userDeclarationService.formBuilderId;
            this.userDeclarationService.formBuilderEvents.next({ eventType: 'REVISION_REQUESTED', data: this.fbConfiguration });
            this.timeOutRef = setTimeout(() => {
                openCommonModal(this.versionModalConfig.namings.modalName);
            }, 200);
            formStatusMap.set(Number(this.userDeclarationService.formBuilderId), 'N');
        } else {
            this.userDeclarationService.formBuilderEvents.next({ eventType: 'CONFIGURATION', data: this.fbConfiguration });
        }
        this.updateFormEditMode();
    }

    private updateFormEditMode(): void {
        const IS_FORM_EDIT_MODE = this._userDeclarationDataStore.isFormEditable();
        this.userDeclarationService.formBuilderEvents.next({ eventType: 'IS_EDIT_MODE', data: IS_FORM_EDIT_MODE });
        this.isFormEditMode = IS_FORM_EDIT_MODE;
    }

    versionModalPostConfirmation(modalActionEvent: ModalActionEvent) {
        closeCommonModal(this.versionModalConfig.namings.modalName);
    }

    certifyAndSubmit(): void {
        this.userDeclarationService.triggerDeclarationActions('FORM_SUBMIT');
    }

    formBuilderDataChanged(formEvent: FormBuilderStatusEvent) {
        switch (formEvent?.action) {
            case 'COPY_FORM_FETCHING_COMPLETE':
            case 'FORM_FETCHING_COMPLETE':
                this.isFormLoading = false;
                break;
            case 'CHANGED':
                this._commonService.setChangesAvailable(true);
                this.userDeclarationService.isFormBuilderDataChangePresent = true;
                break;
            case 'SAVE_COMPLETE':
                const EVENT = { ...formEvent, isFormBuilderDataChangePresent: this.userDeclarationService.isFormBuilderDataChangePresent}
                this.userDeclarationService.triggerDeclarationActions('FORM_SAVE_COMPLETE', EVENT);
                this.userDeclarationService.isAnyAutoSaveFailed = false;
                break;
            case 'ERROR':
                this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                break;
            case 'AUTO_SAVE_ERROR':
                this._commonService.setChangesAvailable(false);
                this.userDeclarationService.isAnyAutoSaveFailed = true;
                break;
            default: break;
        }
    }

}
