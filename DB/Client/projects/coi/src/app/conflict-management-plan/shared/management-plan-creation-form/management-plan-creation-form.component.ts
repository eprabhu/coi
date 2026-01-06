import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { SharedComponentModule } from '../../../shared-components/shared-component.module';
import { getEndPointOptionsForLeadUnit } from 'projects/fibi/src/app/common/services/end-point.config';
import { CommonService } from '../../../common/services/common.service';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import {
    CoiProjectType, ElasticPersonResult, ElasticPersonSource, ElasticRolodexResult,
    ElasticRolodexSource, EntityCreationModalConfig, GlobalEventNotifier,
    LookUpClass, Person, RolodexPerson, SharedProjectDetails
} from '../../../common/services/coi-common.interface';
import { EMPLOYEE_LOOKUP, ENTITY_SOURCE_TYPE_CODE, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS, REPORTER_HOME_URL } from '../../../app-constants';
import { setEntityObjectFromElasticResult, setPersonObjectFromElasticResult, setRolodexObjectFromElasticResult } from '../../../common/utilities/elastic-utilities';
import { CommonPersonCardComponent } from '../../../shared-components/common-person-card/common-person-card.component';
import { CMP_TYPE } from '../management-plan-constants';
import { ElasticEntityResult, ElasticEntitySource, EntireEntityDetails, EntityRequestFields, EntityUpdateClass } from '../../../entity-management-module/shared/entity-interface';
import { ENTITY_MANDATORY_REPORTER_FIELDS } from '../../../entity-management-module/shared/entity-constants';
import { Subject, Subscription } from 'rxjs';
import { deepCloneObject, getCodeDescriptionFormat } from '../../../common/utilities/custom-utilities';
import {
    CmpBuilderSection, CmpCreationEvent, CmpCreationConfig, CmpCreationRO, CmpDetails,
    CmpFieldKey, CmpProjectType, CmpTemplateGroup, CmpTemplateTypeMap, CmpProject, CmpEntity
} from '../management-plan.interface';
import { HeaderService } from '../../../common/header/header.service';
import { Router } from '@angular/router';
import { getEndPointOptionsForOrganization, getEndPointOptionsForProjects } from '../../../common/services/end-point.config';
import { ManagementPlanCreationFormService } from './management-plan-creation-form.service';

@Component({
    selector: 'app-management-plan-creation-form',
    templateUrl: './management-plan-creation-form.component.html',
    styleUrls: ['./management-plan-creation-form.component.scss'],
    standalone: true,
    providers: [ManagementPlanCreationFormService],
    imports: [CommonModule, FormsModule, SharedModule, SharedComponentModule, CommonPersonCardComponent]
})
export class ManagementPlanCreationFormComponent implements OnInit, OnChanges {

    @Input() cmpCreationConfig = new CmpCreationConfig();
    @Input() $performAction = new Subject<CmpCreationEvent>();
    @Output() cmpActions = new EventEmitter<any>();

    isSaving = false;
    createLocalObject = new CmpDetails();
    personSearchResult: ElasticPersonResult | ElasticRolodexResult | null = null;
    selectedEntityDetails = new ElasticEntityResult();
    selectedProjDetails = new SharedProjectDetails();
    entityCreationModalObj = new EntityUpdateClass();

    personSearchOptions: any = {};
    entitySearchOptions: any = {};
    projectSearchOptions: any = {};
    labCenterSearchOptions: any = {};
    subAwardInstituteOptions: any = {};
    academicDeptSearchOptions: any = {};
    subAwardInvestigatorOptions: any = {};

    cmpTypeLookup: LookUpClass[] = [];
    cmpTemplateLookup: LookUpClass[] = [];
    cmpProjectTypes: CmpProjectType[] = [];
    cmpTemplateTypes: CmpTemplateGroup = {};
    projectsTypesLookup: LookUpClass[] = [];
    subAwardProjTypesLookup: LookUpClass[] = [];
    selectedProjType: LookUpClass | null = null;
    employeeLookup: LookUpClass[] = EMPLOYEE_LOOKUP;

    CMP_TYPE = CMP_TYPE;
    projectTypes: Record<string, CoiProjectType> = this._commonService.getCoiProjectTypesMap();

