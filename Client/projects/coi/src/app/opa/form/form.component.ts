import { Component, OnDestroy, OnInit} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {FBConfiguration, FormBuilderEvent, FormBuilderStatusEvent} from '../../configuration/form-builder-create/shared/form-builder-view/form-builder-interface';
import { OpaService } from '../services/opa.service';
import {DataStoreService} from '../services/data-store.service';
import {OPA} from "../opa-interface";
import { CommonService } from '../../common/services/common.service';
import { subscriptionHandler } from 'projects/fibi/src/app/common/utilities/subscription-handler';
import { ActivatedRoute } from '@angular/router';
import { COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS, NEW_FORM_HEADER_MSG, NEW_FORM_VERSION_MSG, OPA_MODULE_CODE, OPA_SUB_MODULE_CODE } from '../../app-constants';
import { CommonModalConfig, ModalActionEvent } from '../../shared-components/common-modal/common-modal.interface';
import { closeCommonModal, openCommonModal } from '../../common/utilities/custom-utilities';
import { FBOpaCardActionEvent } from '../../configuration/form-builder-create/shared/common.interface';
import { FetchReviewCommentRO } from '../../shared-components/coi-review-comments-slider/coi-review-comments-slider.interface';
import { OPA_FORM_COMMENTS } from '../../shared-components/coi-review-comments/coi-review-comments-constants';
import { COIReviewCommentsConfig } from '../../shared-components/coi-review-comments/coi-review-comments.interface';

