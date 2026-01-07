import {Component, OnInit, Input, Output, EventEmitter, OnDestroy, HostListener} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormSection, SectionComponent } from '../../shared/form-builder-view/form-builder-interface';
import { FormBuilderCreateService } from '../../form-builder-create.service';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { CommonService } from '../../../../common/services/common.service';
import { Constants } from '../../../../../../../fibi/src/app/admin-modules/custom-data/custom-data.constants';
import { EDITOR_CONFIURATION } from '../../../../../../../fibi/src/app/app-constants';
import {
    ConfigureCustomElementData, ComponentObjects, CustomDataObject, ComponentData, ReadSectionComponent, SectionUpdate, ProgramElementList,
    GetQuestionnaire, NewSection, CreateComponentObject, UpdateSectionObject, CustomDataElements, GetCustomElement, QuestionnaireElementList
} from '../../form-builder-create-interface';
import { FB_ADDITIONAL_INFO_ID, FB_ADDITIONAL_INFO_MODAL_ID, FB_FORM_EDITOR_ID, FB_VALIDATION_MESSAGE_ID} from '../../form-builder-constants';
declare const $: any;

@Component({
    selector: 'app-form-addtional-information',
    templateUrl: './form-addtional-information.component.html',
    styleUrls: ['./form-addtional-information.component.scss'],
})
export class FormAddtionalInformationComponent implements OnInit, OnDestroy {
    @Input() additionInfoComponentEvent: Observable<any>;
    @Input() additionalInfoSectionEvent: Observable<any>;
    @Output() additionalInformation: EventEmitter<any> = new EventEmitter();
    @Output() additionalInformationComponent: EventEmitter<any> = new EventEmitter();
    @Output() additionalInformationInitialComponentSave: EventEmitter<any> = new EventEmitter();
    @Input() isModalView = false;

    appAutoCompletedefaultValue: string;
    showSelectedSection = false;
    programElementList: Array<ProgramElementList> = [];
    questionnaireElementList: Array<QuestionnaireElementList> = [];
    customElementList: Array<CustomDataElements> = [];
    selectedComponent = new SectionComponent();
    selectedSection = new FormSection();
    autoCompleterOption: any = {};
    elementList: any = [];
    appAutoComplete = '';
    clearField: String;
    public Editor = DecoupledEditor;
    editorConfig = EDITOR_CONFIURATION;
    $subscriptions: Subscription[] = [];
    customDataOptions = [];
    customDatalookUpArray: Array<{}>;
    customDataDefaultValueArray = [];
    formBuilderId: string;
    isInitialSave = false;
    customDataElement = new CustomDataObject();
    selectedComponentData: any = {};
    customDataTempOptions = [];
    deletedCustomDataOptions = [];
    formValidation = new Map();
    currentlyActiveSection = [];
    isComponentMandatory = false;
    screenWidth = 0;
    editorEvent = {};
    FB_VALIDATION_MESSAGE_ID = FB_VALIDATION_MESSAGE_ID;

    constructor(
        public formBuilderService: FormBuilderCreateService,
        private commonService: CommonService) { }

    ngOnInit() {
        this.screenWidth = window.innerWidth;
        this.selectedFormElement();
        this.selectedSectionEvent();
        this.selectedComponent.componentType = '';
        this.applyStyleForComponentEvents();
        this.applyStyleForSectionEvents();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: Event) {
        this.screenWidth = window.innerWidth;
        const FB_ADDITIONAL_INFO = document.getElementById(FB_ADDITIONAL_INFO_ID);
        const FB_EDITOR_INFO = document.getElementById(FB_FORM_EDITOR_ID);
        const FB_ADDITIONAL_INFO_MODAL = document.getElementById(FB_ADDITIONAL_INFO_MODAL_ID);
        const HAS_EDITOR_EVENT = Object.keys(this.editorEvent).length;

        if (HAS_EDITOR_EVENT) {
            if (this.screenWidth < 1280) {
                // Show Modal and apply classes for small screen size
                this.styleForLargeScreens(FB_ADDITIONAL_INFO, FB_ADDITIONAL_INFO_MODAL, FB_EDITOR_INFO);
            } else if (this.screenWidth > 1280) {
                // Hide Modal and remove classes for large screen size
                $('#FB-additional-info-modal').modal('hide');
                FB_ADDITIONAL_INFO.classList.remove('fb_Additional_Info');
                FB_ADDITIONAL_INFO_MODAL.classList.remove('fb-width');
                FB_EDITOR_INFO.classList.remove('FB-Form-Editable');
            }
        }
    }

    /*
Component Type Codes and Descriptions:
HL  - Horizontal Line
BR  - Context Break
RT  - Rich Textbox
QN  - Questionnaire
PE  - Programmed Element
CB  - Check Box
DE  - Date
NE  - Number
RB  - Radio Button
SE  - String
TE  - Text
CR  - Currency
*/

