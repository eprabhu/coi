import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';
import { FormBuilderEvent, FormSection } from './shared/form-builder-view/form-builder-interface';
import {
    ComponentObjects, UpdateFormUsage, SaveFormUsage, UpdateSectionObject, UpdateFormHeaderObject, ComponentOrder, CreateComponentObject,
    CreateFormHeader, FormSectionObject, SectionOrder,
    ConfigureCustomElement
} from './form-builder-create-interface';
import {deepCloneObject} from '../../common/utilities/custom-utilities';
import {ActivatedRoute, Router} from '@angular/router';
import { ValidateFormRO } from '../../disclosure/entity-details/entity-details.service';
import { Question } from '../../shared/common.interface';

@Injectable()
export class FormBuilderCreateService {
    cacheGetForm: any = [];
    unSavedChange = false;
    autoSaveTrigger$: Subject<any> = new Subject<any>();
    formBuilderEvents = new Subject<FormBuilderEvent>();
    formEditorState: Array<FormSection> = [];
    selectedComponent;
    currentComponentPosition = {
        tempId: '',
        sectionId: '',
        orderNo: ''
    };
    newComponentPosition = {
        sectionId: '',
        orderNo: ''
    };
    currentTab = '';
    isFormPublished = false;
    detectMajorChangeEvent: Subject<any> = new Subject<any>();
    clearAdditionalInformation: Subject<any> = new Subject<any>();
    versionChangeMessage = '';
    newFormVersionObject = {};
    questionnaireVersions: any = [];
    versionModalIntialLoad = true;
    formBuilderAnswerHeaderId = null;
    dataLayerDetails = [];
    updateTimeout;
    saveUpdateTrigger$: Subject<any> = new Subject<any>();
    autoSaveUpdateTrigger$: Subject<any> = new Subject<any>();
    formBuilderVisibilityMode = 'EDIT';
    triggerForApplicableForms: Subject<any> = new Subject<any>();
    currencyLookup = [];
    isAutoSaveEnabled = false;
    formElementsSaveQueue = [];
    formQuestionsSaveQueue = [];
    tableQuestionsQueue = [];
    peLayerFailedQueue = [];
    isProcesingSavingQueue = false;
    childTableQuestionId = [];

    constructor(private _commonService: CommonService, private _http: HttpClient,
                private _router: Router, private _activatedRoute: ActivatedRoute ) {
        this.handleVersionChange();
    }

    initiateAutoSave(saveEvent: string) {
        // this.autoSaveTrigger$.next(saveEvent);
    }

    isComponentOrderChange(): boolean {
        for (const ele of this.formEditorState) {
            this.selectedComponent = ele.sectionComponent.find(ele => ele.tempId == this.currentComponentPosition.tempId);
            if (this.selectedComponent && this.selectedComponent.sectionId == this.currentComponentPosition.sectionId && this.selectedComponent.componentOrderNumber == this.currentComponentPosition.orderNo) {
                return false;
            } else if (this.selectedComponent) {
                this.newComponentPosition.sectionId = this.selectedComponent.sectionId;
                this.newComponentPosition.orderNo = this.selectedComponent.componentOrderNumber;
                return true;
            }

        }
    }

    removeUnsavedComponetsOnTabSwitch() {
        // This function removes unsaved components from FormEditorState when user switch tab on purpose.
        this.formEditorState.forEach(x => {
            x.sectionComponent.forEach((component, index) => {
                if (component.tempId) {
                    x.sectionComponent.splice(index, 1);
                }
            });
        });
    }

    isEmptySectionPresent(): boolean {
        let emptySection;
        emptySection = this.formEditorState.find(x => x.sectionComponent?.length == 0);
        if (emptySection) {
            return true;
        }
        return false;
    }

    isUnconfiguredcomponentsPresent(): boolean {
        let unconfiguredComponent;
        for (const ele of this.formEditorState) {
            unconfiguredComponent = ele.sectionComponent.find(x => x?.tempId);
            if (unconfiguredComponent) {
                return true;
            }
        }
        return false;
    }

