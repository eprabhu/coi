import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormSharedModule } from '../../../configuration/form-builder-create/shared/shared.module';
import { SharedComponentModule } from '../../../shared-components/shared-component.module';
import { SharedModule } from '../../../shared/shared.module';
import { PersonDetails, PersonEligibilityForm, PersonEligibilityModalConfig, ReviewerDashboardSearchValues } from '../../reviewer-dashboard.interface';
import { ELIGIBILITY_MODAL_FIELD_ORDER, PERSON_ELIGIBILITY_MODAL_ID } from '../../reviewer-dashboard-constants';
import { CommonModalConfig, ModalActionEvent } from '../../../shared-components/common-modal/common-modal.interface';
import { closeCommonModal, deepCloneObject } from '../../../common/utilities/custom-utilities';
import { ReviewerDashboardService } from '../../services/reviewer-dashboard.service';
import { CommonService } from '../../../common/services/common.service';
import { DATE_PLACEHOLDER, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { FormsModule } from '@angular/forms';
import { EndPointOptions } from '../../../shared-components/shared-interface';
import { ADV_SEARCH_DEPARTMENT_PH } from '../../../app-locales';
import { isValidDateFormat, parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';
import { getEndPointOptionsForOPAPerson } from '../../../common/services/end-point.config';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';

@Component({
    selector: 'app-person-eligibility-addition-modal',
    templateUrl: './person-eligibility-addition-modal.component.html',
    styleUrls: ['./person-eligibility-addition-modal.component.scss'],
    standalone: true,
    imports: [CommonModule, SharedModule, SharedComponentModule, FormSharedModule, MatIconModule, FormsModule]
})
export class PersonEligibilityAdditionModalComponent implements OnInit, OnDestroy {

    @ViewChild('startDate') startDatePicker: any;
    @ViewChild('endDate') endDatePicker: any;

    @Output() triggerPersonList: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Input() personEligibilityModalConfig: PersonEligibilityModalConfig;

    mandatoryList = new Map();
    datePlaceHolder = DATE_PLACEHOLDER;
    dateValidationMap = new Map<string, string>();
    disabledFields = new Map<string, boolean>();
    personEligibilityForm = new PersonEligibilityForm();
    advSearchClearField: string;
    OPAPersonSearchOptionsForPersonList: EndPointOptions = {};
    advSearchDepartmentPlaceholder = ADV_SEARCH_DEPARTMENT_PH;
    EligibilityModalFieldOrder = ELIGIBILITY_MODAL_FIELD_ORDER;
    isPersonSelectedFromSearch = false;
    dashboardTempSearchValues = new ReviewerDashboardSearchValues();
    $subscriptions: Subscription[] = [];
    private originalFormData: PersonEligibilityForm;
    modalConfig = new CommonModalConfig(PERSON_ELIGIBILITY_MODAL_ID, '', 'Close', 'lg');
    personDetails: PersonDetails;
    isShowErrorMessage = false;
    canEditPersonEligibility = false;

    constructor( private _reviewerDashboardService: ReviewerDashboardService, public commonService: CommonService) { }

    ngOnInit() {
        this.modalConfig.namings.primaryBtnName = this.personEligibilityModalConfig?.isEditMode ? 'Update Eligibility' : 'Modify Eligibility'
        this.setSearchOptions();
        this.initializeForm();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private setSearchOptions(): void {
        this.OPAPersonSearchOptionsForPersonList = getEndPointOptionsForOPAPerson(this.commonService.baseUrl);
    }

    private initializeForm(): void {
        if (this.personEligibilityModalConfig?.personDetails) {
            this.populateFormWithPersonDetails(this.personEligibilityModalConfig.personDetails);
            this.setSearchOptionsFromCache();
            this.storeOriginalData();
            this.disablePrimaryButton();
            this.isPersonSelectedFromSearch = true;
        } else {
            this.personEligibilityForm = new PersonEligibilityForm();
            this.isPersonSelectedFromSearch = false;
        }
        this.updateDateFieldsStateBasedOnExemptToggle();
    }

    private setSearchOptionsFromCache(): void {
        this.OPAPersonSearchOptionsForPersonList.defaultValue = this.personEligibilityForm.personFullName || '';
    }

    private storeOriginalData(): void {
        this.originalFormData = deepCloneObject(this.personEligibilityForm);
    }

    private populateFormWithPersonDetails(personDetails: any): void {
        this.personEligibilityForm = {
            createOpaAdminForceAllowed: personDetails?.createOpaAdminForceAllowed || false,
            canCreateOPA: personDetails?.canCreateOPA || false,
            opaExemptFromDate: personDetails?.opaExemptFromDate ? parseDateWithoutTimestamp(personDetails?.opaExemptFromDate) : null,
            opaExemptToDate: personDetails?.opaExemptToDate ? parseDateWithoutTimestamp(personDetails?.opaExemptToDate) : null,
            opaExemptionReason: personDetails?.opaExemptionReason || '',
            isExemptFromOPA: personDetails?.isExemptFromOPA || false,
            appointmentTitle: personDetails?.appointmentTitle || '',
            personFullName: personDetails?.personFullName,
            unitName: personDetails?.displayName,
            personDisclRequirementId: personDetails?.personDisclRequirementId
        };
        this.canEditPersonEligibility = personDetails?.canEdit;
        this.setDisabledFieldsBasedOnMode();
    }

    private setDisabledFieldsBasedOnMode(): void {
        this.disabledFields.clear();
        const PERSON = this.personEligibilityModalConfig.personDetails;
        const FIELDS: [string, boolean][] = [
            ['person', this.personEligibilityModalConfig.isEditMode ? true : !this.isPersonSelectedFromSearch],
            ['opaExemptFromDate', !!PERSON.opaExemptFromDate],
            ['opaExemptToDate', !!PERSON.opaExemptToDate],
            ['opaExemptionReason', !!PERSON.opaExemptionReason]
        ];
        FIELDS.forEach(([field, disabled]) => this.disabledFields.set(field as string, disabled));
    }

    private updateDateFieldsStateBasedOnExemptToggle(): void {
        if (this.personEligibilityForm.isExemptFromOPA) {
            this.disabledFields.set('opaExemptFromDate', false);
            this.disabledFields.set('opaExemptToDate', false);
        } else {
            this.disabledFields.set('opaExemptFromDate', true);
            this.disabledFields.set('opaExemptToDate', true);
            this.personEligibilityForm.opaExemptFromDate = '';
            this.personEligibilityForm.opaExemptToDate = '';
            this.personEligibilityForm.opaExemptionReason = '';
        }
    }

    private isDateFormatValid(dateString: string | null | undefined): boolean {
        if (!dateString) {
            return true;
        }
        return isValidDateFormat({ _i: dateString });
    }

    private updateEligibility(data: any): void {
        this.$subscriptions.push(this._reviewerDashboardService.updatePersonDisclRequirement(data).subscribe((res) => {
            this.mandatoryList.clear();
            this.personEligibilityForm = new PersonEligibilityForm();
            this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Eligibility updated successfully');
            this.triggerPersonList.next(true);
            this.closeModal();
        }, (_err) => {
            this.commonService.showToast(HTTP_ERROR_STATUS, 'Failed to update eligibility');
        }));
    }

    private getPersonDetails(personId: string | number): void {
        this.$subscriptions.push(this._reviewerDashboardService.getPersonDisclRequirement(personId).subscribe((res) => {
            this.mandatoryList.clear();
            this.personEligibilityModalConfig.personDetails = res;
            this.canEditPersonEligibility = res?.canEdit;
            this.isShowErrorMessage = !this.canEditPersonEligibility;
            this.isPersonSelectedFromSearch = true;
            this.populateFormWithPersonDetails(res);
            this.updateDateFieldsStateBasedOnExemptToggle();
            this.storeOriginalData();
            this.disablePrimaryButton();
            this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Person details fetched successfully');
        }, (_err) => {
            this.commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching person details.');
        }));
    }

    private saveEligibility(): void {
        this.checkIsMandatoryFieldsFilled();
        if (this.mandatoryList.size === 0 && this.dateValidationMap.size === 0) {
            const PERSON_ELIGIBILITY_DATA = {
                ...this.personEligibilityForm,
                opaExemptFromDate: parseDateWithoutTimestamp(this.personEligibilityForm.opaExemptFromDate) || null,
                opaExemptToDate: parseDateWithoutTimestamp(this.personEligibilityForm.opaExemptToDate) || null
            };
            this.updateEligibility(PERSON_ELIGIBILITY_DATA);
        }
    }

    private closeModal(): void {
        closeCommonModal(PERSON_ELIGIBILITY_MODAL_ID);
        setTimeout(() => {
            this._reviewerDashboardService.personEligibilityModalConfig = new PersonEligibilityModalConfig();
            this.resetForm();
        }, 200);
    }

    private resetForm(): void {
        this.personEligibilityForm = new PersonEligibilityForm();
        this.mandatoryList.clear();
        this.dateValidationMap.clear();
        this.disabledFields.clear();
        this.isPersonSelectedFromSearch = false;
        this.OPAPersonSearchOptionsForPersonList.defaultValue = '';
    }

    private validateDates(): void {
        const FROM_DATE = this.personEligibilityForm.opaExemptFromDate;
        const TO_DATE = this.personEligibilityForm.opaExemptToDate;
        if (FROM_DATE && TO_DATE && FROM_DATE > TO_DATE) {
            this.dateValidationMap.set('endDate', 'End date cannot be before start date');
        } else {
            this.dateValidationMap.delete('endDate');
        }
    }

    private hasFormChanged(): boolean {
        const FORM_CURRENT_DATA = this.personEligibilityForm;
        const FORM_INITIAL_DATA = this.originalFormData;
        const HAS_DATA_CHANGED = (
            FORM_CURRENT_DATA.createOpaAdminForceAllowed !== FORM_INITIAL_DATA.createOpaAdminForceAllowed ||
            FORM_CURRENT_DATA.opaExemptFromDate !== FORM_INITIAL_DATA.opaExemptFromDate ||
            FORM_CURRENT_DATA.opaExemptToDate !== FORM_INITIAL_DATA.opaExemptToDate ||
            FORM_CURRENT_DATA.opaExemptionReason !== FORM_INITIAL_DATA.opaExemptionReason ||
            FORM_CURRENT_DATA.isExemptFromOPA !== FORM_INITIAL_DATA.isExemptFromOPA ||
            FORM_CURRENT_DATA.personFullName !== FORM_INITIAL_DATA.personFullName ||
            FORM_CURRENT_DATA.unitName !== FORM_INITIAL_DATA.unitName
        );
        return HAS_DATA_CHANGED;
    }

    private disablePrimaryButton(): void {
        this.modalConfig.ADAOptions.isDisablePrimaryBtn = !this.hasFormChanged();
    }

    isFieldDisabled(fieldName: string): boolean {
        return this.disabledFields.get(fieldName) || false;
    }

    onAdminOverrideToggle(event: boolean): void {
        this.personEligibilityForm.createOpaAdminForceAllowed = event;
        this.disablePrimaryButton();
        this.checkIsMandatoryFieldsFilled();
    }

    onExemptFromOPAToggle(event: boolean): void {
        this.personEligibilityForm.isExemptFromOPA = event;
        this.disablePrimaryButton();
        this.updateDateFieldsStateBasedOnExemptToggle();
        this.checkIsMandatoryFieldsFilled();
    }

    onDateSelect(): void {
        this.validateDates();
        this.disablePrimaryButton();
        this.checkIsMandatoryFieldsFilled();
    }

    selectedPersonDetails(person: any): void {
        if (person?.personId) {
            this.personEligibilityForm.personFullName = person.value || person.full_name || null;
            if (!this.personEligibilityModalConfig.isEditMode) {
                this.getPersonDetails(person.personId);
            }
        } else {
            this.isShowErrorMessage = false;
        }
    }

    selectedDeptDetails(unit: any): void {
        this.personEligibilityForm.unitName = unit?.value ?? unit?.displayName ?? null;
    }

    validateDateFormat(dateType: 'startDate' | 'endDate'): void {
        const DATE = dateType === 'startDate' ?
            this.personEligibilityForm.opaExemptFromDate :
            this.personEligibilityForm.opaExemptToDate;

        if (DATE && !this.isDateFormatValid(DATE)) {
            this.dateValidationMap.set(dateType, 'Invalid date format');
        } else {
            this.dateValidationMap.delete(dateType);
        }
        this.validateDates();
    }

    changeEvent(fieldName: string): void {
        this.disablePrimaryButton();
        this.checkIsMandatoryFieldsFilled();
    }

    checkIsMandatoryFieldsFilled(): void {
        this.mandatoryList.clear();
        if (!this.personEligibilityModalConfig.isEditMode && !this.isPersonSelectedFromSearch) {
            this.mandatoryList.set('person', 'Person selection is required');
        }
        if (this.personEligibilityForm.isExemptFromOPA) {
            if (!this.personEligibilityForm.opaExemptFromDate) {
                this.mandatoryList.set('opaExemptFromDate', 'OPA Exempt FROM date is required');
            }

            if (!this.personEligibilityForm.opaExemptToDate) {
                this.mandatoryList.set('opaExemptToDate', 'OPA Exempt TO date is required');
            }
        }
    }

    personEligibilityModalAction(event: ModalActionEvent): void {
        switch(event.action) {
            case 'PRIMARY_BTN':
                this.saveEligibility();
                break;
            case 'SECONDARY_BTN':
            case 'CLOSE_BTN':
                this.closeModal();
                break;
        }
    }
}