    selectedFormElement(): void {
        this.additionInfoComponentEvent.subscribe((data) => {
            if (!Object.keys(data).length) {
                this.selectedComponent.componentType = '';
                return;
            }
            this.isComponentMandatory = !(data.item.isMandatory === 'N' || !data.item.isMandatory);
            this.setFocusForFields();
            this.showSelectedSection = false;
            this.formValidation.clear();
            if (data.item.tempId && data.item.tempId.includes('tempId_')) {
                this.isInitialSave = true;
                this.selectedComponent = new SectionComponent();
                this.selectedComponent.componentType = data.item.componentTypeCode;
                this.selectedComponent.componentTypeDescription = data.item.description;
                this.selectedComponent.componentData = '';
                this.selectedComponent.componentHeader = '';
                this.selectedComponent.componentFooter = '';
                this.formBuilderService.currentComponentPosition.tempId = data.item.tempId;
                this.formBuilderService.currentComponentPosition.sectionId = data.item.sectionId;
                this.formBuilderService.currentComponentPosition.orderNo = data.item.componentOrderNumber;
                this.selectedComponent.label = null;
                this.selectedComponent.isMandatory = 'N';
                if (['SE', 'NE', 'DE', 'CB', 'RB', 'ES', 'AS', 'SD', 'UD', 'TE', 'PT', 'CR', 'AT'].includes(this.selectedComponent.componentType)) {
                this.selectedComponent.captureDescription = 'N';
                this.initializeValuesForUnsavedCustomdata(data.item);
                }
                this.activateSelectedComponent();
            } else {
                this.isInitialSave = false;
                this.selectedComponent.componentId = data.item.componentId;
                if (!['HL', 'BR'].includes(data.item.componentType)) {
                this.loadComponent();
                }
            }
            this.currentlyActiveSection = data.sectionComponent;
        });

    }

    initializeValuesForUnsavedCustomdata(data) {
        this.selectedComponentData = data;
        this.customDataElement = new CustomDataObject;
        this.customDataElement.lookupArgument = null;
        this.customDataElement.defaultValue = null;
        this.customDataElement.acType = 'I';
        this.customDataElement.isMultiSelectLookup = 'N';
        this.customDataElement.hasLookup = 'N';
        this.loadCustomDataLookup();
        if (['CB', 'RB'].includes(this.selectedComponent.componentType)) {
            this.customDataOptions = [];
            this.deletedCustomDataOptions = [];
            this.addCustomDataOptions();
        }
    }

    setFocusForFields(): void {
        setTimeout(() => {
            const SEARCH_BOX = document.getElementById('FB-searchBox');
            const CUSTOM_LABEL = document.getElementById('FB-Custom-label');
            if (SEARCH_BOX) {
                SEARCH_BOX.focus();
            }
            if (!this.selectedComponent.componentRefId && SEARCH_BOX) {
                SEARCH_BOX.click();
            }
            if (this.selectedComponent.componentType == 'RT') {
                document.getElementById('FB-label').focus();
            } if (CUSTOM_LABEL) {
                CUSTOM_LABEL.focus();
            }
        }, 1000);
    }



    async componentInitialSave(isSkipValidation = false):  Promise<void> {
        if (isSkipValidation || await this.isFormFieldValidation()) {
            if (this.formBuilderService.isFormPublished) {
                $('#FB-confirm-version-change-Modal').modal('show');
                this.formBuilderService.detectMajorChangeEvent.next({
                    changeType: 'NEW_COMPONENT' ,
                    changeObject: {component: this.prepareComponentinitialSaveObject(), currentlyActiveSection : this.currentlyActiveSection },
                });
                return;
            }
            this.$subscriptions.push(
                this.formBuilderService.createComponent(this.prepareComponentinitialSaveObject()).subscribe((data: ComponentData) => {
                    this.selectedComponent.componentData = data.componentData;
                    this.selectedComponent.componentDescription = data.componentDescription;
                    this.selectedComponent.componentFooter = data.componentFooter;
                    this.selectedComponent.componentHeader = data.componentHeader;
                    this.selectedComponent.componentId = data.componentId;
                    this.selectedComponent.componentOrder = data.componentOrder;
                    this.selectedComponent.componentRefId = data.componentRefId;
                    this.selectedComponent.componentType = data.componentType;
                    this.selectedComponent.sectionId = data.sectionId;
                    this.selectedComponent.label = data.label;
                    this.selectedComponent.isMandatory = data.isMandatory;
                    this.selectedComponent.validationMessage = data.validationMessage;
                    this.selectedComponent.componentTypeDescription = data.componentTypeDescription;
                    this.selectedComponent.captureDescription = data.captureDescription;
                    let selectedComponent;
                    selectedComponent = JSON.parse(JSON.stringify(this.selectedComponent));
                    this.additionalInformationInitialComponentSave.emit(selectedComponent);
                    this.isInitialSave = false;
                    this.customDataElement.acType = 'U';
                    this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Configurations saved successfully.');
                }, err => {
                    this.commonService.showToast(HTTP_ERROR_STATUS, 'Saving configurations failed. Please try again');
                })
            );
        }
    }