    handleVersionChange(): void {
        this.detectMajorChangeEvent.subscribe((versionData) => {
            this.getFormDeatails(this.cacheGetForm.formHeader.formBuilderId).subscribe(( data ) => {
                this.cacheGetForm = data;
            switch (versionData.changeType) {
                    case 'NEW_SECTION': this.appendNewSection(versionData);
                    break;
                    case 'NEW_COMPONENT': this.appendNewComponent(versionData,data.formHeader.sections);
                    break;
                    case 'SECTION_DELETE': this.deleteExistingSection(versionData);
                    break;
                    case 'COMPONENT_DELETE': this.deleteExistingComponent(versionData);
                    break;
                    default: console.log('No match');
            }
            });
        });
    }

    appendNewSection(data) {
        this.versionChangeMessage = 'Adding new section will result in new version being created.';
        const FORM_WITH_NEW_SECTION = deepCloneObject(this.cacheGetForm);
        FORM_WITH_NEW_SECTION.formHeader.sections.push(data.changeObject);
        this.newFormVersionObject = FORM_WITH_NEW_SECTION;
    }

    appendNewComponent(data, allSections) {
        const ACTIVE_ELEMENTS_TEMP_ID  = this.currentComponentPosition.tempId;
        const NEW_COMPONENT = data.changeObject.component;
        this.versionChangeMessage = NEW_COMPONENT.componentId ?
            'Updating mandatory form element will result in new version being created.'
            : 'Adding new component will result in new version being created.';
        const IS_MANDATORY_COMPONENT_UPDATE = !!NEW_COMPONENT.componentId;
        const ACTIVE_SECTION = data.changeObject.currentlyActiveSection;
        const SECTION_INDEX = data.changeObject.currentlyActiveSection[0]?.sectionId;
        const ARRAY_WITH_OTHER_TEMPORARY_COMPONENTS_REMOVED = this.removeTemporaryComponents(ACTIVE_SECTION);
        let  PAYlOAD_SECTION = this.replaceTemporaryComponentsWithPayload(ARRAY_WITH_OTHER_TEMPORARY_COMPONENTS_REMOVED, NEW_COMPONENT, allSections, SECTION_INDEX, IS_MANDATORY_COMPONENT_UPDATE);
        PAYlOAD_SECTION = this.payLoadSectionWithUnwantedKeysRemoved(PAYlOAD_SECTION);
        PAYlOAD_SECTION = this.correctComponentOrder(PAYlOAD_SECTION);
        const FORM_WITH_NEW_COMPONENT = deepCloneObject(this.cacheGetForm);
        this.newFormVersionObject = this.replaceFormSection(FORM_WITH_NEW_COMPONENT, PAYlOAD_SECTION , SECTION_INDEX);

    }

    removeTemporaryComponents(data) {
        return data.filter(item =>
            item.componentId !== undefined || item.tempId === this.currentComponentPosition.tempId
        );
    }

    payLoadSectionWithUnwantedKeysRemoved(sectionArray) {
        sectionArray.forEach((x) => {
            delete x?.componentOrderNumber;
        });
        return sectionArray;
    }

    correctComponentOrder(sectionArray) {
        sectionArray.forEach((x, index) => {
            x.componentOrder = index;
        });
        return sectionArray;
    }

    replaceFormSection(formWithNewComponent, sectionArray, sectionIndex = null ) {
        const INDEX = formWithNewComponent.formHeader.sections.findIndex(x => x?.sectionId === (sectionArray[0]?.sectionId || sectionIndex));
        formWithNewComponent.formHeader.sections[INDEX].sectionComponent = sectionArray;
        return formWithNewComponent;
    }

    replaceTemporaryComponentsWithPayload (sectionArray, newComponent , allSections, sectionIndex, isMandatoryComponentUpdate) {
        let INDEX_OF_OBJECT = null;
        if (newComponent.componentId) {
            INDEX_OF_OBJECT = sectionArray.findIndex((x) => x?.componentId === newComponent.componentId);
        } else {
            INDEX_OF_OBJECT = sectionArray.findIndex((x) => x?.tempId === this.currentComponentPosition.tempId);
        }
        const SELECTED_SECTION = allSections.find((x) => x?.sectionId === (sectionIndex || sectionArray[0]?.sectionId ));
        if (isMandatoryComponentUpdate) {
            SELECTED_SECTION.sectionComponent[INDEX_OF_OBJECT] = newComponent;
        } else {
            SELECTED_SECTION?.sectionComponent.splice(INDEX_OF_OBJECT, 0, newComponent);
        }
        return SELECTED_SECTION?.sectionComponent;
    }

