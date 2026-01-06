import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { FBOpaCardActionEvent } from '../common.interface'
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormBuilderEvent, FBConfiguration, FBActionEvent, FormBuilderStatusEvent } from './form-builder-interface';
import { Observable, Subject } from 'rxjs';
import { FormBuilderService } from './form-builder.service';
import {FormBuilderCreateService} from '../../form-builder-create.service';
import { HeaderService } from '../../../../common/header/header.service';
import { getFirstUnansweredMandatoryFormElementId } from '../../../../common/utilities/custom-utilities';
import { ValidationConfig } from '../form-validator/form-validator.interface';

@Component({
    selector: 'app-form-builder-view',
    templateUrl: './form-builder-view.component.html',
    styleUrls: ['./form-builder-view.component.scss'],
    providers: [FormBuilderService]
})
export class FormBuilderViewComponent implements OnInit, OnChanges, OnDestroy {

    @Input() externalEvents: Observable<FormBuilderEvent>;
    @Input() isAutoSaveEnabled = false;
    @Input() validationConfig: ValidationConfig = new ValidationConfig();
    @Output() builderStatus = new EventEmitter<FormBuilderStatusEvent>();
    @Output() commentSlider = new EventEmitter<string>();
    @Output() emitActionEvent = new EventEmitter<FBOpaCardActionEvent>();
    formBuilderData = new FormBuilder();
    isSubscribed = false;
    saveEventForChildComponent = new Subject();
    externalActionEventForChildComponent = new Subject();
    fbConfiguration = new FBConfiguration();
    subscription$ = [];
    isFormEditable = true;
    timeoutId: ReturnType<typeof setTimeout>;
    private scrollTimeout: ReturnType<typeof setTimeout>;


    constructor( private readonly   _formBuilderService: FormBuilderService,
                private readonly  _formBuilderCreateService: FormBuilderCreateService,
                private readonly _headerService: HeaderService) {}

    ngOnChanges(changes: SimpleChanges): void {
        this.subscribeToExternalEvents();
        this.isSubscribed = true;
    }

    ngOnInit(): void {
        this.builderStatus.emit({action: 'READY'});
        this._formBuilderCreateService.isAutoSaveEnabled = this.isAutoSaveEnabled;
        this.listenToFormActions();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.subscription$);
        if (this.timeoutId) { clearTimeout(this.timeoutId); }
        this._headerService.$globalPersistentEventNotifier.$validationScrollId.next(null);
    }

    private subscribeToExternalEvents(): void {
        if (!this.isSubscribed) {
            this.subscription$.push(this.externalEvents.subscribe((E: FormBuilderEvent) => {
                switch (E.eventType) {
                    case 'CONFIGURATION':
                        this.fbConfiguration = E.data;
                        this.getFormBuilderData();
                        break;
                    case 'SAVE':
                        this.saveEventForChildComponent.next({ eventType: 'EXTERNAL_SAVE' });
                        break;
                    case 'SAVE_COMPLETED':
                        this.saveEventForChildComponent.next({ eventType: 'CHANGE_FLAG', data: false });
                        break;
                    case 'IS_EDIT_MODE':
                        this.isFormEditable = E.data;
                        break;
                    case 'BLANK_FORM':
                        this.fbConfiguration = E.data;
                        this.getFormBuilderDataForBlankForm();
                        break;
                    case 'REVISION_REQUESTED':
                        this.fbConfiguration = E.data;
                        this.getRevisedFormData();
                        break;
                    case 'EXTERNAL_ACTION':
                        this.externalActionEventForChildComponent.next({ eventType: 'EXTERNAL_ACTION', data: E.data });
                        break;
                    default:
                        break;
                }
            }));
        }
    }

    private getFormBuilderData(): void {
        this.subscription$.push(this._formBuilderService.getFormBuilderData(this.fbConfiguration).subscribe((data: any) => {
            this._formBuilderCreateService.formBuilderAnswerHeaderId = data.form.formBuilderAnswerHeaderId;
            this.formBuilderData = data;
            const VALIDATION_LIST = this._headerService.$globalPersistentEventNotifier.$formValidationList.getValue() ?? [];
            if (VALIDATION_LIST.length) {
                const SCROLL_TO_ID = this._headerService.$globalPersistentEventNotifier.$validationScrollId.getValue() ?? '';
                const SCROLL_ID = SCROLL_TO_ID ? { elementId: SCROLL_TO_ID, buttonId: '' } : getFirstUnansweredMandatoryFormElementId(VALIDATION_LIST, this.fbConfiguration.formBuilderId?.toString());
                this._headerService.$globalPersistentEventNotifier.$validationScrollId.next(null);
                if (SCROLL_ID.buttonId || SCROLL_ID.elementId) {
                    if (this.timeoutId) { clearTimeout(this.timeoutId); }
                    this.timeoutId = setTimeout(() => {
                        this._headerService.$globalPersistentEventNotifier.$formValidationList.next(VALIDATION_LIST);
                        SCROLL_ID.elementId ? this.scrollToValidation(SCROLL_ID.elementId) : document.getElementById(SCROLL_ID.buttonId)?.click();
                    }, 500);
                }
            }
            this.builderStatus.emit({action:'FORM_FETCHING_COMPLETE'});
        }, (_error: any) => {
            this.builderStatus.emit({action:'ERROR'});
        }));
    }

    private scrollToValidation = (elementId: string, position: 'start' | 'center' | 'end' | 'nearest' | 'below-header' = 'center') => {
        const ELEMENT: HTMLElement = document.getElementById(elementId);
        if (!ELEMENT) return false;
        const HEADER_OFFSET_VALUE = this.validationConfig?.headerOffSetValue ?? 0;
        if (position === 'below-header' || HEADER_OFFSET_VALUE > 0) {
            if (this.scrollTimeout) { clearTimeout(this.scrollTimeout); }
            this.scrollTimeout = setTimeout(() => {
                const HEADER_OFFSET = HEADER_OFFSET_VALUE + 50;
                const ELEMENT_POSITION = ELEMENT.getBoundingClientRect().top + window.scrollY;
                const OFF_SET_POSITION = ELEMENT_POSITION - HEADER_OFFSET;
                window.scrollTo({ behavior: 'smooth', top: OFF_SET_POSITION });
            }, 100);
            return true;
        }
        ELEMENT.scrollIntoView({ behavior: 'smooth', block: position });
        return true;
    };

    private getFormBuilderDataForBlankForm(): void {
        this.subscription$.push(this._formBuilderService.getFormBuilderDataForBlankForm(this.fbConfiguration).subscribe((data: any) => {
            this.formBuilderData = data;
        }));
    }

    emitCommentDetails(event) {
        this.commentSlider.emit(event);
    }

    listenToFormActions() {
        this.subscription$.push(this._formBuilderService.$formBuilderActionEvents.subscribe((data: FBActionEvent) => {
            if(data?.actionResponse) {
                this.builderStatus.emit({action:data.action, result: data?.actionResponse});
            } else {
                this.builderStatus.emit({action:data.action});
            }
        }));
    }

    getRevisedFormData() {
        this.subscription$.push(this._formBuilderService.getRevisedFormData(this.fbConfiguration).subscribe((data: any) => {
            this._formBuilderCreateService.formBuilderAnswerHeaderId = data.form.formBuilderAnswerHeaderId;
            this.formBuilderData = data;
            this.builderStatus.emit({action:'COPY_FORM_FETCHING_COMPLETE'});
        }, () => {
            this.builderStatus.emit({action:'ERROR'});
        }));
    }

    emitActionEvents(event): void {
        this.emitActionEvent.emit(event);
    }
}