    prepareComponentinitialSaveObject(): CreateComponentObject {
        let formSectionId, orderNo;
        if (this.formBuilderService.isComponentOrderChange()) {
            formSectionId = this.formBuilderService.newComponentPosition.sectionId;
            orderNo = this.formBuilderService.newComponentPosition.orderNo;
        } else {
            formSectionId = this.formBuilderService.currentComponentPosition.sectionId;
            orderNo = this.formBuilderService.currentComponentPosition.orderNo;
        }
        const CREATE_COMPONENT_OBJECT = new CreateComponentObject();
        CREATE_COMPONENT_OBJECT.sectionId = formSectionId;
        CREATE_COMPONENT_OBJECT.formBuilderId = this.formBuilderId;
        CREATE_COMPONENT_OBJECT.componentType = this.selectedComponent.componentType;
        CREATE_COMPONENT_OBJECT.componentOrder = orderNo;
        CREATE_COMPONENT_OBJECT.componentData = this.selectedComponent.componentData;
        CREATE_COMPONENT_OBJECT.componentRefId = this.selectedComponent.componentRefId;
        CREATE_COMPONENT_OBJECT.description = '';
        CREATE_COMPONENT_OBJECT.componentFooter = this.selectedComponent.componentFooter;
        CREATE_COMPONENT_OBJECT.componentHeader = this.selectedComponent.componentHeader;
        CREATE_COMPONENT_OBJECT.isActive = 'Y';
        CREATE_COMPONENT_OBJECT.componentTypeDescription = this.selectedComponent.componentTypeDescription;
        CREATE_COMPONENT_OBJECT.label = this.selectedComponent.label;
        CREATE_COMPONENT_OBJECT.isMandatory = this.selectedComponent.isMandatory;
        CREATE_COMPONENT_OBJECT.validationMessage = this.selectedComponent.validationMessage;
        CREATE_COMPONENT_OBJECT.captureDescription = this.selectedComponent.captureDescription;
        return CREATE_COMPONENT_OBJECT;
    }

    selectedSectionEvent(): void {
        this.additionalInfoSectionEvent.subscribe((data: any) => {
            if (!Object.keys(data).length) {
                this.selectedSection.sectionId = null;
                return;
            }
            this.selectedSection.sectionHeader = data.sectionHeader;
            this.selectedSection.sectionFooter = data.sectionFooter;
            this.selectedSection.sectionId = data.sectionId;
            this.selectedSection.sectionName = data.sectionName;
            this.selectedSection.sectionOrder = data.sectionOrder;
            this.showSelectedSection = true;
            this.selectedComponent.componentType = '';
            setTimeout(() => {
                document.getElementById('FB-section-name').focus();
            }, 1000);
            this.loadSection();

        });
    }

    activateSelectedComponent(): void {
        switch (this.selectedComponent.componentType) {
            case 'PE':
                this.appAutoComplete = 'progElementName';
                this.getProgramElementList();
                break;
            case 'CE':
                this.appAutoComplete = 'customElementName';
                this.getCustomElementList();
                break;
            case 'QN':
                this.appAutoComplete = 'QUESTIONNAIRE_LABEL';
                this.getQuestionnaireList();
                break;
            default: console.log('No match');
        }
    }

    prepareComponentObject(): ComponentObjects {
        const PREPARE_COMPONENT_OBJECT = new ComponentObjects();
        PREPARE_COMPONENT_OBJECT.componentId = this.selectedComponent.componentId;
        PREPARE_COMPONENT_OBJECT.componentType = this.selectedComponent.componentType;
        PREPARE_COMPONENT_OBJECT.componentData = this.selectedComponent.componentData;
        PREPARE_COMPONENT_OBJECT.componentRefId = this.selectedComponent.componentRefId;
        PREPARE_COMPONENT_OBJECT.description = '';
        PREPARE_COMPONENT_OBJECT.componentHeader = this.selectedComponent.componentHeader;
        PREPARE_COMPONENT_OBJECT.componentFooter = this.selectedComponent.componentFooter;
        PREPARE_COMPONENT_OBJECT.isActive = 'Y';
        PREPARE_COMPONENT_OBJECT.label = this.selectedComponent.label;
        PREPARE_COMPONENT_OBJECT.isMandatory = this.selectedComponent.isMandatory;
        PREPARE_COMPONENT_OBJECT.validationMessage = this.selectedComponent.validationMessage;
        PREPARE_COMPONENT_OBJECT.captureDescription = this.selectedComponent.captureDescription;
        return PREPARE_COMPONENT_OBJECT;

    }

