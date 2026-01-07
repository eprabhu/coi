import { Injectable } from '@angular/core';
import { EntityDetailsService, LEAVE_PAGE_AND_COMPLETE } from './entity-details.service';
import { CommonService } from '../../common/services/common.service';
import { hideAutoSaveToast, openCommonModal } from '../../common/utilities/custom-utilities';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { COI_ERROR_ROUTE_URLS } from '../../app-constants';

@Injectable()

export class EntityDetailsRouteGuardService {

private readonly _moduleCode = 'SFI53';
constructor(private entityDetailsService: EntityDetailsService, private _commonService: CommonService) { }

    canDeactivate(component: any, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot): boolean {
        const DESTINATION = nextState?.url;
        this._commonService.closeCOIValidationModal();
        if (this._commonService.hasChangesAvailable) {
            this._commonService.isNavigationStopped = true;
            this._commonService.attemptedPath = nextState.url;
            this._commonService.appLoaderContent = 'Saving...';
            this._commonService.isShowLoader.next(true);
            const elements = document.getElementsByClassName('invalid-feedback');
            const errToast = document.getElementById('coi-retry-error-toast');
            if ((errToast && !errToast?.classList.contains('invisible')) || (elements && elements.length)) {
                this._commonService.isShowLoader.next(false);
            }
            return false;
        } else {
            this._commonService.isNavigationStopped = false;
            this._commonService.attemptedPath = '';
            hideAutoSaveToast('ERROR');                
            if (DESTINATION.includes(COI_ERROR_ROUTE_URLS.FORBIDDEN) || DESTINATION.includes(COI_ERROR_ROUTE_URLS.UNAUTHORIZED)) {
                return true;
            } else {
                if (this.hasUnsavedChanges() || this.hasIncompleteForm()) {
                    this.canShowModalIfNeeded();
                    return false;
                }
                return true;
            }
        }
    }

    resolve() {
        return this._commonService.getDashboardActiveModules(this._moduleCode)
    }

private hasUnsavedChanges(): boolean {
    return this.entityDetailsService.isRelationshipQuestionnaireChanged ||
           this.entityDetailsService.isAdditionalDetailsChanged ||
           this.entityDetailsService.isMatrixChanged ||
           this.entityDetailsService.isFormDataChanged;
}

private hasIncompleteForm(): boolean {
    return this.entityDetailsService.isMandatoryComponentAvailable ||
           !this.entityDetailsService.isFormCompleted;
}

private canShowModalIfNeeded(): void {
   this.hasUnsavedChanges() ? this.openUnsavedChangesModal() : this.canShowModal();
}

openUnsavedChangesModal() {
    this.entityDetailsService.unsavedChangesSecndryBtn = 'Leave Page';
    const HAS_UNSAVED_CHANGES = this.entityDetailsService.isAdditionalDetailsChanged || this.entityDetailsService.isFormDataChanged;
    const FORM_INCOMPLETE_AND_NO_MANDATORY = !this.entityDetailsService.isMandatoryComponentAvailable && !this.entityDetailsService.isFormCompleted && !this.entityDetailsService.isShowRelationshipDetailsTab;
    if (HAS_UNSAVED_CHANGES && FORM_INCOMPLETE_AND_NO_MANDATORY) {
        this.entityDetailsService.unsavedChangesSecndryBtn = LEAVE_PAGE_AND_COMPLETE;
    }
    document.getElementById(this.entityDetailsService.hiddenUnSaveChnagesBtn)?.click();
}

private canShowModal(): void{
    this.entityDetailsService.modalConfig.namings.secondaryBtnName = 'Leave Page';
    if((!this.entityDetailsService.isShowRelationshipDetailsTab || (this.entityDetailsService.isShowRelationshipDetailsTab && this.entityDetailsService.isMatrixComplete && !this.entityDetailsService.isMandatoryComponentAvailable) ) && !this.entityDetailsService.isMandatoryComponentAvailable && !this.entityDetailsService.isFormCompleted) {
        this.entityDetailsService.modalConfig.namings.secondaryBtnName = LEAVE_PAGE_AND_COMPLETE;
    }
    this.entityDetailsService.modalConfig.namings.primaryBtnName = 'Stay On Page';
    openCommonModal(this.entityDetailsService.formSavingConfirmationId);
}
}