@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit, OnDestroy {

    formBuilderEvents = new Subject<FormBuilderEvent>();
    fbConfiguration = new FBConfiguration();
    isFormEditMode = this.dataStore.isFormEditable();
    opa: OPA = new OPA();
    $subscriptions: Subscription[] = [];
    formBuilderId: any;
    disclosureId: any;
    NEW_VERSION_MODAL_ID = 'NEW_VERSION_INFO_MODAL';
    versionModalConfig = new CommonModalConfig(this.NEW_VERSION_MODAL_ID, 'Cancel', '');
    versionModalMsg = NEW_FORM_VERSION_MSG;
    versionModalHeader = NEW_FORM_HEADER_MSG;
    isShowCertifyBtn = false;
    formBuilderCardEvent: FBOpaCardActionEvent | null = null;
    timeOutRef: ReturnType<typeof setTimeout>;

    constructor(public opaService: OpaService, public dataStore: DataStoreService, public commonService: CommonService, private _route: ActivatedRoute,) {
    }

    ngOnInit() {
        this.getFormId();
        this.getDataFromStore();
        this.listenToDataChange();
        this.opaService.triggerForApplicableForms.next(true);
        window.scrollTo(0,0);
    }

    private getFormId(): void {
        this.$subscriptions.push(this.opaService.triggerFormId.subscribe((data: any) => {
            this.formBuilderId = data;
                if (this.formBuilderId) {
                    this.getApplicableForms();
                    this.opaService.activeFormId = this.formBuilderId;
                }
        }));
    }

    private getApplicableForms() : void {
        this.fbConfiguration.moduleItemCode = OPA_MODULE_CODE.toString();
        this.fbConfiguration.moduleSubItemCode = OPA_SUB_MODULE_CODE.toString();
        this.fbConfiguration.moduleItemKey = this.opa?.opaDisclosure?.opaDisclosureId?.toString();
        this.fbConfiguration.moduleSubItemKey = '0';
        this.fbConfiguration.documentOwnerPersonId = this.opa?.opaDisclosure?.personId;
        this.fbConfiguration.formBuilderId = this.formBuilderId;
        if (this.opaService.formStatusMap.get(Number(this.formBuilderId)) === 'Y') {
          this.fbConfiguration.formBuilderId = this.opaService.answeredFormId;
          this.fbConfiguration.newFormBuilderId = this.formBuilderId;
          this.opaService.formBuilderEvents.next({ eventType: 'REVISION_REQUESTED', data: this.fbConfiguration });
            setTimeout(() => {
                openCommonModal(this.NEW_VERSION_MODAL_ID);
            }, 200);          this.opaService.formStatusMap.set(Number(this.formBuilderId), 'N');
        } else {
          this.opaService.formBuilderEvents.next({ eventType: 'CONFIGURATION', data: this.fbConfiguration });
        }
        this.updateFormEditMode();
      }


    private listenToDataChange() {
        this.$subscriptions.push(this.dataStore.dataEvent.subscribe((res) => {
            this.getDataFromStore();
            this.updateFormEditMode();
        }));
    }

    private updateFormEditMode(): void {
        const latestIsFormEditMode = this.dataStore.isFormEditable();
        this.opaService.formBuilderEvents.next({eventType: 'IS_EDIT_MODE', data: latestIsFormEditMode});
        this.isFormEditMode = latestIsFormEditMode;
    }

    private getDataFromStore(): void {
        this.opa = this.dataStore.getData();
        this.triggerCommentConfig();
    }

    private triggerCommentConfig(): void {
        this.timeOutRef = setTimeout(() => {
            const COMMENT_DATA = {
                triggeredFrom: 'COMMENT_CONFIG',
                isShowCommentBtn: this.dataStore.getCommentButtonVisibility(),
                commentCount:  this.opa?.disclosureCommentsCount?.reviewCommentsCount
            }
            this.opaService.formBuilderEvents.next({ eventType: 'EXTERNAL_ACTION', data: COMMENT_DATA });
        }, 50);
    }


    emitActionEvents(event: FBOpaCardActionEvent): void {
        if (this.opaService.isFormBuilderDataChangePresent) {
            this.formBuilderCardEvent = event;
            this.opaService.formBuilderEvents.next({ eventType: 'SAVE' });
        } else {
            this.formBuilderCardEvent = null;
            this.performActionEvents(event);
        }
    }

    private performActionEvents(event: FBOpaCardActionEvent | null): void {
        switch (event?.action) {
            case 'VIEW_ENGAGEMENT':
                this.opaService.openEngagementSlider(event.content?.engagementDetails?.personEntityId);
                break;
            case 'CREATE_ENGAGEMENT':
                this.opaService.isShowCreateEngSlider = true;
                break;
            case 'MODIFY_ENGAGEMENT':
            case 'ACTIVATE_DEACTIVATE_ENGAGEMENT':
                this.commonService.$globalEventNotifier.next({ uniqueId: 'TRIGGER_OPA_FORM_ACTIONS', content: { triggeredFrom: event.action, engagementDetails: event.content?.engagementDetails } });
                break;
            case 'DELETE_ENGAGEMENT':
                this.opaService.openEngDeleteConfirmModal(event.content?.engagementDetails);
                break;
            case 'COMMENT':
                this.openCommentSliderEvent(event);
                break;
            default: break;
        }
    }

    openCommentSliderEvent(event: FBOpaCardActionEvent): void {
        const REQ_BODY: FetchReviewCommentRO = {
            componentTypeCode: OPA_FORM_COMMENTS?.componentTypeCode,
            moduleItemKey: this.opa?.opaDisclosure?.opaDisclosureId,
            moduleItemNumber: this.opa?.opaDisclosure?.opaDisclosureNumber,
            subModuleCode: null,
            subModuleItemKey:  event?.content?.engagementDetails?.personEntityId,
            subModuleItemNumber: event?.content?.engagementDetails?.personEntityNumber,
            isSectionDetailsNeeded: true,
            formBuilderId: event?.content?.formBuilderId,
            formBuilderComponentId: event?.content?.sectionComponent?.componentId,
            formBuilderSectionId: event?.content?.sectionComponent?.sectionId,
            documentOwnerPersonId: this.opa?.opaDisclosure?.personId,
        };
        const REVIEW_COMMENTS_CARD_CONFIG: Partial<COIReviewCommentsConfig> = {
            moduleSectionDetails: {
                sectionId: event?.content?.engagementDetails?.personEntityId,
                sectionName: event?.content?.engagementDetails?.entityName,
                sectionKey: event?.content?.engagementDetails?.personEntityId + event?.content?.engagementDetails?.entityName
            },
            componentDetails: {
                componentName: event?.content?.sectionComponent?.sectionName,
                componentTypeCode: OPA_FORM_COMMENTS?.componentTypeCode
            }
        };
        this.opaService.setReviewCommentSliderConfig(REQ_BODY, REVIEW_COMMENTS_CARD_CONFIG);
    }

    formBuilderDataChanged(formEvent: FormBuilderStatusEvent) {
        switch (formEvent?.action) {
            case 'COPY_FORM_FETCHING_COMPLETE':
            case 'FORM_FETCHING_COMPLETE': 
                this.isShowCertifyBtn = this.dataStore.isFormEditable();
                this.opaService?.setTopDynamically();
                this.triggerCommentConfig();
                break;
            case 'CHANGED': {
                this.opaService.isFormBuilderDataChangePresent = true;
                this.commonService.setChangesAvailable(true);
                break;
            }
            case 'SAVE_COMPLETE': {
                this.opaService.triggerSaveComplete.next(formEvent);
                this.opaService.isAnyAutoSaveFailed = false;
                this.performActionEvents(this.formBuilderCardEvent);
                break;
            }
            case 'NEW_SFI':
                this.loadOPA();
                break;
            case 'ERROR':
                this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                this.isShowCertifyBtn = false;
                break;
            case 'AUTO_SAVE_ERROR': {
                this.commonService.setChangesAvailable(false);
                this.opaService.isAnyAutoSaveFailed = true;
                break;
            }
            default: break;
        }
    }

    loadOPA() {
        this.$subscriptions.push(this.opaService.loadOPA(this.opa.opaDisclosure.opaDisclosureId).subscribe((data) => {
            this.dataStore.updateStore(['opaDisclosure'], {opaDisclosure: data});
        }));
    }

    versionModalPostConfirmation(modalActionEvent: ModalActionEvent) {
        closeCommonModal(this.NEW_VERSION_MODAL_ID);
    }

    certifyAndSubmit(): void {
        this.opaService.triggerForSaveAndSubmit.next('CERTIFY_AND_SUBMIT');
    }

    ngOnDestroy(): void {
        clearTimeout(this.timeOutRef);
        subscriptionHandler(this.$subscriptions);
    }
}