    private $subscriptions: Subscription[] = [];

    constructor(private _router: Router,
        private _commonService: CommonService,
        private _headerService: HeaderService,
        private _elasticConfig: ElasticConfigService,
        private _creationFormService: ManagementPlanCreationFormService) {}

    ngOnInit(): void {
        this.getCmpProjectTypes();
        this.getCmpTemplateTypes();
        this.setSearchOptions();
        this.listenCmpActions();
        this.listenToGlobalNotifier();
    }

    /** Triggered when cmpCreationConfig input changes */
    ngOnChanges(changes: SimpleChanges): void {
        this.createLocalObject = deepCloneObject(this.cmpCreationConfig.cmpDetails);
        if (!this.cmpCreationConfig.isEditMode && this.cmpCreationConfig.errorMsgMap.size > 0) {
            this.cmpCreationConfig.errorMsgMap.clear();
        }
        if (!this.createLocalObject?.cmpType?.cmpTypeCode) {
            this.createLocalObject.cmpType.cmpTypeCode = CMP_TYPE.UNIVERSITY;
        }
        if (this.createLocalObject?.person?.personId) {
            this.personSearchResult = deepCloneObject(this.createLocalObject.person);
        } else if (this.createLocalObject?.rolodex?.rolodexId) {
            this.createLocalObject.employeeType = 'ROLODEX';
            this.personSearchResult = deepCloneObject(this.createLocalObject.rolodex);
        }
        if (this.createLocalObject?.cmpEntityList?.[0]?.entityNumber) {
            this.selectedEntityDetails = deepCloneObject(this.createLocalObject.cmpEntityList[0].entity?.entityDetails);
        }
        if (this.createLocalObject?.cmpProjectList?.[0]?.moduleCode) {
            this.selectedProjDetails = deepCloneObject(this.createLocalObject.cmpProjectList[0].projectDetails);
            this.projectSearchOptions = getEndPointOptionsForProjects(this._commonService.baseUrl, this.createLocalObject?.cmpProjectList?.[0]?.moduleCode);
            this.projectSearchOptions.defaultValue = this.selectedProjDetails.projectNumber + ' - ' + this.selectedProjDetails.projectTitle;
        }
    }

    private listenCmpActions(): void {
        this.$subscriptions.push(
            this.$performAction.subscribe((event: CmpCreationEvent) => {
                if (event.actionType === 'SAVE_AND_VALIDATE') {
                    this.saveOrUpdateManagementPlan();
                } else if (event.actionType === 'VALIDATE_ONLY') {
                    this.checkFieldValidation();
                }
            }));
    }

    private listenToGlobalNotifier(): void {
        this.$subscriptions.push(this._commonService.$globalEventNotifier.subscribe((data: GlobalEventNotifier) => {
            const EVENT_DATA = data?.content || null;
            if (data.uniqueId === 'ENTITY_CREATION_MODAL' && ['CMP_ADD', 'CMP_EDIT'].includes(data.content.triggeredFrom)) {
                if (EVENT_DATA?.entityDetails) {
                    this.selectedEntityDetails = deepCloneObject(EVENT_DATA.entityDetails?.entityRequestFields);
                    this.entityCreationModalObj = deepCloneObject(EVENT_DATA.entityDetails);
                    this.entitySearchOptions = this._elasticConfig.getElasticForActiveVerifiedEntity();
                    this.entitySearchOptions.defaultValue = this.selectedEntityDetails?.entityName;
                } else {
                    data.content.triggeredFrom === 'CMP_ADD' && this.clearEntitySearchDetails();
                }
            }
        }));
    }

    private getCmpProjectTypes(): void {
        this.$subscriptions.push(
            this._creationFormService.getCmpProjectTypes()
                .subscribe({
                    next: (res: CmpProjectType[]) => {
                        this.cmpProjectTypes = res;
                        this.setProjectTypesLookup();
                        if (this.createLocalObject?.cmpProjectList?.[0]?.moduleCode) {
                            this.selectedProjType = this.projectsTypesLookup
                                .find((type) => String(type.code) === String(this.createLocalObject?.cmpProjectList?.[0]?.moduleCode));
                        } else {
                            this.setProjectFields();
                        }
                    },
                    error: () => {
                        this.isSaving = false;
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to fetch project types.');
                    }
                }
                )
        );
    }