     async updateFormComponent(isSkipValidation = false): Promise<void> {
        if (isSkipValidation ||await this.isFormFieldValidation()) {
            if (this.formBuilderService.isFormPublished && this.isComponentMandatory ) {
                $('#FB-confirm-version-change-Modal').modal('show');
                this.formBuilderService.detectMajorChangeEvent.next({
                    changeType: 'NEW_COMPONENT' ,
                    changeObject: {component: this.prepareComponentObject(), currentlyActiveSection : this.currentlyActiveSection },
                });
                return;
            }
            this.$subscriptions.push(
                this.formBuilderService.updateComponent(this.prepareComponentObject()).subscribe((data: ComponentData) => {
                    data.isMandatory === 'N' ? this.isComponentMandatory = false : this.isComponentMandatory = true;
                    this.additionalInformationComponent
                        .emit({ componentData: this.prepareComponentObject(), sectionId: this.selectedComponent.sectionId });
                    this.formBuilderService.unSavedChange = false;
                    this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Configurations updated successfully.');
                }, err => {
                    this.commonService.showToast(HTTP_ERROR_STATUS, 'Updating configurations failed.');
                })
            );
        }
    }

    prepareSectionObject(): UpdateSectionObject {
        const SECTION_OBJECT = new UpdateSectionObject();
        SECTION_OBJECT.sectionId = this.selectedSection.sectionId;
        SECTION_OBJECT.sectionName = this.selectedSection.sectionName;
        SECTION_OBJECT.sectionOrder = this.selectedSection.sectionOrder;
        SECTION_OBJECT.sectionBusinessRule = null;
        SECTION_OBJECT.sectionDescription = '';
        SECTION_OBJECT.sectionHelpText = '';
        SECTION_OBJECT.sectionHeader = this.selectedSection.sectionHeader;
        SECTION_OBJECT.sectionFooter = this.selectedSection.sectionFooter;
        SECTION_OBJECT.isActive = 'Y';

        return SECTION_OBJECT;
    }

    updateForSection(): void {
        this.$subscriptions.push(
            this.formBuilderService.updateSection(this.prepareSectionObject()).subscribe((data: SectionUpdate) => {
                this.additionalInformation.emit(this.prepareSectionObject());
                this.formBuilderService.unSavedChange = false;
                this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Configurations updated successfully.');
            }, err => {
                this.commonService.showToast(HTTP_ERROR_STATUS, 'Updating configurations failed.');
            })
        );

    }

    refrenceId(event): void {
        this.formBuilderService.unSavedChange = true;
        if (!event) {
            this.selectedComponent.componentRefId = '';
            return;
        }
        switch (this.selectedComponent.componentType) {
            case 'PE':
                this.selectedComponent.componentRefId = event.progElementId;
                if (this.selectedComponent.label == null) {
                    this.selectedComponent.label = JSON.parse(JSON.stringify(event.progElementName));
                }
                break;
            case 'CE':
                this.selectedComponent.componentRefId = event.customElementId;
                if (this.selectedComponent.label == null) {
                    this.selectedComponent.label = JSON.parse(JSON.stringify(event.customElementName));
                }
                break;
            case 'QN':
                this.selectedComponent.componentRefId = event.ACTIVE_QUESTIONNAIRE_ID;
                // Intentional comment => if this value need to be changed directly
                // this.selectedComponent.label = event.QUESTIONNAIRE_LABEL
                if (this.selectedComponent.label == null) {
                    this.selectedComponent.label = JSON.parse(JSON.stringify(event.QUESTIONNAIRE_LABEL));
                }
                break;
            default: console.log('No match');
        }
    }

    setAutoCompleterOptions(): void {
        this.autoCompleterOption = {};
        this.autoCompleterOption.arrayList = this.elementList;
        this.autoCompleterOption.contextField = this.appAutoComplete;
        this.autoCompleterOption.formatString = this.appAutoComplete;
        this.autoCompleterOption.defaultValue = this.appAutoCompletedefaultValue;
        this.autoCompleterOption.filterFields = this.appAutoComplete;

    }

    getProgramElementList(): void {
        this.elementList = [];
        if (!this.programElementList.length) {
            this.$subscriptions.push(
                this.formBuilderService.getProgramElementList().subscribe((data: Array<ProgramElementList>) => {
                    this.programElementList = data;
                    this.elementList = this.programElementList;
                    this.setProgramElementField();
                }, error => {
                    this.commonService.showToast(HTTP_ERROR_STATUS, 'Fetching Programmed elements list failed.');
                })
            );
        } else {
            this.elementList = this.programElementList;
            this.setProgramElementField();
        }
    }

    setProgramElementField(): void {
        if (this.selectedComponent.componentRefId) {
            const DEFAULT_VALUE = this.elementList.filter(ele => ele.progElementId == this.selectedComponent.componentRefId);
            this.appAutoCompletedefaultValue = DEFAULT_VALUE[0].progElementName;
        } else {
            this.appAutoCompletedefaultValue = '';
        }
        this.setAutoCompleterOptions();
    }

