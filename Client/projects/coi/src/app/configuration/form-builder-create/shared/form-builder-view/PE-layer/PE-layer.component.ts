import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { HostContainerDirective } from '../../../../../shared/directives/host-container.directive';
import { CustomElementVO, FBConfiguration, FormBuilderSaveRO, QuestionnaireVO, SectionComponent } from '../form-builder-interface';
import { OPACompUncompComponent } from '../PE-components/OPA-comp-uncomp/OPA-comp-uncomp.component';
import { OPAOutsideFinancialRelationComponent } from '../PE-components/OPA-outside-financial-relation/OPA-outside-financial-relation.component';
import { FormBuilderService } from '../form-builder.service';
import { Subject, Subscription } from 'rxjs';
import { OPAInstituteResourceUseComponent } from '../PE-components/OPA-institute-resources/OPA-institute-resources.component';
import { OPAStudentSubordinateEmployeeComponent } from '../PE-components/OPA-student-subordinate-employee/OPA-student-subordinate-employee.component';
// import { COITravelDestinationComponent } from '../PE-components/COI-travel-destination/COI-travel-destination.component';
import { CommonService } from '../../../../../common/services/common.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../../app-constants';
import { FormBuilderCreateService } from '../../../form-builder-create.service';
import { OPAAppointmentComponent } from '../PE-components/OPA-appointment/OPA-appointment.component';
import { OPAPersonEngagementsComponent } from '../PE-components/OPA-person-engagements/OPA-person-engagements.component';
import { ExternalActionEvent, FBOpaCardActionEvent } from '../../common.interface';
import { subscriptionHandler } from '../../../../../common/utilities/subscription-handler';
import { COITravelDestinationComponent } from '../PE-components/COI-travel-destination/COI-travel-destination.component';

@Component({
    selector: 'app-PE-layer',
    template: '<ng-template appHostContainer></ng-template>',
    styleUrls: ['./PE-layer.component.scss']
})
export class PELayerComponent implements OnInit, OnChanges, OnDestroy {

    @ViewChild(HostContainerDirective, { static: true }) adHost!: HostContainerDirective;
    @Input() component: SectionComponent;
    @Input() fbConfiguration: FBConfiguration;
    @Input() isFormEditable: boolean;
    @Input() formBuilderId: number;
    @Input() sectionName = '';
    @Input() externalActionEventForChildComponent = new Subject<ExternalActionEvent>(); //This input is used to capture external actions triggered from other components, allowing this component to respond accordingly when such actions occur.
    @Output() emitActionEvent = new EventEmitter<FBOpaCardActionEvent>();
    @Input() saveEventForChildComponent = new Subject<any>();
    $subscriptions: Subscription[] = [];