    private getCmpTemplateTypes(): void {
        this.$subscriptions.push(
            this._creationFormService.getCmpTemplateTypes()
                .subscribe({
                    next: (res: CmpTemplateGroup) => {
                        this.cmpTemplateTypes = res;
                        this.setTemplateTypesLookup();
                    },
                    error: () => {
                        this.isSaving = false;
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to fetch templates.');
                    }
                }
                )
        );
    }

    private getRequestObject(): CmpCreationRO {
        const { cmpType, person, rolodex, cmpEntityList, cmpProjectList, cmpId,
            academicDepartment, labCenter, organization, cmpSectionTemplates } = this.createLocalObject || {};
        return {
            cmpId: cmpId || undefined,
            cmpTypeCode: cmpType?.cmpTypeCode || null,
            personId: person?.personId || null,
            rolodexId: rolodex?.rolodexId || null,
            entityRelations: cmpEntityList?.map(({ entityNumber }) => ({ entityNumber })),
            projectRelations: cmpProjectList?.map(({ moduleCode, moduleItemKey }) => ({ moduleCode, moduleItemKey })),
            academicDepartmentNumber: academicDepartment?.unitNumber || null,
            labCenterNumber: labCenter?.unitNumber || null,
            subAwardInstituteCode: organization?.organizationId || null,
            sectionRelations: this.mapToGroupedSectionRelations(cmpSectionTemplates)
        };
    }

    private mapToGroupedSectionRelations(data: CmpTemplateTypeMap[]): CmpBuilderSection[] {
        const SECTION_MAP: Record<number, CmpBuilderSection> = {};
        data.forEach(item => {
            const SECTION_ID = item.sectionId;
            if (!SECTION_MAP[SECTION_ID]) {
                SECTION_MAP[SECTION_ID] = {
                    sectionName: item.coiManagementPlanSection?.sectionName,
                    description: item.coiManagementPlanSection?.description,
                    sortOrder: item.sortOrder,
                    components: []
                };
            }
            SECTION_MAP[SECTION_ID].components.push({
                secCompId: null,
                cmpSectionRelId: null,
                description: item.coiManagementPlanTemplate?.description,
                sortOrder: item.sortOrder
            });
        });
        return Object.values(SECTION_MAP)
            .map((section: CmpBuilderSection) => ({
                ...section,
                components: section.components.sort((a, b) => a.sortOrder - b.sortOrder)
            }))
            .sort((a, b) => a.sortOrder - b.sortOrder);
    }

    private checkFieldValidation(): boolean {
        const { mandatoryFieldsList, cmpDetails } = this.cmpCreationConfig;
        const { personId, cmpTypeCode, labCenterNumber, academicDepartmentNumber,
            sectionRelations, subAwardInstituteCode, rolodexId, entityRelations, projectRelations } = this.getRequestObject();
        mandatoryFieldsList?.[cmpDetails.cmpType.cmpTypeCode]?.forEach((field: CmpFieldKey) => {
            this.clearValidation(field);
            let message = '';
            switch (field) {
                case 'PERSON_SEARCH': if (!personId) message = `Please select the person.`;
                    break;
                case 'CMP_TYPE': if (!cmpTypeCode) message = `Please select a CMP type.`;
                    break;
                case 'LAB_CENTER': if (!labCenterNumber) message = `Please select the lab center.`;
                    break;
                case 'TEMPLATE': if (!sectionRelations.length) message = `Please select the template.`;
                    break;
                case 'SUB_AWARD_INSTITUTE': if (!subAwardInstituteCode) message = `Please select the sub award organization.`;
                    break;
                case 'ACADEMIC_DEPARTMENT': if (!academicDepartmentNumber) message = `Please select the academic department.`;
                    break;
                case 'ENTITY_SEARCH': if (!entityRelations?.length) message = `Please select the entity.`;
                    break;
                case 'PROJECT_SEARCH': if (!projectRelations?.length) message = `Please select the project.`;
                    break;
                case 'SUB_AWARD_INVESTIGATOR': if (!rolodexId && !personId) message = `Please select the sub-award investigator.`;
                    break;
                case 'PROJECT': if (!projectRelations?.length || !this.selectedProjType.code) message = `Please select project details.`;
                    break;
                case 'PROJECT_TYPE': if (!this.selectedProjType.code) message = `Please select project type.`;
                    break;
                default: message = '';
                    break;
            }
            message && this.cmpCreationConfig.errorMsgMap?.set(field, message);
        });
        this.$performAction.next({ actionType: 'VALIDATION_COMPLETE', content: { cmpCreationConfig: this.cmpCreationConfig } });
        return this.cmpCreationConfig.errorMsgMap.size === 0;
    }