    getQuestionnaireList(): void {
        this.elementList = [];
        if (!this.questionnaireElementList.length) {
            this.$subscriptions.push(
                this.formBuilderService.getQuestionnaireList().subscribe((data: GetQuestionnaire) => {
                    this.questionnaireElementList = data.questionnaireList?.filter(questionnaire => questionnaire.ACTIVE_QUESTIONNAIRE_ID);
                    this.elementList = this.questionnaireElementList;
                    this.setQuestionnaireElementField();
                }, error => {
                    this.commonService.showToast(HTTP_ERROR_STATUS, 'Fetching questionnaire list failed.');
                })
            );
        } else {
            this.elementList = this.questionnaireElementList;
            this.setQuestionnaireElementField();
        }
    }

    setQuestionnaireElementField(): void {
        if (this.selectedComponent.componentRefId) {
            const DEFAULT_VALUE = this.elementList.filter(ele => ele.ACTIVE_QUESTIONNAIRE_ID == this.selectedComponent.componentRefId);
            this.appAutoCompletedefaultValue = DEFAULT_VALUE[0].QUESTIONNAIRE_LABEL;
        } else {
            this.appAutoCompletedefaultValue = '';
        }
        this.setAutoCompleterOptions();
    }

    getCustomElementList(): void {
        this.elementList = [];
        if (!this.customElementList.length) {
            this.$subscriptions.push(
                this.formBuilderService.getCustomElementList().subscribe((data: GetCustomElement) => {
                    this.customElementList = data.customDataElements;
                    this.elementList = this.customElementList;
                    this.setCustomElementField();
                }, error => {
                    this.commonService.showToast(HTTP_ERROR_STATUS, 'Fetching custom elements list failed.');
                })
            );
        } else {
            this.elementList = this.customElementList;
            this.setCustomElementField();
        }
    }

    setCustomElementField(): void {
        if (this.selectedComponent.componentRefId) {
            const DEFAULT_VALUE = this.elementList.filter(ele => ele.customElementId == this.selectedComponent.componentRefId);
            this.appAutoCompletedefaultValue = DEFAULT_VALUE[0].customElementName;
        } else {
            this.appAutoCompletedefaultValue = '';
        }
        this.setAutoCompleterOptions();
    }

    loadComponent(): void {
        this.$subscriptions.push(
            this.formBuilderService.readComponent(this.selectedComponent.componentId).subscribe((data: ReadSectionComponent) => {
                this.selectedComponent.componentHeader = data.componentHeader;
                this.selectedComponent.componentFooter = data.componentFooter;
                this.selectedComponent.componentRefId = data.componentRefId;
                this.selectedComponent.componentType = data.componentType;
                this.selectedComponent.isMandatory = data.isMandatory;
                this.selectedComponent.captureDescription = data.captureDescription;
                this.selectedComponent.validationMessage = data.validationMessage;
                this.selectedComponent.label = data.label;
                this.selectedComponent.componentData = data.componentData;
                this.selectedComponent.sectionId = data.sectionId;
                if (['SE', 'NE', 'DE', 'CB', 'RB', 'ES', 'AS', 'SD', 'UD', 'TE', 'PT', 'CR', 'AT'].includes(this.selectedComponent.componentType)) {
                    this.fetchCustomData(this.selectedComponent.componentRefId);
                } else {
                    this.activateSelectedComponent();
                }
            }, error => {
                this.commonService.showToast(HTTP_ERROR_STATUS, 'Fetching component failed.');
            })
        );
    }

    loadSection(): void {
        this.$subscriptions.push(
            this.formBuilderService.readSection(this.selectedSection.sectionId).subscribe((data: NewSection) => {
                this.selectedSection.sectionHeader = data.sectionHeader;
                this.selectedSection.sectionFooter = data.sectionFooter;
            }, error => {
                this.commonService.showToast(HTTP_ERROR_STATUS, 'Fetching section failed.');
            })
        );
    }

    fetchCustomData(componentRefId: string): void {
        this.$subscriptions.push(
            this.formBuilderService.fetchCustomData({ 'customDataElementId': componentRefId }).subscribe((data) => {
                this.customDataElement.placeHolderText = data.customDataElement.placeHolderText;
                this.customDataElement.dataLength = data.customDataElement.dataLength;
                this.customDataElement.defaultValue = data.customDataElement.defaultValue;
                this.customDataElement.customElementId = data.customDataElement.customElementId;
                this.customDataElement.lookupArgument = data.customDataElement.lookupArgument;
                this.customDataTempOptions = data.elementOptions;
                this.customDataOptions = JSON.parse(JSON.stringify(this.customDataTempOptions));
                this.deletedCustomDataOptions = [];
                this.customDataElement.acType = 'U';
                this.selectedComponentData.componentTypeCode = data.customDataElement.customDataTypes.componentTypeCode;
                this.selectedComponentData.description = data.customDataElement.customDataTypes.description;
                this.selectedComponentData.updateTimestamp = data.customDataElement.customDataTypes.updateTimestamp;
                this.selectedComponentData.updateUser = data.customDataElement.customDataTypes.updateUser;
                this.loadCustomDataLookup();
                this.selectedCustomDataLookup();

            }, error => {
                this.commonService.showToast(HTTP_ERROR_STATUS, 'Fetching programmed elements list failed.');
            })
        );
    }

