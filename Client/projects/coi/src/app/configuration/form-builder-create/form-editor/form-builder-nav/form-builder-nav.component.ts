import {Component, OnInit, OnDestroy, HostListener} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilderCreateService } from '../../form-builder-create.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import {FormHeaderResponse, FormVersion, LoadForm, UpdateFormHeaderObject} from '../../form-builder-create-interface';
import { NavigationService } from '../../../../common/services/navigation.service';
import { CommonService} from '../../../../common/services/common.service';
import {HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS} from '../../../../app-constants';
import {environment} from '../../../../../environments/environment';
import {deepCloneObject} from '../../../../common/utilities/custom-utilities';
import {FB_SECOND_NAV_BAR_ID} from '../../form-builder-constants';

declare const $: any;


@Component({
    selector: 'app-form-builder-nav',
    templateUrl: './form-builder-nav.component.html',
    styleUrls: ['./form-builder-nav.component.scss']
})
export class FormBuilderNavComponent implements OnInit, OnDestroy {
    formBuilderId: string;
    formTitle = '';
    $subscriptions: Subscription[] = [];
    formBuilderNumber: string;
    isFormPublishable = false;
    publisModalHeading: string;
    publisModalMsg: string;
    formDescription = '';
    isBackButtonClicked = 'N';
    questionnaireVersions:any = [];
    isFormActive = '';
    formVersionStatus = '';
    formPublishMode = 'A';
    deployMap = environment.deployUrl;
    formVersionArray: FormVersion[];
    formValidationMap = new Map();
    titleObject = {
        title: '',
        description: '',
    };
    formVersionNumber = 0;
    timeOut;
    allFormVersions = [];
    screenWidth = 0;
    titleLimitObject = {
        title_length: null,
        description_length: null,
    };
    FB_SECOND_NAV_BAR_ID = FB_SECOND_NAV_BAR_ID;
    @HostListener('window:resize', ['$event'])
    onResize(event: Event) {
        this.screenWidth = window.innerWidth; // Update the screen width on resize
        this.characterLimitForTitleAndDescription();
    }

    constructor(private _route: ActivatedRoute, public formBuilderService: FormBuilderCreateService,
        private navigation: Router, private navigationService: NavigationService, private _commonService: CommonService) { }

    ngOnInit() {
        this.$subscriptions.push(
        this._route.queryParamMap.subscribe(queryParams => {
            this.formBuilderId = queryParams.get('formBuilderId');
            this.serviceForLoadingForm(this.formBuilderId);
            this.togglePreviewAndEdit();
            this.screenWidth = window.innerWidth;
            this.characterLimitForTitleAndDescription();
        }));
    }