    private clearValidation(type): void {
        this.cmpCreationConfig.errorMsgMap?.delete(type);
    }


    private async saveOrUpdateManagementPlan(): Promise<any> {
        if (this.checkFieldValidation() && !this.isSaving) {
            if (!this.selectedEntityDetails.entityId) {
                this.entityCreationModalObj.entityRequestFields.entitySourceTypeCode = ENTITY_SOURCE_TYPE_CODE.CMP;
                const ENTITY_RESPONSE = await this._headerService.createNewEntity(this.entityCreationModalObj);
                this.selectedEntityDetails.entityId = ENTITY_RESPONSE?.entityId;
                this.selectedEntityDetails.entityNumber = ENTITY_RESPONSE?.entityNumber;
                const CMP_ENTITY: CmpEntity = {
                    cmpId: null,
                    entityNumber: this.selectedEntityDetails?.entityNumber,
                    personEntityNumber: null,
                    entity: { ...new EntireEntityDetails, entityDetails: deepCloneObject(this.selectedEntityDetails) }
                };
                this.createLocalObject.cmpEntityList = [CMP_ENTITY];
            }
            this.cmpCreationConfig.requestFields = this.getRequestObject();
            this.cmpCreationConfig.requestFields.cmpId ? this.updateManagementPlan() : this.createManagementPlan();
        };
    }