    public onReady(editor): void {
        editor.ui.getEditableElement().parentElement.insertBefore(
            editor.ui.view.toolbar.element,
            editor.ui.getEditableElement()
        );
    }

    addCustomDataOptions(): void {
        this.customDataOptions.push({
            'optionName': '',
            'customDataElementsId': this.customDataElement.customElementId || '',
            'updateUser': this.commonService.getCurrentUserDetail('userName'),
            'updateTimestamp': new Date().getTime()
        });
    }

    deleteOptions(index: number): void {
        if (this.customDataOptions.length !== 1) {
            if (this.customDataElement.acType == 'U') {
                this.deletedCustomDataOptions = this.customDataOptions.splice(index, 1);
            } else {
                this.customDataOptions.splice(index, 1);
            }
        }
    }

    loadCustomDataLookup(): void {
        if (['AS', 'ES', 'SD', 'UD'].includes(this.selectedComponent.componentType)) {
            this.$subscriptions.push(
                this.formBuilderService.getSystemLookupByCustomType({ dataTypeCode: this.selectedComponent.componentType })
                    .subscribe((data) => {
                        this.customDatalookUpArray = data.lookUps;
                    }, error => {
                        this.commonService.showToast(HTTP_ERROR_STATUS, 'Loading custom data lookup failed.');
                    })
            );

        }
    }

    selectedCustomDataLookup(): void {
        this.customDataDefaultValueArray = [];
        switch (this.customDataElement.lookupArgument) {
            case 'fibiperson': this.customDataDefaultValueArray = Constants.person; break;
            case 'sponsorName': this.customDataDefaultValueArray = Constants.sponsor; break;
            case 'fibiproposal': this.customDataDefaultValueArray = Constants.proposal; break;
            case 'awardfibi': this.customDataDefaultValueArray = Constants.award; break;
            case 'instituteproposal': this.customDataDefaultValueArray = Constants.instituteproposal; break;
            case 'grantcall_elastic': this.customDataDefaultValueArray = Constants.grantcallElastic; break;
            case 'unitName': this.customDataDefaultValueArray = Constants.leadUnit; break;
            case 'fibiDepartment': this.customDataDefaultValueArray = Constants.department; break;
            case 'fibiOrganization': this.customDataDefaultValueArray = Constants.organization; break;
            case 'fibiCountry': this.customDataDefaultValueArray = Constants.country; break;
            case 'profitCenterName': this.customDataDefaultValueArray = Constants.profitCenter; break;
            case 'grantCodeName': this.customDataDefaultValueArray = Constants.grantCodeName; break;
            case 'costCenterName': this.customDataDefaultValueArray = Constants.costCenter; break;
            case 'fundCenterName': this.customDataDefaultValueArray = Constants.fundCenter; break;
            case 'claimTemplateName': this.customDataDefaultValueArray = Constants.claimTemplate; break;
            default: console.log('No match');
        }

    }

    setCustomDataTypes(): void {
        this.customDataElement.columnLabel = this.selectedComponent.label;
        this.customDataElement.customDataTypes = {
            componentTypeCode: this.selectedComponentData.componentTypeCode,
            description: this.selectedComponentData.description,
            updateTimestamp: this.selectedComponentData.updateTimestamp,
            updateUser: this.selectedComponentData.updateUser,
            isActive: 'Y'
        };
        this.customDataElement.updateTimestamp = new Date().getTime();
        this.customDataElement.updateUser = this.commonService.getCurrentUserDetail('fullName');
        this.customDataElement.isActive = 'Y';
        this.customDataElement.lookupWindow = '';
        this.customDataElement.customElementName = this.selectedComponent.label;
        this.customDataElement.dataLength = this.customDataElement.dataLength || '';
        this.customDataElement.defaultValue = this.customDataElement.defaultValue || '';
        this.customDataElement.lookupArgument = this.customDataElement.lookupArgument || '';
        this.customDataElement.dataType = this.selectedComponentData.componentTypeCode;
        if (['SD', 'UD'].includes(this.selectedComponent.componentType)) {this.customDataElement.hasLookup = 'Y'; }
    }

     async saveCustomData(): Promise<void> {
        if (await this.isFormFieldValidation()) {
            this.setCustomDataTypes();
            const CUSTOM_DATA_ELEMENT = {
                customDataElement: this.customDataElement,
                elementOptions: this.customDataOptions,
                deleteOptions: this.deletedCustomDataOptions
            };
            this.$subscriptions.push(
                this.formBuilderService.configureCustomElement(CUSTOM_DATA_ELEMENT).subscribe((data: ConfigureCustomElementData) => {
                    this.selectedComponent.componentRefId = data.customDataElement.customElementId;
                    if (this.customDataElement.acType == 'I') { this.componentInitialSave(); } else { this.updateFormComponent(); }
                }, err => {
                     this.commonService.showToast(HTTP_ERROR_STATUS, `${this.customDataElement.acType == 'I' ? 'Saving configurations failed.' : 'Updating Configurations failed.'}`);
                })
            );
        }
    }

