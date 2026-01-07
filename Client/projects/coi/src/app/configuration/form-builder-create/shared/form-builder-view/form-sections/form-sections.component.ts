import { Subject } from 'rxjs';
import { FBConfiguration, UpdatedQuestionnaire } from './../form-builder-interface';
import { EventEmitter, Input, Output, Component, AfterViewInit, OnChanges, OnDestroy, OnInit, SimpleChange } from '@angular/core';
import { CustomElementVO, FormSection, QuestionnaireVO, SectionComponent } from '../form-builder-interface';
import { setCommentInput } from '../form-builder.service';
import {environment} from '../../../../../../environments/environment';
import { heightAnimation } from '../../../../../common/utilities/animations';
import { ExternalActionEvent, FBOpaCardActionEvent } from '../../common.interface';
import { FormBuilderCreateService } from '../../../form-builder-create.service';
import { HeaderService } from '../../../../../common/header/header.service';
import { Question } from '../../../../../shared/common.interface';
import { scrollIntoView } from '../../../../../common/utilities/custom-utilities';

@Component({
    selector: 'app-form-sections',
    templateUrl: './form-sections.component.html',
    styleUrls: ['./form-sections.component.scss'],
    animations: [heightAnimation('0', '*', 300, 'heightAnimation')]
})
export class FormSectionsComponent implements AfterViewInit, OnChanges, OnDestroy {

    @Input() sectionDetails = new FormSection();
    @Input() saveEventForChildComponent;
    @Input() externalActionEventForChildComponent = new Subject<ExternalActionEvent>();
    @Input() formBuilderId: number;
    @Input() fbConfiguration: FBConfiguration;
    @Input() isFormEditable;
    @Input() isFirstSection;
    @Output()saveEventFromChildComponents = new EventEmitter<any>();
    @Output()emitCommentEvent = new EventEmitter<any>();
    @Output() emitActionEvent = new EventEmitter<FBOpaCardActionEvent>();
    deployMap = environment.deployUrl;
    headerId = '';
    timeout: ReturnType< typeof setTimeout >;
    isShowSectionDetails = true;
    totalFormFields = 0;
    answeredFormFields = 0;
    unansweredMandatoryFields = [];
    hasMandatoryQuestion = false;
    private timeOutID;
    
    constructor(private readonly _formBuilderService: FormBuilderCreateService,
        private readonly _headerService: HeaderService) { }

    ngAfterViewInit(): void {
        this.setSectionHeader();
    }

    ngOnChanges(SimpleChange): void {
        if (SimpleChange.sectionDetails) {
            this.hasMandatoryQuestion = this.sectionDetails?.sectionComponent?.some(component => component.isMandatory === 'Y');
            this.handleAnswerChangeEvent(this.sectionDetails.sectionComponent);
        }
       this.headerId = `Fb-section-header-${this.sectionDetails?.sectionId}`;
       if (this.timeout) {
        clearTimeout(this.timeout);
       }
       this.timeout = setTimeout(() => {
         this.setSectionHeader();
       },200);
    }

    ngOnDestroy(): void {
       if (this.timeout) { clearTimeout(this.timeout); }
        if (this.timeOutID) { clearTimeout(this.timeOutID); }
    }

    getTotalElementCount(sectionComponentList: SectionComponent[]): void {
        this.totalFormFields = 0;
        sectionComponentList.forEach(component => {
            const COMPONENT_TYPE = component?.componentType;
            if (!COMPONENT_TYPE || ['HL', 'BR', 'RT'].includes(COMPONENT_TYPE)) return;
            if (COMPONENT_TYPE === 'QN') {
                component?.questionnaire?.questionnaire?.questions.forEach(question => { if (question.SHOW_QUESTION) this.totalFormFields++ });
            } else {
                this.totalFormFields++;
            }
        });
    }

    saveEventsFromChild(data: QuestionnaireVO | CustomElementVO| any , component: SectionComponent) {
        const DATA = new SectionComponent();
        DATA.componentId = component.componentId;
        DATA.componentType = component.componentType;
        switch (component.componentType) {
            case 'QN': DATA.questionnaire = data.data; break;
            case 'CE':
            case 'SE':
            case 'NE':
            case 'DE':
            case 'CB':
            case 'RB':
            case 'ES':
            case 'AS':
            case 'SD':
            case 'UD':
            case 'PT':
            case 'TE':
            case 'AT':
            DATA.customElement = data.data; break;
            case 'PE': DATA.programmedElement = data.data; break;
        }
        this.saveEventFromChildComponents.emit(DATA);
    }

    setCommentDetails(headerName, sectionId, componentId, event) {
        event.stopPropagation();
        this.emitCommentEvent.emit(setCommentInput(this.formBuilderId, sectionId, componentId, headerName));
    }

    canShowComments(component) {
        if (component.componentType == 'CE' && component.customElement && component.customElement.customDataElementId)
            return true;
        else if(component.componentType == 'QN' && component.questionnaire && component.questionnaire.header.QUESTIONNAIRE_ID)
            return true;
        else if(component.componentType == 'PE' && component.programmedElement && component.programmedElement.data.length)
            return true;
    }