    private createManagementPlan(): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this._creationFormService.createManagementPlan(this.cmpCreationConfig.requestFields).subscribe({
                next: (data: any) => {
                    this.$performAction.next({ actionType: 'SAVE_COMPLETE', content: { cmpCreationConfig: this.cmpCreationConfig, cmpDetails: data } });
                    setTimeout(() => {
                        this.isSaving = false;
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Management plan created successfully.');
                        const PREVIOUS_ROUTE_URL = sessionStorage.getItem('previousUrl') || '';
                        data?.cmpId
                            ? this._headerService.redirectToCMP(data.cmpId)
                            : this._router.navigate([PREVIOUS_ROUTE_URL || REPORTER_HOME_URL]);
                    });
                },
                error: () => {
                    this.$performAction.next({ actionType: 'SAVE_FAILED', content: { cmpCreationConfig: this.cmpCreationConfig } });
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in creating management plan.');
                    this.isSaving = false;
                }
            });
        }
    }

    private updateManagementPlan(): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this._creationFormService.updateManagementPlan(this.cmpCreationConfig.requestFields).subscribe({
                next: (data: any) => {
                    this.$performAction.next({ actionType: 'SAVE_COMPLETE', content: { cmpCreationConfig: this.cmpCreationConfig, cmpDetails: data } });
                    setTimeout(() => {
                        this.isSaving = false;
                        this._headerService.redirectToCMP(this.cmpCreationConfig.requestFields?.cmpId);
                        this._commonService.$globalEventNotifier.next({
                            uniqueId: 'TRIGGER_USER_CMP_ACTIONS',
                            content: { actionType: 'REFRESH_CMP', ...data, cmpId: this.cmpCreationConfig.requestFields?.cmpId }
                        });
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Management plan updated successfully.');
                    });
                },
                error: () => {
                    this.$performAction.next({ actionType: 'SAVE_FAILED', content: { cmpCreationConfig: this.cmpCreationConfig } });
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in creating management plan.');
                    this.isSaving = false;
                }
            });
        }
    }

    private clearEntitySearchDetails(): void {
        this.selectedEntityDetails = new ElasticEntityResult();
        this.entityCreationModalObj = new EntityUpdateClass();
        this.entitySearchOptions = this._elasticConfig.getElasticForActiveVerifiedEntity();
    }

    private setProjectTypesLookup(): void {
        this.projectsTypesLookup = this.cmpProjectTypes
            ?.filter((cmpProjectType: CmpProjectType) => this.createLocalObject?.cmpType?.cmpTypeCode === cmpProjectType?.cmpTypeCode)
            .map((projectType: CmpProjectType) => ({
                code: projectType.coiProjectTypeCode,
                description: this.projectTypes?.[projectType?.coiProjectTypeCode]?.description
            }));
    }

    private setTemplateTypesLookup(): void {
        this.cmpTemplateLookup = Object.keys(this.cmpTemplateTypes).map((key: string) => ({
            code: key,
            description: key
        }));
    }

    private setSearchOptions(): void {
        this.setPersonSearchOptions();
        this.entitySearchOptions = this._elasticConfig.getElasticForActiveEntity();
        this.entitySearchOptions.defaultValue = this.createLocalObject?.cmpEntityList?.[0]?.entity?.entityDetails?.entityName;
        this.labCenterSearchOptions = getEndPointOptionsForLeadUnit('', this._commonService.fibiUrl);
        this.labCenterSearchOptions.defaultValue = this.createLocalObject?.labCenter?.displayName;
        this.subAwardInstituteOptions = getEndPointOptionsForOrganization(this._commonService.fibiUrl);
        this.subAwardInstituteOptions.defaultValue = getCodeDescriptionFormat(this.createLocalObject?.organization?.organizationId, this.createLocalObject?.organization?.organizationName);
        this.academicDeptSearchOptions = getEndPointOptionsForLeadUnit('', this._commonService.fibiUrl);
        this.academicDeptSearchOptions.defaultValue = this.createLocalObject?.academicDepartment?.displayName;
        this._commonService.getOrFetchLookup('COI_MANAGEMENT_PLAN_TYPE', 'CMP_TYPE_CODE').then((res: any) => {
            this.cmpTypeLookup = res;
        });
    }

    private setDefaultPersonResult(): void {
        this.personSearchResult = this.createLocalObject?.person?.personId ? deepCloneObject(this.createLocalObject.person)
            : this.createLocalObject?.rolodex?.rolodexId ? deepCloneObject(this.createLocalObject.rolodex) : null;
    }

    private setProjectFields(): void {
        this.setProjectTypesLookup();
        this.selectedProjType = this.projectsTypesLookup?.length > 1 ? null : this.projectsTypesLookup?.[0];
        this.projectTypeChanged(this.selectedProjType);
    }

    private setPersonSearchOptions(): void {
        if (this.createLocalObject?.cmpType?.cmpTypeCode === CMP_TYPE.UNIVERSITY) {
            this.personSearchOptions = this._elasticConfig.getElasticForPerson();
            this.personSearchOptions.defaultValue = this.createLocalObject?.person?.fullName;
        } else {
            if (this.createLocalObject.employeeType === 'ROLODEX') {
                this.subAwardInvestigatorOptions = this._elasticConfig.getElasticForRolodex();
                this.subAwardInvestigatorOptions.defaultValue = this.createLocalObject?.rolodex?.fullName;
            } else {
                this.subAwardInvestigatorOptions = this._elasticConfig.getElasticForPerson();
                this.subAwardInvestigatorOptions.defaultValue = this.createLocalObject?.person?.fullName;
            }
        }
    }

    selectedPerson(person: ElasticPersonSource): void {
        this.personSearchResult = person ? setPersonObjectFromElasticResult(person) : null;
        this.createLocalObject.person = this.personSearchResult as Person || null;
    }

    selectedSubAwardPerson(personOrRolodex: ElasticPersonSource | ElasticRolodexSource | null): void {
        const IS_PERSON = 'prncpl_id' in personOrRolodex && !!personOrRolodex.prncpl_id;
        const IS_ROLODEX = 'rolodex_id' in personOrRolodex && !!personOrRolodex.rolodex_id;
        this.personSearchResult = IS_PERSON ? setPersonObjectFromElasticResult(personOrRolodex)
            : IS_ROLODEX ? setRolodexObjectFromElasticResult(personOrRolodex) : null;
        if (this.createLocalObject.employeeType === 'ROLODEX') {
            this.createLocalObject.rolodex = this.personSearchResult as RolodexPerson;
        } else {
            this.createLocalObject.person = this.personSearchResult as Person;
        }
    }

    selectedEntity(entity: ElasticEntitySource): void {
        this.selectedEntityDetails = entity ? setEntityObjectFromElasticResult(entity) : new ElasticEntityResult();
        const CMP_ENTITY: CmpEntity = {
            cmpId: null,
            entityNumber: this.selectedEntityDetails?.entityNumber,
            personEntityNumber: null,
            entity: { ...new EntireEntityDetails, entityDetails: deepCloneObject(this.selectedEntityDetails) }
        };
        this.createLocalObject.cmpEntityList = this.selectedEntityDetails.entityId ? [CMP_ENTITY] : [];
    }

    selectedProject(project: SharedProjectDetails): void {
        if (project) {
            project.projectTypeCode = this.selectedProjType?.code.toString();
        }
        const CMP_PROJECT: CmpProject = {
            cmpId: null,
            moduleCode: project?.projectTypeCode,
            moduleItemKey: project?.projectNumber,
            projectDetails: project
        };
        this.selectedProjDetails = project ? project : new SharedProjectDetails();
        this.createLocalObject.cmpProjectList = this.selectedProjDetails?.projectTypeCode ? [CMP_PROJECT] : [];
    }

    selectedAcademicDept(unit: any): void {
        this.createLocalObject.academicDepartment = unit || null;
    }

    selectedLabCenter(unit: any): void {
        this.createLocalObject.labCenter = unit || null;
    }

    selectedInstitute(unit: any): void {
        this.createLocalObject.organization = unit || null;
    }

    cmpTypeChanged(event: any): void {
        if (this.createLocalObject?.cmpType?.cmpTypeCode !== event?.code) {
            this.createLocalObject = new CmpDetails();
            this.createLocalObject.cmpType = {
                cmpTypeCode: event?.code || null,
                description: event?.description || null
            };
            if (this.cmpCreationConfig.disabledFields.PERSON_SEARCH) {
                this.createLocalObject.person = this.cmpCreationConfig.cmpDetails.person;
            }
            if (this.cmpCreationConfig.disabledFields.SUB_AWARD_INVESTIGATOR) {
                this.createLocalObject.person = this.cmpCreationConfig.cmpDetails.person;
                this.createLocalObject.rolodex = this.cmpCreationConfig.cmpDetails.rolodex;
            }
            this.setDefaultPersonResult();
            this.setSearchOptions();
            this.setProjectFields();
            this.clearEntitySearchDetails();
            this.cmpCreationConfig.errorMsgMap.clear();
        }
    }

    employeeTypeChanged(event: any): void {
        this.createLocalObject.employeeType = event?.code || null;
        this.createLocalObject.person = null;
        this.createLocalObject.rolodex = null;
        this.setPersonSearchOptions();
        this.personSearchResult = null;
    }

    projectTypeChanged(projectType: LookUpClass): void {
        this.selectedProjType = projectType;
        this.projectSearchOptions = getEndPointOptionsForProjects(this._commonService.baseUrl, this.selectedProjType?.code);
    }

    templateChanged(event: LookUpClass): void {
        this.createLocalObject.cmpSectionTemplates = this.cmpTemplateTypes[event?.code] || []
    }

    addNewEntity(entityName: string): void {
        this.entitySearchOptions = this._elasticConfig.getElasticForActiveEntity();
        this.entitySearchOptions.defaultValue = entityName;
        this.entityCreationModalObj.entityRequestFields.entityName = entityName;
        const NEW_ENTITY_DETAILS = new EntityRequestFields();
        NEW_ENTITY_DETAILS.entityName = entityName.trim();
        const ENTITY_CREATION_MODAL = new EntityCreationModalConfig();
        ENTITY_CREATION_MODAL.triggeredFrom = 'CMP_ADD';
        ENTITY_CREATION_MODAL.entityDetails = NEW_ENTITY_DETAILS;
        ENTITY_CREATION_MODAL.mandatoryFieldsList = ENTITY_MANDATORY_REPORTER_FIELDS;
        this._commonService.openNewEntityCreateModal(ENTITY_CREATION_MODAL);
    }

}
