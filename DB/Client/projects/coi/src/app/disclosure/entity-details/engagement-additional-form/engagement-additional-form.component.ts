import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { EntityDetailsService } from '../entity-details.service';
import { CommonService } from '../../../common/services/common.service';
import { COI_MODULE_CODE, HTTP_ERROR_STATUS, NEW_FORM_HEADER_MSG, NEW_FORM_VERSION_MSG, SFI_ADDITIONAL_DETAILS_SECTION_NAME, ENGAGEMENT_SUB_MODULE_CODE} from '../../../app-constants';
import { FBConfiguration, FormBuilderStatusEvent } from '../../../configuration/form-builder-create/shared/form-builder-view/form-builder-interface';
import { closeCommonModal, openCommonModal } from '../../../common/utilities/custom-utilities';
import { CommonModalConfig, ModalActionEvent } from '../../../shared-components/common-modal/common-modal.interface';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { ValidationConfig } from '../../../configuration/form-builder-create/shared/form-validator/form-validator.interface';

@Component({
    selector: 'app-engagement-additional-form',
    templateUrl: './engagement-additional-form.component.html',
    styleUrls: ['./engagement-additional-form.component.scss']
})
export class EngagementAdditionalFormComponent implements OnInit, OnChanges {

    @Input() isEditMode: boolean;
    @Input() validationConfig: ValidationConfig = new ValidationConfig();
    engagementId: string;
    formBuilderId: any;
    $subscriptions = [];
    NEW_VERSION_MODAL_ID = 'NEW_VERSION_INFO_MODAL';
    versionModalMsg = NEW_FORM_VERSION_MSG;
    versionModalHeader = NEW_FORM_HEADER_MSG;
    versionModalConfig = new CommonModalConfig(this.NEW_VERSION_MODAL_ID, 'Proceed', '');
    fbConfiguration = new FBConfiguration();

    constructor(public entityDetailsService: EntityDetailsService, private _commonService: CommonService) { }

    ngOnInit() {
        this.getFormId();
    }

    private addUnSavedChanges(): void {
        this.entityDetailsService.isFormDataChanged = true;
        if (!this.entityDetailsService.unSavedSections.some(ele => ele.includes(SFI_ADDITIONAL_DETAILS_SECTION_NAME))) {
            this.entityDetailsService.unSavedSections.push(SFI_ADDITIONAL_DETAILS_SECTION_NAME);
        }
    }

    ngOnChanges() {
        this.updateFormEditMode();
    }

    private updateFormEditMode(): void{
        this.entityDetailsService.formBuilderEvents.next({ eventType: 'IS_EDIT_MODE', data: this.isEditMode });
    }

    formBuilderDataChanged(formEvent: FormBuilderStatusEvent): void {
        switch (formEvent.action) {
            case 'CHANGED':
                this.addUnSavedChanges();
                this._commonService.setChangesAvailable(true);
                break;
            case 'SAVE_COMPLETE': {
                // if (this.entityDetailsService.isFormDataChanged) {
                this.entityDetailsService.triggerSaveComplete.next(formEvent.result);
                // }
                break;
            }
            case 'ERROR':
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong, Please try again.');
                break;
            case 'AUTO_SAVE_ERROR': {
                this._commonService.setChangesAvailable(false);
            }
            default: break;
        }
    }

    private getFormId(): void {
        this.$subscriptions.push(this.entityDetailsService.triggerFormId.subscribe((data: any) => {
            this.formBuilderId = data.formId;
            this.engagementId = data.engagementId;
            if (this.formBuilderId) {
                this.entityDetailsService.activeFormId = this.formBuilderId;
                this.getApplicableForms();
            }
        }));
    }

    private getApplicableForms(): void {
        this.fbConfiguration.moduleItemCode = COI_MODULE_CODE.toString();
        this.fbConfiguration.moduleSubItemCode = ENGAGEMENT_SUB_MODULE_CODE.toString();
        this.fbConfiguration.moduleItemKey = this.engagementId.toString();
        this.fbConfiguration.moduleSubItemKey = '0';
        this.fbConfiguration.documentOwnerPersonId = this._commonService.getCurrentUserDetail('personID');
        this.fbConfiguration.formBuilderId = this.formBuilderId;
        if (this.entityDetailsService.formStatusMap.get(Number(this.formBuilderId)) === 'Y' && this.isEditMode) {
            this.fbConfiguration.formBuilderId = this.entityDetailsService.answeredFormId;
            this.fbConfiguration.newFormBuilderId = this.formBuilderId;
            this.entityDetailsService.formBuilderEvents.next({ eventType: 'REVISION_REQUESTED', data: this.fbConfiguration });
            setTimeout(() => {
                openCommonModal(this.NEW_VERSION_MODAL_ID);
            }, 200);
            this.entityDetailsService.formStatusMap.set(Number(this.formBuilderId), 'N');
        } else {
            this.entityDetailsService.formBuilderEvents.next({ eventType: 'CONFIGURATION', data: this.fbConfiguration });
        }
        this.updateFormEditMode();
    }

    versionModalPostConfirmation(modalActionEvent: ModalActionEvent) {
        closeCommonModal(this.NEW_VERSION_MODAL_ID);
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

}