    deleteExistingSection(data) {
        this.versionChangeMessage = 'Deleting existing section  will result in new version being created.';
        const SECTION_INDEX = data.changeObject.sectionArrayIndex;
        const FORM_WITH_DELETED_SECTION = deepCloneObject(this.cacheGetForm);
        FORM_WITH_DELETED_SECTION.formHeader.sections.splice(SECTION_INDEX, 1);
        this.newFormVersionObject = FORM_WITH_DELETED_SECTION;
    }

    deleteExistingComponent(data) {
        this.versionChangeMessage = 'Deleting existing form element will result in new version being created.';
        const COMPONENT_ID = data.changeObject.componentId;
        const SECTION_ID = data.changeObject.sectionId;
        const FORM_WITH_DELETED_COMPONENT = deepCloneObject(this.cacheGetForm);
        const SECTION_INDEX =
            FORM_WITH_DELETED_COMPONENT.formHeader.sections.findIndex((x) => x.sectionId === SECTION_ID);
        const COMPONENT_INDEX =
            FORM_WITH_DELETED_COMPONENT.formHeader.sections[SECTION_INDEX].sectionComponent.findIndex(
                (x) => x.componentId === COMPONENT_ID);
        FORM_WITH_DELETED_COMPONENT.formHeader.sections[SECTION_INDEX].sectionComponent.
            splice(COMPONENT_INDEX, 1);
        this.newFormVersionObject = FORM_WITH_DELETED_COMPONENT;
    }

    createFormVersion() {
        this.createFormVersions(this.newFormVersionObject).subscribe((data) => {
            this.clearAdditionalInformation.next(true);
            this.versionModalIntialLoad = true;
            this._router.navigate([],
                { queryParams: { formBuilderId: data.formHeader.formBuilderId }, relativeTo: this._activatedRoute });
        });
    }

    questionnaireVersionChange() {
        const NEW_FORM = deepCloneObject(this.cacheGetForm);
        const versionMap = this.questionnaireVersions.reduce((map, item) => {
            map[item.oldVersionId] = item.questionnaireId;
            return map;
        }, {});

        NEW_FORM.formHeader.sections.forEach(section => {
            section.sectionComponent.forEach(component => {
                if (component.componentType === 'QN' && versionMap[component.componentRefId]) {
                    component.componentRefId = versionMap[component.componentRefId];
                    delete  component.updateTimestamp;
                    delete  component.updateUser;
                }
            });
        });
        this.newFormVersionObject = NEW_FORM;
        this.createFormVersion();
    }

    checkForMandatoryQuestions(questions: Question[]): boolean {
        return questions?.some((question) => question.IS_MANDATORY === 'Y' && question.SHOW_QUESTION);
    }

    getFormList(): Observable<any> {
        return this._http.get(this._commonService.formUrl + '/formbuilder/config/v1/formlist');
    }

    getFormDeatails(formBuilderId: string): Observable<any> {
        return this._http.get(this._commonService.formUrl + `/formbuilder/config/v1/form/${formBuilderId}`);
    }

    createFormHeader(formDetails: CreateFormHeader): Observable<any> {
        return this._http.post(this._commonService.formUrl + '/formbuilder/config/v1/formheader', formDetails);
    }

    publishForm(formDetails: CreateFormHeader): Observable<any> {
        return this._http.put(this._commonService.formUrl + '/formbuilder/config/v1/formheader', formDetails);
    }

    createFormSection(formSection: FormSectionObject): Observable<any> {
        return this._http.post(this._commonService.formUrl + '/formbuilder/config/v1/formsection', formSection);
    }

    createComponent(formComponent: CreateComponentObject): Observable<any> {
        return this._http.post(this._commonService.formUrl + '/formbuilder/config/v1/sectioncomponent', formComponent);
    }

    deleteComponent(componentId: number): Observable<any> {
        return this._http.delete(this._commonService.formUrl + `/formbuilder/config/v1/sectioncomponent/${componentId}`);
    }

    componentOrder(formOrder: Array<ComponentOrder>): Observable<any> {
        return this._http.patch(this._commonService.formUrl + '/formbuilder/config/v1/sectioncomponent/order', formOrder);
    }

    updateComponent(formComponent: ComponentObjects): Observable<any> {
        return this._http.put(this._commonService.formUrl + '/formbuilder/config/v1/sectioncomponent', formComponent);
    }

