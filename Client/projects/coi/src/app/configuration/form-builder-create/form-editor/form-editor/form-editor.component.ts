import {Component, OnInit, Output, EventEmitter, OnDestroy, HostListener, ElementRef, ViewChild, AfterViewInit} from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Form, FormSection, SectionComponent } from '../../shared/form-builder-view/form-builder-interface';
import { FormBuilderCreateService } from '../../form-builder-create.service';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { deepCloneObject, scrollIntoView } from '../../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { NewSection, ComponentData, ElementTree, CreateComponentObject, FormSectionObject } from '../../form-builder-create-interface';
import {HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS} from '../../../../app-constants';
import { CommonService } from '../../../../common/services/common.service';
import {environment} from '../../../../../environments/environment';
import {FB_ADDITIONAL_INFO_ID, FB_ADDITIONAL_INFO_MODAL_ID, FB_FORM_EDITOR_ID} from '../../form-builder-constants';
import { Currency } from '../../../../common/services/coi-common.interface';

declare const $: any;
@Component({
    selector: 'app-form-editor',
    templateUrl: './form-editor.component.html',
    styleUrls: ['./form-editor.component.scss']
})
export class FormEditorComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;
    scrollTimeOut: any;
    scrollToTop: boolean;
    private scrollSpeed = 10;
    private threshold = 50;
    showScrollButton = false;
    floatingButtonElement: HTMLElement;
    formEditorActionsElement: HTMLElement;
    @HostListener('window:scroll', ['$event'])
    onWindowScroll(event): void {
        if (!this.floatingButtonElement) {
            this.floatingButtonElement = document.querySelector('.floating-btn');
        }
        if (event && this.floatingButtonElement) {
            this.floatingButtonElement.classList.add('fb-opacity');
        }
        if (this.scrollTimeOut) {
            clearTimeout(this.scrollTimeOut);
        }

        this.scrollTimeOut = setTimeout(() => {
            this.onScrollEnd();
        }, 100);
    }
    @Output() additionalInformation: EventEmitter<any> = new EventEmitter();
    lookUpTree: Array<ElementTree> = [];
    form = new Form();
    formSection = new FormSection();
    sectionComponent = new SectionComponent();
    formBuilderId: string;
    sectionArray: Array<FormSection> = [];
    additionInfoComponentEvent: Subject<any> = new Subject<any>();
    additionalInfoSectionEvent: Subject<any> = new Subject<any>();
    formSectionOrderNo = 1;
    sectionSortArray: Array<FormSection>;
    lookupSectionComponentType: Array<ElementTree> = [];
    currentlyActiveComponentId: number;
    deleteIndex: number;
    deleteObject: FormSection;
    sectionDelete = false;
    $subscriptions: Subscription[] = [];
    scrollInterval: any = null;
    deployMap = environment.deployUrl;
    formTreeIconMap = new Map();
    FB_ADDITIONAL_INFO_ID = FB_ADDITIONAL_INFO_ID;
    FB_FORM_EDITOR_ID = FB_FORM_EDITOR_ID;
    FB_ADDITIONAL_INFO_MODAL_ID = FB_ADDITIONAL_INFO_MODAL_ID;


    constructor(
        public formBuilderService: FormBuilderCreateService,
        private _route: ActivatedRoute,
        private _commonService: CommonService) { }

    ngOnInit() {
        this.formBuilderService.currentTab = '1';
        this.clearAdditionalInformation();
        this.$subscriptions.push(
        this._route.queryParamMap.subscribe(queryParams => {
            this.formBuilderId = queryParams.get('formBuilderId');
            if (this.formBuilderId) {
                this.initialFormLoad(this.formBuilderId);
                this.setFormTreeIcons();
            }
        }));
        this.getCurrencyLookup();
    }

    ngAfterViewInit() {
        this.initializeSectionStyles();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    onScrollEnd() {
        if (!this.formEditorActionsElement) {
            this.formEditorActionsElement = document.querySelector('.fb-form-editor-actions-btn');
        }
        if (this.formEditorActionsElement) {
            if (window.scrollY > 250) {
                this.scrollToTop = true;
                this.formEditorActionsElement.classList.add('floating-Btn-width');
            } else {
                this.scrollToTop = false;
                this.formEditorActionsElement.classList.remove('floating-Btn-width');
            }
        }
        if (this.floatingButtonElement) {
            this.floatingButtonElement.classList.remove('fb-opacity');
        }
    }

    drop(event: CdkDragDrop<string[]>): void {
        this.stopScrolling();
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex);
        }
        this.setComponent(event);
        this.lookUpTree = deepCloneObject(this.lookupSectionComponentType);
        this.setFocusOnActiveComponent();
    }

    setFocusOnActiveComponent() {
        setTimeout(() => {
            if (this.currentlyActiveComponentId) {
                this.componentBorder(this.currentlyActiveComponentId);
            }
        }, 1000);
    }

    // Emit component related data to Additional information Component
    emitComponentData(item, sectionComponent): void {
        this.currentlyActiveComponentId = item.componentId || item.tempId;
        this.componentBorder(this.currentlyActiveComponentId);
        this.additionInfoComponentEvent.next({item, sectionComponent});
    }

    createNewSection(): void {
        if (this.formBuilderService.isFormPublished) {
            $('#FB-confirm-version-change-Modal').modal('show');
            this.formBuilderService.detectMajorChangeEvent.next({
                changeType: 'NEW_SECTION' ,
                changeObject: this.createNewSectionObject()
            });
            return;
        }
        this.$subscriptions.push(
            this.formBuilderService.createFormSection(this.createNewSectionObject()).subscribe((data: NewSection) => {
                this.formSection.sectionId = data.sectionId;
                this.formSection.sectionName = data.sectionName;
                this.formSection.sectionDescription = data.sectionDescription;
                this.formSection.sectionHeader = data.sectionHeader;
                this.formSection.sectionFooter = data.sectionFooter;
                this.formSection.sectionHelpText = data.sectionHelpText;
                this.formSection.sectionBusinessRule = data.sectionBusinessRule;
                this.formSection.sectionOrder = data.sectionOrder;
                this.formSection.sectionComponent = [];
                const FORM_SECTION = deepCloneObject(this.formSection);
                this.sectionArray.push(FORM_SECTION);
                this.formBuilderService.formEditorState = deepCloneObject(this.sectionArray);
                this.scrollToNewSection();
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Section added successfully');
            }, error => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Adding section failed.Please try again');
            })
        );
    }

    scrollToNewSection() {
        setTimeout(() => {
            scrollIntoView(String(this.formSection.sectionId));
        }, 1000);
    }

    initialFormLoad(formBuilderId: string): void {
        this.$subscriptions.push(
            this.formBuilderService.getFormDeatails(formBuilderId).subscribe((data: any) => {
                this.formBuilderService.cacheGetForm = deepCloneObject(data);
                this.lookupSectionComponentType = data.lookupSectionComponentType;
                this.lookUpTree = deepCloneObject(this.lookupSectionComponentType);
                this.sectionArray = data.formHeader.sections;
                this.formBuilderService.formEditorState = deepCloneObject(this.sectionArray);
                if (!this.sectionArray.length) {
                    this.createNewSection();
                }
            }, error => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching form failed.');
            })
        );
    }

    createNewSectionObject(): FormSectionObject {
        if (this.sectionArray.length) {
            this.formSectionOrderNo = this.sectionArray[this.sectionArray.length - 1].sectionOrder + 1;
        }
        const FORM_SECTION_OBJECT = new FormSectionObject();
        FORM_SECTION_OBJECT.formBuilderId = this.formBuilderId;
        FORM_SECTION_OBJECT.sectionName = '';
        FORM_SECTION_OBJECT.sectionOrder = this.formSectionOrderNo;
        FORM_SECTION_OBJECT.sectionBusinessRule = null;
        FORM_SECTION_OBJECT.sectionDescription = '';
        FORM_SECTION_OBJECT.sectionHelpText = 'Help Text 1';
        FORM_SECTION_OBJECT.sectionHeader = '';
        FORM_SECTION_OBJECT.sectionFooter = '';
        FORM_SECTION_OBJECT.isActive = 'Y';
        return FORM_SECTION_OBJECT;
    }

    // This function sets requied values for adding a component from the event of drop function provide by the Angular Drag & Drop cdk.
    setComponent(event): void {
        const FORM_SECTION_ID = event.container.id;
        // CONTAINER is an array that  receives the dragged component
        const CONTAINER = event.container.data;
        // index of array at which component was droped.
        const CONTAINER_INDEX = event.currentIndex;
        const PREVIOUS_CONTAINER = event.previousContainer;
        // DROP_CONTAINER is the Section that  receives the dragged component
        const DROP_CONTAINER = this.sectionArray.find(obj => obj['sectionId'] == FORM_SECTION_ID);
        this.createcomponent(FORM_SECTION_ID, CONTAINER_INDEX, CONTAINER, DROP_CONTAINER, PREVIOUS_CONTAINER);

    }

    createcomponent(formSectionId: string, containerindex: number, container, dropContainer, previousContainer): void {
        if (previousContainer.id.includes('cdk-drop-list-')) {
            //  if condition is satisfied for an element dragged from form-element tree,
            //  and not satisfied for interdragged components ie, components dragged b/w sections or  with in the section.
            if (['BR', 'HL'].includes(container[containerindex].componentTypeCode)) {
                this.onDropSaveForNonConfigurableComponents(formSectionId, containerindex, container, dropContainer);
                return;
            }
            let sectionComponent;
            const UNIQUE_ID = 'tempId_' + this.getTimeStamp();
            sectionComponent = dropContainer.sectionComponent[containerindex];
            sectionComponent.tempId = UNIQUE_ID;
            sectionComponent.sectionId = dropContainer.sectionId;
            this.getTempOrderNumberForComponents(dropContainer.sectionComponent);
            sectionComponent.formBuilderId = this.formBuilderId;
            this.formBuilderService.formEditorState = deepCloneObject(this.sectionArray);
        } else {
            let sectionComponent;
            sectionComponent = dropContainer.sectionComponent[containerindex];
            sectionComponent.sectionId = dropContainer.sectionId;
            this.getTempOrderNumberForComponents(dropContainer.sectionComponent);
            this.formBuilderService.formEditorState = deepCloneObject(this.sectionArray);
            this.updatePositionOfAllComponentsInSection(container, dropContainer);

        }
    }

    onDropSaveForNonConfigurableComponents(formSectionId: string, containerindex: number, container, dropContainer): void {
        this.$subscriptions.push(
            this.formBuilderService.createComponent(this.prepareComponentObject(formSectionId, containerindex, container))
                .subscribe((data: ComponentData) => {
                    this.sectionComponent.componentDescription = data.componentDescription;
                    this.sectionComponent.componentId = data.componentId;
                    this.sectionComponent.componentOrder = data.componentOrder;
                    this.sectionComponent.componentType = data.componentType;
                    this.sectionComponent.sectionId = data.sectionId;
                    this.sectionComponent.label = data.label;
                    this.sectionComponent.componentTypeDescription = data.componentTypeDescription;
                    const SECTION_COMPONENT = deepCloneObject(this.sectionComponent);
                    dropContainer.sectionComponent[containerindex] = SECTION_COMPONENT;
                    this.updatePositionOfAllComponentsInSection(container, dropContainer);
                    this.formBuilderService.formEditorState = deepCloneObject(this.sectionArray);
                }, error => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Adding element failed.Please try again');
                })
        );
    }

    prepareComponentObject(formSectionId: string, containerindex: number, container, componentRefId = ''): CreateComponentObject {
        let label = '';
        if (container[containerindex].componentTypeCode === 'BR') {
            label = 'Context Break';
        } else {
            label = 'Horizontal Line';
        }
        const CREATE_COMPONENT_OBJECT = new CreateComponentObject();
        CREATE_COMPONENT_OBJECT.sectionId = formSectionId;
        CREATE_COMPONENT_OBJECT.formBuilderId = this.formBuilderId;
        CREATE_COMPONENT_OBJECT.componentType = container[containerindex].componentTypeCode;
        CREATE_COMPONENT_OBJECT.componentOrder = containerindex;
        CREATE_COMPONENT_OBJECT.componentData = '';
        CREATE_COMPONENT_OBJECT.componentRefId = componentRefId;
        CREATE_COMPONENT_OBJECT.description = 'test';
        CREATE_COMPONENT_OBJECT.componentFooter = '';
        CREATE_COMPONENT_OBJECT.componentHeader = '';
        CREATE_COMPONENT_OBJECT.isActive = 'Y';
        CREATE_COMPONENT_OBJECT.componentTypeDescription = container[containerindex].description;
        CREATE_COMPONENT_OBJECT.label = label;
        return CREATE_COMPONENT_OBJECT;
    }

    updatePositionOfAllComponentsInSection(container, dropContainer): void {
        this._commonService.isPreventDefaultLoader = true;
        const COMPONENTS = container.filter(ele => ele.componentId);
        COMPONENTS.forEach((element, index) => {
            this.$subscriptions.push(
                this.formBuilderService.componentOrder([{
                    'componentId': element.componentId,
                    'sectionId': dropContainer.sectionId,
                    'componentOrder': index
                }]).subscribe((data) => {
                    this._commonService.isPreventDefaultLoader = false;
                }, error => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating component order failed.');
                    this._commonService.isPreventDefaultLoader = false;
                })
            );
        });
    }

    confirmComponentDelete(index: number, deleteObject: FormSection, event): void {
        if (this.formBuilderService.isFormPublished && deleteObject.sectionComponent[index]?.componentId && !['HL','BR'].includes(deleteObject.sectionComponent[index].componentType)) {
            $('#FB-confirm-version-change-Modal').modal('show');
            this.formBuilderService.detectMajorChangeEvent.next({
                changeType: 'COMPONENT_DELETE' ,
                changeObject: {componentId: deleteObject.sectionComponent[index]?.componentId, sectionId : deleteObject.sectionComponent[index]?.sectionId }
            });
            return;
        }
        event.stopPropagation();
        this.sectionDelete = false;
        $('#FB-delete-Confirmation-Modal').modal('show');
        this.deleteIndex = index;
        this.deleteObject = deleteObject;
    }

    deleteComponent(): void {
        const INDEX_TO_BE_DELETED = this.deleteObject.sectionComponent[this.deleteIndex].componentId;
        if (!INDEX_TO_BE_DELETED) {
            this.deleteObject.sectionComponent.splice(this.deleteIndex, 1);
            this.formBuilderService.formEditorState = deepCloneObject(this.sectionArray);
            this.additionInfoComponentEvent.next({});
        } else {
            this.$subscriptions.push(
                this.formBuilderService.deleteComponent(INDEX_TO_BE_DELETED).subscribe((data) => {
                    this.deleteObject.sectionComponent.splice(this.deleteIndex, 1);
                    this.formBuilderService.formEditorState = deepCloneObject(this.sectionArray);
                    this.additionInfoComponentEvent.next({});
                }, error => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting components failed.Please try again');
                })
            );
        }
    }

    sectionSort(): void {
        if (this.sectionArray?.length <= 1) {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Need atleast two sections to rearrange.');
            return;
        }
        $('#FB-rearrange-section-modal').modal('show');
        setTimeout(() => {
            const BACK_DROP = document.querySelector('.modal-backdrop');
            BACK_DROP.classList.remove('modal-backdrop');
            BACK_DROP.classList.add('fb-modal-backdrop');

        }, 50);
        this.sectionSortArray = deepCloneObject(this.sectionArray);
    }

    dropForSort(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.sectionSortArray, event.previousIndex, event.currentIndex);
    }

    sectionSortService(): void {
        this.sectionSortArray.forEach((element, index) => {
            this.$subscriptions.push(
                this.formBuilderService.sectionOrder([{
                    'sectionId': element.sectionId,
                    'formBuilderId': this.formBuilderId,
                    'sectionOrder': index + 1,
                }]).subscribe((data: Array<FormSection>) => {
                    this.sectionArray = this.sectionSortArray;
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Sections rearranged successfully.');
                }, error => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Rearranging sections failed.Please try again');
                })
            );
        });
    }

    cancelSectionSort(): void {
        this.sectionSortArray = [];
    }


    emitSectionData(event): void {
        this.sectionBorder(event.sectionId);
        this.additionalInfoSectionEvent.next(event);
    }

    sectionUpdate(event): void {
        let selectedSection: any;
        selectedSection = this.sectionArray.filter(ele => ele.sectionId === event.sectionId);
        selectedSection[0].sectionName = event.sectionName;
    }

    componentUpdate(event): void {
        let selectedComponent: any;
        for (const element of this.sectionArray) {
            selectedComponent = element.sectionComponent.find(ele => ele.componentId === event.componentData.componentId);
            if (selectedComponent) {
                selectedComponent.label = event.componentData.label;
                selectedComponent.isMandatory = event.componentData.isMandatory;
                selectedComponent.validationMessage = event.componentData.validationMessage;
                selectedComponent.componentData = event.componentData.componentData;
                return;
            }
        }
    }

    deleteSectionConfirmation(deleteObject: FormSection, sectionArrayIndex: number): void {
        if (this.formBuilderService.isFormPublished) {
            $('#FB-confirm-version-change-Modal').modal('show');
            this.formBuilderService.detectMajorChangeEvent.next({
                changeType: 'SECTION_DELETE' ,
                changeObject: {sectionArrayIndex: sectionArrayIndex}
            });
            return;
        }
        this.sectionDelete = true;
        $('#FB-delete-Confirmation-Modal').modal('show');
        this.deleteObject = deleteObject;
        this.deleteIndex = sectionArrayIndex;
    }

    deleteSection(): void {
        this.sectionBorder(this.deleteObject.sectionId);
        this.$subscriptions.push(
            this.formBuilderService.deleteSection(this.deleteObject.sectionId).subscribe((data) => {
                this.sectionArray.splice(this.deleteIndex, 1);
                this.formBuilderService.formEditorState = deepCloneObject(this.sectionArray);
                this.additionalInfoSectionEvent.next({});
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Section deleted successfully');
            })
        );
    }

    sectionBorder(selectionId: number): void {
        if (document.getElementsByClassName('border-for-section-selection')[0]) {
            document.getElementsByClassName('border-for-section-selection')[0].classList.remove('border-for-section-selection');
        }
        if (document.getElementsByClassName('clicked')[0]) {
            document.getElementsByClassName('clicked')[0].classList.remove('clicked');
        }
        const BACKGROUND_COLOR = document.getElementById(`FB-section-card-${selectionId}`).classList.add('border-for-section-selection');
    }

    componentBorder(componentId: number): void {
        if (document.getElementsByClassName('clicked')[0]) {
            document.getElementsByClassName('clicked')[0]?.classList.remove('clicked');
        }
        if (document.getElementsByClassName('border-for-section-selection')[0]) {
            document.getElementsByClassName('border-for-section-selection')[0]?.classList.remove('border-for-section-selection');
        }
        const BACKGROUND_COLOR = document.getElementById(`FB-field-box-${componentId}`).classList.add('clicked');
    }

    getTimeStamp(): number {
        return new Date().getTime();
    }

    getTempOrderNumberForComponents(sectionComponent): void {
        sectionComponent.forEach((component, index) => {
            component.componentOrderNumber = index;
        });
    }

    initialComponentSave(event): void {
        let selectedComponent;
        for (let ele of this.sectionArray) {
            selectedComponent = ele.sectionComponent.find(ele => ele.tempId === this.formBuilderService.currentComponentPosition.tempId);
            if (selectedComponent) {
                delete selectedComponent.tempId;
                this.currentlyActiveComponentId = event.componentId;
                selectedComponent.componentId = event.componentId;
                selectedComponent.label = event.label;
                const SELECTED_SECTION = this.sectionArray.find(ele => ele.sectionId === event.sectionId);
                this.updatePositionOfAllComponentsInSection(SELECTED_SECTION.sectionComponent, SELECTED_SECTION);
                this.formBuilderService.formEditorState = deepCloneObject(this.sectionArray);
                return;
            }
        }
    }

    scrollUp():void {
        scrollIntoView(String(this.sectionArray[0].sectionId));
    }

    closeBtn(id: string) {
        $(id).modal('hide');

    }

    clearAdditionalInformation() {
        this.$subscriptions.push(
            this.formBuilderService.clearAdditionalInformation.subscribe((data) => {
                this.additionalInfoSectionEvent.next({});
                this.additionInfoComponentEvent.next({});
                document.getElementsByClassName('clicked')[0]?.classList.remove('clicked');
            })
        );
    }

    onDragMoved(event: any) {
        if (!this.scrollContainer) return;

        const scrollEl = this.scrollContainer.nativeElement;
        const { y } = event.pointerPosition;
        const { top, bottom } = scrollEl.getBoundingClientRect();

        if (y < top + this.threshold) {
            this.startScrolling(-this.scrollSpeed); // Scroll up
        } else if (y > bottom - this.threshold) {
            this.startScrolling(this.scrollSpeed); // Scroll down
        } else {
            this.stopScrolling();
        }
    }

    startScrolling(speed: number) {
        if (!this.scrollInterval) {
            this.scrollInterval = setInterval(() => {
                this.scrollContainer.nativeElement.scrollBy({ top: speed, behavior: 'instant' });
            }, 100);
        }
    }

    stopScrolling() {
        if (this.scrollInterval) {
            clearInterval(this.scrollInterval);
            this.scrollInterval = null;
        }
    }

    setFormTreeIcons() {
        this.formTreeIconMap.set('HL', 'FB-diagonal-line.svg');
        this.formTreeIconMap.set('BR', 'FB-enter.svg');
        this.formTreeIconMap.set('RT', 'FB-text-box.svg');
        this.formTreeIconMap.set('QN', 'FB-questionnaire.svg');
        this.formTreeIconMap.set('PE', 'FB-code.svg');
        this.formTreeIconMap.set('AS', 'RandomTxt');
        this.formTreeIconMap.set('CB', 'FB-check.svg');
        this.formTreeIconMap.set('DE', 'FB-calendar.svg');
        this.formTreeIconMap.set('ES', 'RandomTxt');
        this.formTreeIconMap.set('NE', 'FB-number.svg');
        this.formTreeIconMap.set('RB', 'FB-radio-button.svg');
        this.formTreeIconMap.set('SD', 'FB-system drop down.svg');
        this.formTreeIconMap.set('SE', 'FB-string.svg');
        this.formTreeIconMap.set('TE', 'FB-text.svg');
        this.formTreeIconMap.set('UD', 'FB-user drop down.svg');
        this.formTreeIconMap.set('INFO', 'FB-info.svg');
        this.formTreeIconMap.set('PT', 'FB-rich-text.svg');
        this.formTreeIconMap.set('CR', 'FB-dollar.svg');
        this.formTreeIconMap.set('AT', 'FB-attachment.svg');
    }

    componentContainerScroll(event: any) {
        const CONTAINER_SCROLL = document.getElementById('FB-edit-Container').scrollTop;
        this.showScrollButton = CONTAINER_SCROLL > 100;
    }

    trackBy(index: number): number {
        return index;
    }

    initializeSectionStyles(): void {
        const FB_ADDITIONAL_INFO = document.getElementById(FB_ADDITIONAL_INFO_ID);
        const FB_EDITOR_INFO = document.getElementById('FB-Form-Editor');
        FB_ADDITIONAL_INFO.classList.add('fb_Additional_Info');
        FB_EDITOR_INFO.classList.add('FB-Form-Editable');
    }

    getCurrencyLookup(): void {
        this.$subscriptions.push(this.formBuilderService.getCurrencyLookup()
            .subscribe((data: Currency[]) => {
                this.formBuilderService.currencyLookup = data;
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Error while fetching currency lookup.');
            }));
    }

}