    collapseHeader() {
        this.isShowSectionDetails = !this.isShowSectionDetails;
        this.timeout = setTimeout(() => {
            this.setSectionHeader();
        }, 200);
    }

    setSectionHeader() {
        const HEADER_ELEMENT = document.getElementById(this.headerId);
        const EXISTING_SECTION_HEADER = HEADER_ELEMENT?.querySelector('.fb-section-header-info');
        if (EXISTING_SECTION_HEADER) {
          EXISTING_SECTION_HEADER.remove();
        }
        const PARENT_ELEMENT = document.createElement('div');
        PARENT_ELEMENT.classList.add('fb-section-header-info', 'ck-content', 'text-break');
        PARENT_ELEMENT.innerHTML = this.sectionDetails?.sectionHeader;
        if (HEADER_ELEMENT) {
            HEADER_ELEMENT.appendChild(PARENT_ELEMENT);
        }
    }

    showSectionDetails(): void {
        this.isShowSectionDetails = !this.isShowSectionDetails;
        if (this.isShowSectionDetails) {
            this.timeOutID = setTimeout(() => {
                this.setSectionHeader()
                const VALIDATION_LIST = this._headerService.$globalPersistentEventNotifier.$formValidationList.getValue() ?? [];
                if (VALIDATION_LIST.length) { this._headerService.$globalPersistentEventNotifier.$formValidationList.next(VALIDATION_LIST); }
            });
        }
    }

     handleAnswerChangeEvent(sectionComponentList = this.sectionDetails.sectionComponent): void {
        this.getTotalElementCount(sectionComponentList);
        this.answeredFormFields = 0;
        this.unansweredMandatoryFields = [];
        sectionComponentList?.forEach(component => {
            if(component.componentType === 'QN') {
                const IS_ALL_QUESTION_MANDATORY = component?.isMandatory === 'Y' && !this._formBuilderService.checkForMandatoryQuestions(component?.questionnaire?.questionnaire?.questions);
                component?.questionnaire?.questionnaire?.questions?.forEach(question => {
                    const IS_MANDATORY  =  (question.IS_MANDATORY === 'Y' || IS_ALL_QUESTION_MANDATORY) && component.isMandatory === 'Y' && question.SHOW_QUESTION;
                    const IS_ANSWERED  = question.SHOW_QUESTION && this.getAnswerCount(question.ANSWERS, question);
                    this.updateAnswerCount(IS_ANSWERED, IS_MANDATORY, `FB-ques_${component?.componentId}-${question?.QUESTION_ID}`);
                })
            } else {
                const { IS_MANDATORY, IS_ANSWERED } = this.getAnswerStatusOfElement(component);
                this.updateAnswerCount(IS_ANSWERED, IS_MANDATORY, component.componentId.toString());
            }
        })

    }

    updateAnswerCount(IS_ANSWERED: boolean, IS_MANDATORY: boolean, COMPONENT_ID: string): void {
        IS_ANSWERED && this.answeredFormFields++;
        IS_MANDATORY && !IS_ANSWERED &&  this.unansweredMandatoryFields.push(COMPONENT_ID);
    }

    getAnswerStatusOfElement(component): { IS_MANDATORY: boolean, IS_ANSWERED: boolean } {
        if (component.componentType === 'CB') {
            return { IS_MANDATORY: component?.isMandatory === 'Y', IS_ANSWERED: component?.customElement?.customElements?.[0]?.answers?.some(answer => answer.value && answer.description) };
        } else if (component.componentType === 'AT') {
            return { IS_MANDATORY: component?.isMandatory === 'Y', IS_ANSWERED: component?.customElement?.customElements?.[0]?.attachments?.length };
        }
        else {
            return { IS_MANDATORY: component?.isMandatory === 'Y', IS_ANSWERED: component?.customElement?.customElements?.[0]?.answers?.some(answer => answer.value) };
        }
    }

    getAnswerCount(answer, question: Question | null = null): boolean {
        if (question.ANSWER_TYPE !== 'Table' && !answer) return true;
        if (question && question.ANSWER_TYPE === 'Table') {
           return question?.ANSWERS?.[1] && question.ANSWERS?.[1]?.some(tableAnswer => !tableAnswer?.AC_TYPE );
        } else {
            return Object.values(answer).filter(Boolean).length === 0 ? false : true;
        }
    }

    emitActionEvents(event: FBOpaCardActionEvent): void {
        this.emitActionEvent.emit(event);
    }

    scrollToMandatoryQuestion(): void {
        scrollIntoView(this.unansweredMandatoryFields[0]);
    }

    updateEmittedQuestionnaire(event: UpdatedQuestionnaire): void {
        const UPDATED_LIST = this.sectionDetails.sectionComponent.map(component => {
            return component.componentId === event.componentId ?
                {
                    ...component,
                    questionnaire: {
                        ...component.questionnaire,
                        questionnaire: event.questionnaire
                    }
                } : component
        })
        this.handleAnswerChangeEvent(UPDATED_LIST);
    }
}