    saveForComponents(): void {
        if (!['SE', 'NE', 'DE', 'CB', 'RB', 'ES', 'AS', 'SD', 'UD', 'TE', 'PT', 'CR', 'AT'].includes(this.selectedComponent.componentType)) {
            this.componentInitialSave();
        } else {
            this.saveCustomData();
        }
    }

    updateForComponents(): void {
        if (!['SE', 'NE', 'DE', 'CB', 'RB', 'ES', 'AS', 'SD', 'UD', 'TE', 'PT', 'CR', 'AT'].includes(this.selectedComponent.componentType)) {
            this.updateFormComponent();
        } else {
            this.saveCustomData();
        }
    }

     async isFormFieldValidation(): Promise<boolean> {
        this.formValidation.clear();
        if (['PE', 'QN'].includes(this.selectedComponent.componentType) && !this.selectedComponent.componentRefId) {
            this.formValidation.set('componentRefIDValidation', true);
        } else if (this.selectedComponent.componentType === 'QN' && this.selectedComponent.isMandatory === 'N') {
            const HAS_MANDATORY_QUESTIONS = await this.questionnaireMandatoryCheck(this.selectedComponent.componentRefId);
            if (HAS_MANDATORY_QUESTIONS) {
                this.formValidation.set('questionnaireValidationWaring', true);
            }
;        }
        if (['RB', 'CB'].includes(this.selectedComponent.componentType)) {
            const EMPTY_OPTIONS = this.customDataOptions.find(x => x.optionName == '');
            if (EMPTY_OPTIONS) {
                this.formValidation.set('Optionvalidation', true);
            }
        }
        if (['NE', 'SE','CR'].includes(this.selectedComponent.componentType) && !this.customDataElement.dataLength) {
            this.formValidation.set('dataLengthValidation', true);
        }
        if (['AS', 'UD', 'ES', 'SD'].includes(this.selectedComponent.componentType) && !this.customDataElement.lookupArgument) {
            this.formValidation.set('lookupArgumentValidation', true);
        }
        if (this.selectedComponent.isMandatory === 'Y' && !this.selectedComponent.validationMessage) {
            this.formValidation.set('mandatoryMessageValidation', true);
        }
        if (this.customDataElement?.dataLength > 100) {
            this.formValidation.set('dataLengthOverLimitValidation', true);
        }
        if(['RT'].includes(this.selectedComponent.componentType) && !this.selectedComponent.componentData) {
            this.formValidation.set('elementValidation', true);
        }
        if(['CR'].includes(this.selectedComponent.componentType) && !this.customDataElement.defaultValue) {
            this.formValidation.set('currencyValidation', true);
        }
        if (this.formValidation.size === 1 && this.formValidation.has('questionnaireValidationWaring')) {
            document.getElementById('form-builder-questionnaire-modal-trigger-btn').click();
        }
        return this.formValidation.size <= 0;
    }

