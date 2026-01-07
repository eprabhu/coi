import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { FBConfiguration, FormBuilderEvent, FormBuilderStatusEvent } from '../../../configuration/form-builder-create/shared/form-builder-view/form-builder-interface';
import { CommonService } from '../../../common/services/common.service';
import { subscriptionHandler } from 'projects/fibi/src/app/common/utilities/subscription-handler';
import { ActivatedRoute } from '@angular/router';
import { COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS, NEW_FORM_HEADER_MSG, NEW_FORM_VERSION_MSG, TRAVEL_MODULE_CODE, TRAVEL_SUB_MODULE_CODE } from '../../../app-constants';
import { TravelDataStoreService } from '../../services/travel-data-store.service';
import { TravelDisclosureService } from '../../services/travel-disclosure.service';
import { closeCommonModal, openCommonModal } from '../../../common/utilities/custom-utilities';
import { CommonModalConfig, ModalActionEvent } from '../../../shared-components/common-modal/common-modal.interface';

@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit, OnDestroy {

    formBuilderEvents = new Subject<FormBuilderEvent>();
    fbConfiguration = new FBConfiguration();
    isFormEditMode = this.dataStore.getEditModeForDisclosure();
    $subscriptions: Subscription[] = [];
    formBuilderId: any;
    disclosureId: any;
    travelDetails: any;
    NEW_VERSION_MODAL_ID = 'NEW_VERSION_INFO_MODAL';
    versionModalConfig = new CommonModalConfig(this.NEW_VERSION_MODAL_ID, 'Cancel', '');
    versionModalMsg = NEW_FORM_VERSION_MSG;
    versionModalHeader = NEW_FORM_HEADER_MSG;

    constructor(public travel_service: TravelDisclosureService, private dataStore: TravelDataStoreService, private _commonService: CommonService, private _route: ActivatedRoute) {
    }

    ngOnInit() {
        this.getDataFromStore();
        this.listenToDataChange();
        this.getFormId();
        window.scrollTo(0, 0);
    }

    private getFormId(): void {
        this.$subscriptions.push(this.travel_service.triggerFormId.subscribe((data: any) => {
            this.formBuilderId = data.formId;
            if (this.formBuilderId) {
                this.travel_service.activeFormId = this.formBuilderId;
                this.getApplicableForms();
            }
        }));
    }

    private getApplicableForms(): void {
        this.fbConfiguration.moduleItemCode = TRAVEL_MODULE_CODE.toString();
        this.fbConfiguration.moduleSubItemCode = TRAVEL_SUB_MODULE_CODE.toString();
        this.fbConfiguration.moduleItemKey = this.travelDetails.travelDisclosureId.toString();
        this.fbConfiguration.moduleSubItemKey = '0';
        this.fbConfiguration.documentOwnerPersonId = this._commonService.getCurrentUserDetail('personID');
        this.fbConfiguration.formBuilderId = this.formBuilderId;
        if (this.travel_service.formStatusMap.get(Number(this.formBuilderId)) === 'Y' && this.isFormEditMode) {
            this.fbConfiguration.formBuilderId = this.travel_service.answeredFormId;
            this.fbConfiguration.newFormBuilderId = this.formBuilderId;
            this.travel_service.formBuilderEvents.next({ eventType: 'REVISION_REQUESTED', data: this.fbConfiguration });
            setTimeout(() => {
                openCommonModal(this.NEW_VERSION_MODAL_ID);
            }, 200);
            this.travel_service.formStatusMap.set(Number(this.formBuilderId), 'N');
        } else {
            this.travel_service.formBuilderEvents.next({ eventType: 'CONFIGURATION', data: this.fbConfiguration });
        }
        this.updateFormEditMode();
    }

    versionModalPostConfirmation(modalActionEvent: ModalActionEvent) {
        closeCommonModal(this.NEW_VERSION_MODAL_ID);
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    triggerSave() {
        this.travel_service.formBuilderEvents.next({ eventType: 'SAVE' });
    }

    private listenToDataChange() {
        this.$subscriptions.push(this.dataStore.dataEvent.subscribe((res) => {
            this.getDataFromStore();
            this.updateFormEditMode();
        }));
    }

    private getDataFromStore() {
        if (this.dataStore.getData().travelDisclosureId) {
            this.travelDetails = this.dataStore.getData();
        }
    }

    private updateFormEditMode() {
        const IS_FORM_EDIT_MODE = this.dataStore.getEditModeForDisclosure();
        this.travel_service.formBuilderEvents.next({ eventType: 'IS_EDIT_MODE', data: IS_FORM_EDIT_MODE });
        this.isFormEditMode = IS_FORM_EDIT_MODE;
    }


    commentSliderEvent(event) {
        const COMMENT_META_DATA: any = {
            documentOwnerPersonId: this.travelDetails.personId,
            componentTypeCode: event.componentTypeCode,
            formBuilderComponentId: event.formBuilderComponentId,
            formBuilderId: event.formBuilderId,
            formBuilderSectionId: event.formBuilderSectionId,
            headerName: event.headerName
        }
        this._commonService.$commentConfigurationDetails.next(COMMENT_META_DATA);
        this.travel_service.isShowCommentNavBar = true;
    }

    formBuilderDataChanged(formEvent: FormBuilderStatusEvent) {
        switch (formEvent?.action) {
            case 'CHANGED':
                this._commonService.setChangesAvailable(true);
                this.travel_service.isFormBuilderDataChangePresent = true;
                break;
            case 'SAVE_COMPLETE': {
                this.travel_service.triggerSaveComplete.next(formEvent);
                this.travel_service.isAnyAutoSaveFailed = false;
                break;
            }
            case 'ERROR':
                this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                break;
            case 'AUTO_SAVE_ERROR': {
                this._commonService.setChangesAvailable(false);
                this.travel_service.isAnyAutoSaveFailed = true;
                break;
            }
            default: break;
        }
    }

}