    getProgramElementList(): Observable<any> {
        return this._http.get(this._commonService.formUrl + '/formbuilder/config/v1/programmedElementList');
    }

    getQuestionnaireList(): Observable<any> {
        return this._http.get(this._commonService.formUrl + '/formbuilder/config/v1/questionnaireList');
    }

    getCustomElementList(): Observable<any> {
        return this._http.get(this._commonService.formUrl + '/formbuilder/config/v1/customElementList');
    }

    readComponent(formBuilderSectCompId: number): Observable<any> {
        return this._http.get(this._commonService.formUrl + `/formbuilder/config/v1/sectioncomponent/${formBuilderSectCompId}`);
    }

    sectionOrder(sectionOrder: Array<SectionOrder>): Observable<any> {
        return this._http.patch(this._commonService.formUrl + '/formbuilder/config/v1/formsection/order', sectionOrder);
    }

    updateSection(formSection: UpdateSectionObject): Observable<any> {
        return this._http.put(this._commonService.formUrl + '/formbuilder/config/v1/formsection', formSection);
    }

    readSection(formbuilderSectionId: number): Observable<any> {
        return this._http.get(this._commonService.formUrl + `/formbuilder/config/v1/formsection/${formbuilderSectionId}`);
    }

    deleteSection(sectionId: number): Observable<any> {
        return this._http.delete(this._commonService.formUrl + `/formbuilder/config/v1/formsection/${sectionId}`);
    }

    updateFormHeader(formDetails: UpdateFormHeaderObject): Observable<any> {
        return this._http.put(this._commonService.formUrl + '/formbuilder/config/v1/formheader', formDetails);
    }

    getSystemLookupByCustomType(dataTypeCode: { dataTypeCode: string }): Observable<any> {
        return this._http.post(this._commonService.formUrl + '/formbuilder/config/v1/getSystemLookupByCustomType', dataTypeCode);
    }

    configureCustomElement(customData: ConfigureCustomElement): Observable<any> {
        return this._http.post(this._commonService.formUrl + '/formbuilder/config/v1/configureCustomElement', customData);
    }

    fetchCustomData(customDataId: { customDataElementId: string }): Observable<any> {
        return this._http.post(this._commonService.formUrl + '/formbuilder/fetchFormCustomElementById', customDataId);
    }

    getModuleList(): Observable<any> {
        return this._http.get(this._commonService.baseUrl + '/getModuleList');
    }

    saveFormUsage(integationObj: SaveFormUsage): Observable<any> {
        return this._http.post(this._commonService.formUrl + '/formbuilder/config/v1/formusage', integationObj);
    }

    updateFormUsage(integationObj: UpdateFormUsage): Observable<any> {
        return this._http.put(this._commonService.formUrl + '/formbuilder/config/v1/formusage', integationObj);
    }

    getAllFormUsage(formBuilderId: string): Observable<any> {
        return this._http.get(this._commonService.formUrl + `/formbuilder/config/v1/formusage/${formBuilderId}`);
    }

    deleteusage(usageID: number): Observable<any> {
        return this._http.delete(this._commonService.formUrl + `/formbuilder/config/v1/formusage/${usageID}`);
    }

    getApplicableForms(getFormObj): Observable<any> {
        return this._http.post(this._commonService.formUrl + '/formbuilder/getApplicableForms', getFormObj);
    }

    createFormVersions(newVersion = this.cacheGetForm): Observable<any> {
        return this._http.post(this._commonService.formUrl + '/formbuilder/config/v1/createFormVersion', newVersion );
    }

    getUpdatedQuestionnaireDetails(formBuilderId) {
        return this._http.get(this._commonService.formUrl + `/formbuilder/config/v1/getUpdatedQuestionnaireDetails/${formBuilderId}`);
    }

    getAllFormVersions(formBuilderNumber :string) {
        return this._http.get(this._commonService.formUrl + `/formbuilder/config/v1/getAllFormVersions/${formBuilderNumber}`);
    }

    getCurrencyLookup() {
        return this._http.get(this._commonService.formUrl + `/formbuilder/config/v1/getCurrencyDetails`);
    }

     evaluateForm(formData: ValidateFormRO): Observable<any> {
        return this._http.post(`${this._commonService.formUrl}/formbuilder/validateForm`, formData);
    }

    getQuestionnaireById(questionnaireId: string): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/editQuestionnaire`, { questionnaireId });
    }
}
