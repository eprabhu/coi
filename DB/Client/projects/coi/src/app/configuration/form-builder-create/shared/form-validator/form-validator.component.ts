import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ValidationClickResult, ValidationConfig, ValidationMessageObj, ValidationResponse } from './form-validator.interface';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { fadeIn, slideDown } from './form-validator-animation';
import { OPA_CHILD_ROUTE_URLS } from '../../../../app-constants';
import { HeaderService } from '../../../../common/header/header.service';

declare const $: any;

@Component({
    selector: 'app-form-validator',
    templateUrl: './form-validator.component.html',
    styleUrls: ['./form-validator.component.scss'],
    animations: [
        slideDown, fadeIn
      ]
})
export class FormValidatorComponent implements OnChanges {

    @Input() validationList: ValidationResponse[] = [];
    @Input() proceedBtnName = 'Submit';
    @Input() defaultFormPath = OPA_CHILD_ROUTE_URLS.FORM;
    @Input() validationConfig: ValidationConfig = new ValidationConfig();
    @Input() isTabEmitNeeded = false;
    @Output() proceedAction = new EventEmitter<any>();
    @Output() moveToNextTab = new EventEmitter<any>();


    subscription$ = [];
    isShowDock = false;
    currentIndex = 0;
    navigationDetails: any = null;
    isErrorPresent = false;
    isShowNavigationIcons = false;
    isModalOpened = false;
    private scrollTimeout: ReturnType<typeof setTimeout>;

    constructor(private _router: Router, private _headerService: HeaderService) {
        // this part invokes on tab change and look for the div id that the user has selected. If the div id is found, then the user is navigated to that part, else reties for 25 times
        this.subscription$.push(this._router.events.subscribe(async (event: any) => {
            if (this.validationList?.length && (event instanceof NavigationEnd)) {
                let RETRY_COUNT = 0;
                do {
                    await new Promise(resolve => setTimeout(() => {
                        this.addValidations();
                        this.scrollToValidation(this.navigationDetails?.id);
                        resolve('');
                    }, 500));
                    if (document.getElementById(this.navigationDetails?.id)) {
                        this.navigationDetails = null;
                    }
                    RETRY_COUNT++;
                } while (!document.getElementById(this.navigationDetails?.id) && RETRY_COUNT <= 25);
            }
        }));
    }