    private questionnaireMandatoryCheck(questionnaireId: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.$subscriptions.push(
                this.formBuilderService.getQuestionnaireById(questionnaireId).subscribe(
                    (questionnaire) => {
                        resolve(questionnaire?.questionnaire?.questions?.some(q => q.IS_MANDATORY === 'Y' && q.SHOW_QUESTION) || false);
                    },
                    (err) => {
                        resolve(false);
                    }
                )
            );
        });
    }

    numberValidation(event: any): void {
        const INPUT_PATTERN = /^[0-9]+$/;
        const PASTED_TEXT = event.clipboardData ? (event.clipboardData).getData('text') : null;
        const INPUT_STRING = PASTED_TEXT ? PASTED_TEXT : String.fromCharCode(event.charCode);
        if (!INPUT_PATTERN.test(INPUT_STRING)) {
            event.preventDefault();
        }
    }

    getElementText(element: string): string {
        switch (element) {
            case 'HL':
                return 'Horizontal Line';
            case 'BR':
                return 'Context Break';
            case 'RT':
                return 'Rich Textbox';
            case 'QN':
                return 'Questionnaire';
            case 'PE':
                return 'Programmed Element';
            case 'CB':
                return 'Check Box';
            case 'DE':
                return 'Date';
            case 'NE':
                return 'Number';
            case 'RB':
                return 'Radio Button';
            case 'SE':
                return 'String';
            case 'TE':
                return 'Text';
            case 'SD':
                return 'System Dropdown';
            case 'UD':
                return 'User Dropdown';
            case 'PT':
                return 'Paragraph - Text Editor';
            case 'CR':
                return 'Currency';
            case 'AT':
                return 'Attachment';
            default:
                return 'Section';
        }
    }

    applyStyleForComponentEvents(): void {
        this.$subscriptions.push(
          this.additionInfoComponentEvent.subscribe((event) => {
              this.editorEvent = event;
              const FB_ADDITIONAL_INFO_MODAL = document.getElementById(FB_ADDITIONAL_INFO_MODAL_ID);
              const FB_ADDITIONAL_INFO = document.getElementById(FB_ADDITIONAL_INFO_ID);
              const FB_EDITOR_INFO = document.getElementById(FB_FORM_EDITOR_ID);
            // Check if the event is empty or if its componentType is 'BR' or 'HL'
              const isEventEmptyOrSpecialComponent = !Object.keys(event).length || ['BR', 'HL'].includes(event.item.componentType);
              if (isEventEmptyOrSpecialComponent) {
                  this.editorEvent = {}; // Reset editorEvent if conditions match
                  FB_ADDITIONAL_INFO.classList.add('fb_Additional_Info');
                  FB_EDITOR_INFO.classList.add('FB-Form-Editable');
              } else {
                  FB_ADDITIONAL_INFO.classList.remove('fb_Additional_Info');
                  FB_EDITOR_INFO.classList.remove('FB-Form-Editable');
              }
            // Handle modal visibility and screen width conditions
              if (this.screenWidth < 1280 && Object.keys(this.editorEvent).length) {
                  this.styleForLargeScreens(FB_ADDITIONAL_INFO, FB_ADDITIONAL_INFO_MODAL, FB_EDITOR_INFO);
              }
          })
        );
    }

    styleForLargeScreens(additionalInfo, additionalInfoModal, editorInfo ): void {
        $('#FB-additional-info-modal').modal('show');
        additionalInfo.classList.add('fb_Additional_Info');
        additionalInfoModal.classList.add('fb-width');
        editorInfo.classList.add('FB-Form-Editable');
    }

    applyStyleForSectionEvents(): void {
        this.$subscriptions.push(
            this.additionalInfoSectionEvent.subscribe((event) => {
                this.editorEvent = event;
                const FB_ADDITIONAL_INFO = document.getElementById(FB_ADDITIONAL_INFO_ID);
                const FB_EDITOR_INFO = document.getElementById(FB_FORM_EDITOR_ID);
                const isEventEmpty = !Object.keys(event).length; // Check if the event object is empty
                const FB_ADDITIONAL_INFO_MODAL = document.getElementById(FB_ADDITIONAL_INFO_MODAL_ID);
                if (isEventEmpty) {
                    FB_ADDITIONAL_INFO.classList.add('fb_Additional_Info');
                    FB_EDITOR_INFO.classList.add('FB-Form-Editable');
                } else {
                    FB_ADDITIONAL_INFO.classList.remove('fb_Additional_Info');
                    FB_EDITOR_INFO.classList.remove('FB-Form-Editable');
                }
                // Handle modal visibility and screen width conditions
                if (this.screenWidth < 1280 && Object.keys(this.editorEvent).length) {
                    this.styleForLargeScreens(FB_ADDITIONAL_INFO, FB_ADDITIONAL_INFO_MODAL, FB_EDITOR_INFO);
                }
            })
        );
    }

    closeModalAdditionInfoModal(): void {
        $('#FB-additional-info-modal').modal('hide');
        this.formBuilderService.clearAdditionalInformation.next(true);
    }

    setFocusToValidationMessage(): void {
        const TIMER = setTimeout(() => {
            const VALIDATION_FIELD = document.getElementById(FB_VALIDATION_MESSAGE_ID);
            const ADDITIONAL_INFO_CONTAINER = document.getElementById(FB_ADDITIONAL_INFO_ID);
            VALIDATION_FIELD?.focus();
            ADDITIONAL_INFO_CONTAINER?.scroll({ top: VALIDATION_FIELD?.offsetTop - ADDITIONAL_INFO_CONTAINER?.offsetTop, behavior: 'smooth' });
            clearTimeout(TIMER);
        }, 100);
    }

    setDefaultValueLength(): void {
        if (!this.customDataElement?.dataLength || this.customDataElement?.defaultValue?.length > this.customDataElement?.dataLength) {
            this.customDataElement.defaultValue = this.customDataElement?.defaultValue.slice(0, this.customDataElement?.dataLength || 0);
        }
    }

    lengthValidation(limit): void {
        if ((this.customDataElement?.dataLength) > limit) {
            this.formValidation.set('dataLengthOverLimitValidation', true);
        } else {
            this.formValidation.delete('dataLengthOverLimitValidation');
        }
    }

    toggleCaptureDescription(): void {
        this.selectedComponent.captureDescription =
            this.selectedComponent.captureDescription === 'Y' ? 'N' : 'Y';
    }

    configWithoutMandatory(): void {
        this.isInitialSave ? this.componentInitialSave(true) : this.updateFormComponent(true);
    }

    proceedConfigurationAction(): void {
        this.selectedComponent.isMandatory = 'Y'
        this.formValidation.set('mandatoryMessageValidation', true);
        this.setFocusToValidationMessage();
    }

    mandatoryToggle(): void {
        this.selectedComponent.isMandatory = 'N';
        this.selectedComponent.validationMessage = '';
    }

}