    constructor(
        private _formBuilder: FormBuilderService,
        private _commonService: CommonService,
        private _formBuilderCreateService: FormBuilderCreateService
    ) { }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges) {
        this.loadComponent();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
        if (this._formBuilderCreateService.updateTimeout) {
            clearTimeout(this._formBuilderCreateService.updateTimeout);
        }
        this._formBuilderCreateService.dataLayerDetails = [];
    }

    loadComponent() {
        const VIEW_CONTAINER_REF = this.adHost.viewContainerRef;
        VIEW_CONTAINER_REF.clear();
        switch (this.component.componentData) {
            case 'OPACompUncompComponent': this.loadOPACompUncompComponent(VIEW_CONTAINER_REF); break;
            case 'OPAOutsideFinancialRelationComponent': this.loadOPAOutsideFinancialRelationComponent(VIEW_CONTAINER_REF); break;
            case 'OPAInstituteResourceUseComponent': this.loadOPAInstituteResourceUseComponent(VIEW_CONTAINER_REF); break;
            case 'OPAStudentSubordinateInvolvementComponent': this.loadOPAStudentSubordinateEmployeeComponent(VIEW_CONTAINER_REF); break;
            case 'CoiTravelDestinationComponent': this.loadOPATravelDestinationComponent(VIEW_CONTAINER_REF); break;
            case 'OPAPersonAppointmentComponent': this.loadOPAAppointmentComponent(VIEW_CONTAINER_REF); break;
            case 'OPAPersonEngagementsComponent': this.loadOPAPersonEngagementsComponent(VIEW_CONTAINER_REF); break;
            default: break;
        }
    }

    loadOPACompUncompComponent(viewContainerRef) {
        const COMPONENT_REF = viewContainerRef.createComponent(OPACompUncompComponent);
        COMPONENT_REF.instance.componentData = this.component.programmedElement;
        COMPONENT_REF.instance.formBuilderId = this.fbConfiguration.moduleItemKey;
        COMPONENT_REF.instance.externalEvents = this.saveEventForChildComponent;
        COMPONENT_REF.instance.isFormEditable = this.isFormEditable;
        COMPONENT_REF.instance.sectionHeading = this.sectionName;
        COMPONENT_REF.instance.childEvents.subscribe( event => this.saveEventsFromChild(event));
    }

    loadOPAOutsideFinancialRelationComponent(viewContainerRef) {
        const COMPONENT_REF = viewContainerRef.createComponent(OPAOutsideFinancialRelationComponent);
        COMPONENT_REF.instance.componentData = this.component.programmedElement;
        COMPONENT_REF.instance.formBuilderId = this.fbConfiguration.moduleItemKey;
        COMPONENT_REF.instance.isFormEditable = this.isFormEditable;
        COMPONENT_REF.instance.externalEvents = this.saveEventForChildComponent;
        COMPONENT_REF.instance.sectionHeading = this.sectionName;
        COMPONENT_REF.instance.childEvents.subscribe( event => this.saveEventsFromChild(event));
    }

    loadOPAInstituteResourceUseComponent(viewContainerRef) {
        const COMPONENT_REF = viewContainerRef.createComponent(OPAInstituteResourceUseComponent);
        COMPONENT_REF.instance.componentData = this.component.programmedElement;
        COMPONENT_REF.instance.formBuilderId = this.fbConfiguration.moduleItemKey;
        COMPONENT_REF.instance.isFormEditable = this.isFormEditable;
        COMPONENT_REF.instance.externalEvents = this.saveEventForChildComponent;
        COMPONENT_REF.instance.sectionHeading = this.sectionName;
        COMPONENT_REF.instance.childEvents.subscribe( event => this.saveEventsFromChild(event));
    }

    loadOPAStudentSubordinateEmployeeComponent(viewContainerRef) {
        const COMPONENT_REF = viewContainerRef.createComponent(OPAStudentSubordinateEmployeeComponent);
        COMPONENT_REF.instance.componentData = this.component.programmedElement;
        COMPONENT_REF.instance.formBuilderId = this.fbConfiguration.moduleItemKey;
        COMPONENT_REF.instance.isFormEditable = this.isFormEditable;
        COMPONENT_REF.instance.externalEvents = this.saveEventForChildComponent;
        COMPONENT_REF.instance.childEvents.subscribe( event => this.saveEventsFromChild(event));
    }

    loadOPATravelDestinationComponent(viewContainerRef) {
        const COMPONENT_REF = viewContainerRef.createComponent(COITravelDestinationComponent);
        COMPONENT_REF.instance.componentData = this.component.programmedElement;
        COMPONENT_REF.instance.formBuilderId = this.fbConfiguration.moduleItemKey;
        COMPONENT_REF.instance.isFormEditable = this.isFormEditable;
        COMPONENT_REF.instance.externalEvents = this.saveEventForChildComponent;
        COMPONENT_REF.instance.childEvents.subscribe(event => this.saveEventsFromChild(event));
    }

    loadOPAAppointmentComponent(viewContainerRef) {
        const COMPONENT_REF = viewContainerRef.createComponent(OPAAppointmentComponent);
        COMPONENT_REF.instance.componentData = this.component.programmedElement;
        COMPONENT_REF.instance.formBuilderId = this.formBuilderId;
        COMPONENT_REF.instance.externalEvents = this.saveEventForChildComponent;
    }

    loadOPAPersonEngagementsComponent(viewContainerRef) {
        const COMPONENT_REF = viewContainerRef.createComponent(OPAPersonEngagementsComponent);
        COMPONENT_REF.instance.componentData = this.component.programmedElement;
        COMPONENT_REF.instance.formBuilderId = this.formBuilderId;
        COMPONENT_REF.instance.isFormEditable = this.isFormEditable;
        COMPONENT_REF.instance.externalEvents = this.saveEventForChildComponent;
        COMPONENT_REF.instance.externalActionEventForChildComponent = this.externalActionEventForChildComponent;
        COMPONENT_REF.instance.emitActionEvent.subscribe(event => this.emitActionEvents({
            ...event, content: { ...event.content, sectionComponent: { ...this.component, sectionName: this.sectionName } }
        }));
        COMPONENT_REF.instance.childEvents.subscribe(event => this.saveEventsFromChild(event));
    }

    private emitActionEvents(event: FBOpaCardActionEvent): void {
        this.emitActionEvent.emit(event)
    }

    saveEventsFromChild(data: CustomElementVO | QuestionnaireVO | any) {
        const INDEX = this._formBuilderCreateService.dataLayerDetails.
            findIndex(dataLayerData => dataLayerData.component?.componentId === this.component?.componentId);
        if (INDEX !== -1) {
            this._formBuilderCreateService.dataLayerDetails.splice(INDEX, 1);
        }
        this._formBuilderCreateService.dataLayerDetails.push({
            data: data,
            component: this.component,
        });
        if (this._formBuilderCreateService.updateTimeout) {
            clearTimeout(this._formBuilderCreateService.updateTimeout);
        }
        this._formBuilderCreateService.updateTimeout = setTimeout(() => {
            const ROLIST = [];
            this._formBuilderCreateService.dataLayerDetails.forEach(detail => {
                const RO = this.prepareROForSave(detail['data'], detail['component']);
                ROLIST.push(RO);
            });
            this.saveApiCall(ROLIST, data);
        }, 0);
    }

    private saveApiCall(ROList: FormBuilderSaveRO[], data?: CustomElementVO | QuestionnaireVO | any): void {
        if (this._formBuilderCreateService.isAutoSaveEnabled) {
            this._commonService.setLoaderRestriction();
            this._commonService.showAutoSaveSpinner();
        }
        this.$subscriptions.push(
            this._formBuilder.saveFormComponent(ROList).subscribe((res: SectionComponent[]) => {
                this._formBuilderCreateService.formBuilderAnswerHeaderId = res?.[0]?.formBuilderAnswerHeaderId;
                this._formBuilderCreateService.dataLayerDetails = [];
                if (this._formBuilderCreateService.isAutoSaveEnabled) {
                    if(this._formBuilderCreateService.peLayerFailedQueue.length) {
                        this._formBuilderCreateService.peLayerFailedQueue.forEach(ele => {
                            this.saveApiCall([ele]);
                        });
                        this._formBuilderCreateService.peLayerFailedQueue = [];
                    }
                    this._commonService.hideAutoSaveSpinner('SUCCESS');
                    this.emitEditOrSaveAction('SAVE_COMPLETE', res);
                } else {
                    this.showToast(data.action, 'SUCCESS');
                }
                res?.forEach((sectionData) => {
                    this.saveEventForChildComponent.next({ eventType: 'SAVE_COMPLETE', data: sectionData?.programmedElement });
                });
            }, err => {
                if (this._formBuilderCreateService.isAutoSaveEnabled) {
                    const HAS_DESTINATION = ROList?.some(item => item.componentData === 'CoiTravelDestinationComponent');
                    if (!HAS_DESTINATION) {
                        this._commonService.hideAutoSaveSpinner('ERROR');
                    } else {
                        this._commonService.autoSaveSavingSpinner = 'HIDE';
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating Destination failed. Please try again.');
                    }
                    this._formBuilder.$formBuilderActionEvents.next({action: 'AUTO_SAVE_ERROR'});
                    this.saveEventForChildComponent.next({ eventType: 'ERROR'});
                    ROList?.forEach(ele => {
                        if(ele.componentData !== 'CoiTravelDestinationComponent') {
                            this._formBuilderCreateService.peLayerFailedQueue.push(ele);
                        }
                    })
                } else {
                    this.showToast(data.action, 'ERROR');
                }
            })
        );
        if (this._formBuilderCreateService.isAutoSaveEnabled) {
            this._commonService.removeLoaderRestriction();
        }
    }

    private showToast(action: string, toastType: 'SUCCESS' | 'ERROR'): void {
        const MODULE_CODE = this.fbConfiguration.moduleItemCode;
        const MESSAGES = {
            '24': {
                SUCCESS: {
                    ADD: 'Destination added successfully.',
                    UPDATE: 'Destination updated successfully.',
                    DELETE: 'Destination removed successfully.'
                },
                ERROR: {
                    ADD: 'Error in adding destination. Please try again.',
                    UPDATE: 'Error in updating destination. Please try again.',
                    DELETE: 'Error in deleting destination. Please try again.'
                }
            }
        };
        const MESSAGE = MESSAGES[MODULE_CODE]?.[toastType]?.[action];
        if (MESSAGE) {
            const STATUS = toastType === 'SUCCESS' ? HTTP_SUCCESS_STATUS : HTTP_ERROR_STATUS;
            this._commonService.showToast(STATUS, MESSAGE);
        }
    }

    prepareROForSave(data: CustomElementVO | QuestionnaireVO | any, component?): FormBuilderSaveRO {
        const RO = new FormBuilderSaveRO();
        RO.formBuilderId = this.formBuilderId;
        RO.moduleItemCode = this.fbConfiguration.moduleItemCode;
        RO.moduleItemKey = this.fbConfiguration.moduleItemKey;
        RO.moduleSubItemCode = this.fbConfiguration.moduleSubItemCode;
        RO.moduleSubItemKey = this.fbConfiguration.moduleSubItemKey;
        RO.documentOwnerPersonId = this.fbConfiguration.documentOwnerPersonId;
        RO.componentId = component ? component.componentId : this.component.componentId;
        RO.componentType = component ? component.componentType : this.component.componentType;
        RO.componentData = component ? component.componentData : this.component.componentData;
        RO.componentRefId = component ? component.componentRefId : this.component.componentRefId;
        switch (component ? component.componentType : this.component.componentType) {
            case 'QN':
                RO.questionnaire = data.data;
                RO.files = data.data.files;
                delete RO.questionnaire.files;
                break;
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
            case 'CR':
            case 'AT':
                RO.customElement = data.data;
                break;
            case 'TE': RO.customElement = data.data; break;
            case 'PE': RO.programmedElement = data.data; break;
        }
        RO.formBuilderAnswerHeaderId = this._formBuilderCreateService.formBuilderAnswerHeaderId;
        return RO;
    }

    emitEditOrSaveAction(actionPerformed, event) {
        this._formBuilder.$formBuilderActionEvents.next({action: actionPerformed, actionResponse: event, component: this.component});
    }
}