    ngOnChanges(change: SimpleChanges): void {
        this.currentIndex = 0;
        this.clearValidation();
        if (this.validationList?.length) {
            this.addValidations();
            if (!change.validationList.previousValue?.length && change.validationList.currentValue?.length && this.validationConfig.isShowNavigationBar) {
                this.isModalOpened = true;
                $('#validate-form-modal').modal('show');
            }
            this.isErrorPresent = this.validationList.some(e => e.validationType == 'VE' || e.validationType == 'VM');
        }
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.subscription$);
    }


    moveToNextValidation(direction) {
        direction === 'RIGHT' ? this.nextValidation() : this.previousValidation();
    }

    nextValidation() {
        this.currentIndex = this.currentIndex + 1;
        if (this.currentIndex > this.validationList.length - 1) {
            this.currentIndex = 0;
        }
        this.navigateToDiv();
    }

    previousValidation() {
        this.currentIndex = this.currentIndex - 1;
        if (this.currentIndex < 0) {
            this.currentIndex = this.validationList.length - 1;
        }
        this.navigateToDiv();
    }

    private navigateToDiv() {
        const { navigationURL } = this.validationList[this.currentIndex];
        this.goToCorrespondingValidation(this.validationList[this.currentIndex], navigationURL);
    }

    goToCorrespondingValidation(validationList: ValidationResponse, navigationURL: string = this.defaultFormPath) {
        document.URL.includes(navigationURL) ?
            this.scrollToTarget(validationList) : this.navigateToDocumentRoutePath(validationList, navigationURL);
        if(this.isTabEmitNeeded) {
            this.moveToNextTab.emit(validationList?.componentId);
        }
    }

    private scrollToTarget(validation: ValidationResponse) {
        const VALIDATION_CLICK_RESULT: ValidationClickResult = this.onValidationMessageClick(validation);
        if (VALIDATION_CLICK_RESULT.elementId) {
            if (this.scrollTimeout) { clearTimeout(this.scrollTimeout); }
            this.scrollTimeout = setTimeout(() => this.scrollToValidation(VALIDATION_CLICK_RESULT.elementId), 100);
        } else {
            document.getElementById(VALIDATION_CLICK_RESULT.buttonId)?.click();
        }
    }

    private onValidationMessageClick(validation: ValidationResponse): ValidationClickResult {
        const VALIDATION_CLICK_RESULT: ValidationClickResult = new ValidationClickResult();;
        if (validation.componentType === 'QN' && validation.questionnaire?.length > 0) {
            const QUESTION = validation.questionnaire?.[0];
            VALIDATION_CLICK_RESULT.elementId = QUESTION ? `FB-ques_${QUESTION.componentId}-${QUESTION.questionId}` : null;
            VALIDATION_CLICK_RESULT.buttonId = QUESTION ? null : `scrollToMandatoryQuestion-btn-${validation.sectionId}`;
            this._headerService.$globalPersistentEventNotifier.$validationScrollId.next(VALIDATION_CLICK_RESULT.elementId);
        } 
        else if (validation.questionId) {
            const QUESTION = validation.questionId;
            VALIDATION_CLICK_RESULT.elementId = QUESTION ? `FB-ques_${validation.componentId}-${QUESTION}` : null;
            VALIDATION_CLICK_RESULT.buttonId = QUESTION ? null : `scrollToMandatoryQuestion-btn-${validation.sectionId}`;
            this._headerService.$globalPersistentEventNotifier.$validationScrollId.next(VALIDATION_CLICK_RESULT.elementId);
        } else {
            VALIDATION_CLICK_RESULT.elementId = validation.componentId;
            this._headerService.$globalPersistentEventNotifier.$validationScrollId.next(VALIDATION_CLICK_RESULT.elementId);
        }
        return VALIDATION_CLICK_RESULT;
    }

    private scrollToValidation = (elementId: string, position: 'start' | 'center' | 'end' | 'nearest' | 'below-header' = 'center') => {
        const ELEMENT = document.getElementById(elementId);
        if (!ELEMENT) return false;
        const HEADER_OFFSET_VALUE = this.validationConfig?.headerOffSetValue ?? 0;
        if (position === 'below-header' || HEADER_OFFSET_VALUE > 0) {
            const HEADER_OFFSET = HEADER_OFFSET_VALUE + 50;
            const ELEMENT_POSITION = ELEMENT.getBoundingClientRect().top + window.scrollY;
            const OFF_SET_POSITION = ELEMENT_POSITION - HEADER_OFFSET;
            window.scrollTo({ behavior: 'smooth', top: OFF_SET_POSITION });
            return true;
        }
        ELEMENT.scrollIntoView({ behavior: 'smooth', block: position });
        return true;
    };

    navigateToDocumentRoutePath(validation: ValidationResponse, navigationURL: string) {
        if(this.isTabEmitNeeded) {
            this.onValidationMessageClick(validation);
        }
        this._router.navigate([navigationURL], { queryParamsHandling: 'merge' });
        this.navigationDetails = { id: validation?.componentId, url: navigationURL };
    }

    private addValidations() {
        this.validationList?.forEach((element: ValidationResponse) => {
            this.addValidationHighlightToContent(element);
        });
    }

    private addValidationHighlightToContent(validation: ValidationResponse) {
        const ELEMENT: HTMLElement = document.getElementById(validation?.componentId);
        if (ELEMENT) {
            this.addValidationBorder(ELEMENT, validation?.validationType);
            const IS_VALIDATION_EXISTS = !!document.getElementById(`validation-msg-${validation.componentId}-`);
            if (!IS_VALIDATION_EXISTS) {
                     this.addValidationMessage({
                    validation: validation,
                    ELEMENT: ELEMENT,
                    messagePlacement: validation.componentType === 'QN' ? 'top' : 'bottom'
                });
            }
            if (validation.componentType === 'QN' && validation.questionnaire?.length) {
                validation.questionnaire?.forEach(question => {
                    if (!question.validationMessage) { return; }
                    const QN_ELEMENT = document.getElementById(`FB-ques_${validation?.componentId}-${question?.questionId}`);
                    if (QN_ELEMENT) {
                        this.addValidationBorder(QN_ELEMENT, validation?.validationType);
                        const IS_QN_VALIDATION_EXISTS = !!document.getElementById(`validation-msg-${validation.componentId}-${question.questionId || ''}`)
                        if (!IS_QN_VALIDATION_EXISTS) {
                            this.addValidationMessage({
                                validation: question,
                                ELEMENT: QN_ELEMENT, 
                                messagePlacement: 'bottom'
                            });
                        }
                    }
                });
            }
        }
    }

    private addValidationMessage(validationMsgConfig: ValidationMessageObj) {
        const VALIDATION_TEXT_NODE = document.createElement('div');
        VALIDATION_TEXT_NODE.id = 'validation-alert';
        VALIDATION_TEXT_NODE.classList.add('alert', 'd-flex', 'align-items-center', 'py-2', 'mt-3');
        VALIDATION_TEXT_NODE.classList.add(validationMsgConfig.validation?.validationType != 'VW' ? 'alert-danger' : 'alert-warning');
        let VALIDATION_ICON: HTMLElement | null = null;
        if (this.validationConfig.isShowValidationIcon) {
            VALIDATION_ICON = document.createElement('i');
            VALIDATION_ICON.classList.add('fa', 'me-3');
            VALIDATION_ICON.classList.add(validationMsgConfig.validation?.validationType != 'VW' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle');
        }
        const VALIDATION_TEXT_DIV = document.createElement('div');
        VALIDATION_TEXT_DIV.id = `validation-msg-${validationMsgConfig.validation.componentId}-${validationMsgConfig.validation.questionId || ''}`;
        const VALIDATION_TEXT = document.createTextNode(validationMsgConfig.validation?.validationMessage);
        VALIDATION_TEXT_DIV.appendChild(VALIDATION_TEXT);
        if (VALIDATION_ICON) { VALIDATION_TEXT_NODE.appendChild(VALIDATION_ICON); }
        VALIDATION_TEXT_NODE.appendChild(VALIDATION_TEXT_DIV);
        validationMsgConfig.messagePlacement === 'top' ?
            validationMsgConfig.ELEMENT.insertBefore(VALIDATION_TEXT_NODE, validationMsgConfig.ELEMENT.firstChild) : validationMsgConfig.ELEMENT.appendChild(VALIDATION_TEXT_NODE);
    }

    private addValidationBorder(ELEMENT: HTMLElement, validationType: string) {
        if (!ELEMENT.classList.contains('error-highlight-card')) {
            ELEMENT.classList.add(validationType != 'VW' ? 'error-highlight-card' : 'warning-highlight-card', 'px-3', 'rounded-2' , 'fb-mb-10');
        }
    }

    clearValidation() {
        const VALIDATION_CONTAINERS = document.querySelectorAll('#validation-alert');
        VALIDATION_CONTAINERS.forEach(element => {
            element.remove();
        });
        const VALIDATION_ERROR_HIGHLIGHTS = document.querySelectorAll('.error-highlight-card');
        VALIDATION_ERROR_HIGHLIGHTS.forEach(element => {
            element.classList.remove('error-highlight-card', 'px-3', 'rounded-2');
        });
        const VALIDATION_WARNING_HIGHLIGHTS = document.querySelectorAll('.warning-highlight-card');
        VALIDATION_WARNING_HIGHLIGHTS.forEach(element => {
            element.classList.remove('warning-highlight-card', 'px-3', 'rounded-2');
        });
    }

    emitProceedAction() {
        this.proceedAction.emit('PROCEED');
    }

}