    serviceForLoadingForm(formBuilderId: string): void {
        this.$subscriptions.push(
            this.formBuilderService.getFormDeatails(formBuilderId).subscribe((data: LoadForm) => {
                this.isFormActive = data.formHeader.isActive;
                this.formVersionStatus = data.formHeader.versionStatus;
                this.formDescription = data.formHeader.description;
                this.formTitle = data.formHeader.title;
                this.formVersionNumber = data.formHeader.versionNumber;
                this.titleObject.title = JSON.parse(JSON.stringify(this.formTitle));
                this.titleObject.description = JSON.parse(JSON.stringify(this.formDescription));
                this.formBuilderNumber = data.formHeader.formBuilderNumber;
                this.isFormPublished();
                this.getAllFormVersions();
                if (this.formBuilderService.versionModalIntialLoad) {
                    this.getUpdatedQuestionnaireDetails();
                }
            }, error => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching form failed.Please try again');
            })
        );
    }

    prepareFormHeaderObject(action: string = ''): UpdateFormHeaderObject {
        const VERSION_STATUS = action === 'PUBLISH' ? 'ACTIVE' : this.formVersionStatus;
        const FORM_HEADER_OBJECT = new UpdateFormHeaderObject();
        FORM_HEADER_OBJECT.formBuilderId = this.formBuilderId;
        FORM_HEADER_OBJECT.title = this.titleObject.title;
        FORM_HEADER_OBJECT.description = this.titleObject.description;
        FORM_HEADER_OBJECT.isActive = this.isFormActive;
        FORM_HEADER_OBJECT.versionStatus = VERSION_STATUS;
        FORM_HEADER_OBJECT.versionMode = this.formPublishMode;
        return FORM_HEADER_OBJECT;
    }

    saveTitle(): void {
        if (this.isFormCreationValid()){
        this.$subscriptions.push(
            this.formBuilderService.updateFormHeader(this.prepareFormHeaderObject()).subscribe((data: FormHeaderResponse) => {
                this.titleObject.title = this.formTitle = data.title;
                this.titleObject.description = this.formDescription = data.description;
                $('#FB-update-form-modal').modal('hide');
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Form title updated successfully.');
            }, error => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating form title failed. Please try again');
            })
        );
        }
    }

    navigateToTab(): void {
        if (this.isBackButtonClicked === 'Y') {
            this.navigation.navigate(['../form-list'], { relativeTo: this._route});
            this.isBackButtonClicked = 'N';
            return;
        }
        this.navigation.navigateByUrl(this.navigationService.navigationGuardUrl);
    }

    removeUnsavedComponentsOnTabSwitch() {
        this.formBuilderService.removeUnsavedComponetsOnTabSwitch();
        this.navigateToTab();
        return true;
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    canFormBePublished(): void {
        const IS_EMPTY_SECTION_PRESENT = this.formBuilderService.isEmptySectionPresent();
        const IS_UNCONFIGURED_COMPONENTS_PRESENT = this.formBuilderService.isUnconfiguredcomponentsPresent();

        if (this.formBuilderService.formEditorState.length === 0) {
            this.isFormPublishable = false;
            this.publisModalHeading = 'Warning';
            this.publisModalMsg = 'Empty Form cannot be published.';

        } else if (!IS_EMPTY_SECTION_PRESENT && !IS_UNCONFIGURED_COMPONENTS_PRESENT) {
            this.isFormPublishable = true;
            this.publisModalHeading = 'Publish Form';
            this.publisModalMsg = 'Are you sure you want to publish this form?';


        } else {
            this.isFormPublishable = false;
            this.publisModalHeading = 'Warning';
            this.publisModalMsg =
                'You cannot publish a form with' + (IS_UNCONFIGURED_COMPONENTS_PRESENT ? ' unconfigured components or ' : ' ') + 'empty sections.';
        }
        $('#FB-publish-Modal').modal('show');
        this.formPublishMode = 'A';
    }

    publishForm(): void {
        this.$subscriptions.push(
            this.formBuilderService.publishForm(this.prepareFormHeaderObject('PUBLISH')).subscribe((data: FormHeaderResponse) => {
                this.formVersionStatus = data.versionStatus;
                this.formBuilderService.isFormPublished = true;
                this.getAllFormVersions();
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Form published successfully.');
            }, error => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Publishing Form failed.Please try again.');
            })
        );
    }

    navigateToFormList(): void {
        if (this.formBuilderService.currentTab === '1' && this.formBuilderService.isUnconfiguredcomponentsPresent()) {
            $('#FB-unSavedChange-warning-Modal').modal('show');
            this.isBackButtonClicked = 'Y';
        } else {
            this.navigation.navigate(['../form-list'], { relativeTo: this._route});
        }
    }

    closeBtn(id: string) {
        $(id).modal('hide');
    }

    closeModalOnAccept() {
        $('#FB-additional-info-modal').modal('hide');
        $('#FB-confirm-version-change-Modal').modal('hide');
    }

    getUpdatedQuestionnaireDetails() {
        this.$subscriptions.push(
            this.formBuilderService.getUpdatedQuestionnaireDetails(this.formBuilderId).subscribe(
                (data) => {
                    this.formBuilderService.versionModalIntialLoad = false;
                    this.questionnaireVersions = data;
                    if (this.questionnaireVersions.length && !['DRAFT'].includes(this.formVersionStatus) ) {
                    $('#FB-questionnaire-version-change-Modal').modal('show');
                    this.formBuilderService.questionnaireVersions = data;
                    }
                }, error => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching questionnaire version details failed.Please try again.');
                }
            ));
    }

    isFormPublished() {
        this.formVersionStatus === 'DRAFT' ?
            this.formBuilderService.isFormPublished = false : this.formBuilderService.isFormPublished = true;
    }

    // Function to toggle Preview and edit buttons.
    togglePreviewAndEdit() {
        const TOGGLE_EDIT_BTN = document.getElementById('FB-editBtn');
        const TOGGLE_PREVIEW_BTN = document.getElementById('FB-previewBtn');
        if (document.URL.includes('form-editor/integration') || document.URL.includes('form-editor/editor')) {
            if (this.timeOut) {
                clearTimeout(this.timeOut);
            }
            this.timeOut = setTimeout(() => {
            TOGGLE_PREVIEW_BTN.classList.remove('active');
            TOGGLE_EDIT_BTN.classList.add('active');
            this.formBuilderService.formBuilderVisibilityMode = 'EDIT';
        });
        } else if (document.URL.includes('form-editor/preview')) {
            if (this.timeOut) {
                clearTimeout(this.timeOut);
            }
            this.timeOut = setTimeout(() => {
                TOGGLE_PREVIEW_BTN.classList.add('active');
                TOGGLE_EDIT_BTN.classList.remove('active');
            });
                this.formBuilderService.formBuilderVisibilityMode = 'PREVIEW';
        }
    }

    getAllFormVersions() {
            this.$subscriptions.push(
                this.formBuilderService.getAllFormVersions(this.formBuilderNumber).subscribe((data: FormVersion[]) => {
                    this.formVersionArray = data;
                    this.allFormVersions = this.formVersionArray.map(x => x?.versionStatus);
                }, error => this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching  versions failed'))
            );
        }

    showTitleEditModal() {
        this.titleObject.title = deepCloneObject(this.formTitle);
        this.titleObject.description = deepCloneObject(this.formDescription);
        $('#FB-update-form-modal').modal('show');
    }

    isFormCreationValid(): boolean {
        this.formValidationMap.clear();
        if (!this.titleObject.title) {
            this.formValidationMap.set('title', 'Please enter a title');
        }
        if (!this.titleObject.description) {
            this.formValidationMap.set('description', 'Please enter a description');
        }
        return this.formValidationMap.size <= 0;
    }

    cancelTitleEdit() {
        this.titleObject.title = deepCloneObject(this.formTitle);
        this.titleObject.description = deepCloneObject(this.formDescription);
        this.formValidationMap.clear();
    }

    isEditButtonEnabled(): boolean {
        return (['ACTIVE'].includes(this.formVersionStatus) &&
                this.allFormVersions.includes('DRAFT')) || ['ARCHIVE'].includes(this.formVersionStatus);
    }

    characterLimitForTitleAndDescription() {
        if (this.screenWidth > 1672) {
            this.setLimitForTitleAndDescription(150, 150);
        } else if (this.screenWidth > 1116) {
            this.setLimitForTitleAndDescription(90, 90);
        } else {
            this.setLimitForTitleAndDescription(35, 40);
        }

    }

    setLimitForTitleAndDescription(title, description) {
        this.titleLimitObject.title_length = title;
        this.titleLimitObject.description_length = description;
    }
}


