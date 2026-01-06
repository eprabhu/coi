import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../app/common/services/common.service';
import { CommonModalConfig } from '../../shared-components/common-modal/common-modal.interface';
import { Observable, of, Subject } from 'rxjs';
import { FormBuilderEvent } from '../../configuration/form-builder-create/shared/form-builder-view/form-builder-interface';
import { catchError } from 'rxjs/operators';
import { TRAVEL_FUNDING_TYPE_CODE } from '../../app-constants';
import { CoiStepsNavConfig } from '../../shared-components/coi-steps-navigation/coi-steps-navigation.component';
import { COIMatrix } from './engagement-interface';
import { COIFormValidation } from '../../common/services/coi-common.interface';

export const LEAVE_PAGE_AND_COMPLETE = 'Leave Page and Mark as Complete';

@Injectable()
export class EntityDetailsService {

  globalSave$: Subject<any> = new Subject<any>(); // to save questionnaire
  isRelationshipQuestionnaireChanged = false; //to track changes in questionnaire details.
  isAdditionalDetailsChanged = false; //to track changes in SFI details
  isMatrixChanged = false; //to track changes in SFI details

  $openQuestionnaire = new Subject(); //to open questionnaire
  $saveQuestionnaireAction = new Subject(); //to trigger save action in questionnaire.
  $addOrDeleteRelation = new Subject(); //to trigger add or delete action in SFI details.
  canMangeSfi = false; //to check SFI edit permission.
  unSavedSections = []; //to store unsaved section details/
  relationshipCompletedObject: any = {}; // to store relationship code for complete and incomplete questionnaire.
  concurrentUpdateAction = ''; //store concurrent action
  activeRelationship : any; // active relationship type code.
  definedRelationships = []; //currently added relationships details.
  uniqueTabDetials = []; //for storing combined tabs in case of matrix type
  allAvailableRelationships = []; //relationship lookup
  remainingRelationships = []; //remaining relationship lookup
  $triggerAddRelationModal = new Subject(); //to open add relationship modal.
  $emitUnsavedChangesModal = new Subject() // to open unsaved changes modal
  activeTab: 'QUESTIONNAIRE' | 'RELATION_DETAILS' | 'HISTORY' | 'RELATED_DISCLOSURES' = 'RELATION_DETAILS'; //currently active Tab
  toBeActiveTab: 'QUESTIONNAIRE' | 'RELATION_DETAILS' | 'HISTORY' | 'RELATED_DISCLOSURES'; //currently selected tab to set as active.
  currentVersionDetails: any = {}; //store current version details
  currentRelationshipQuestionnaire: any; // currently selected questionnaire
  groupedRelations = {}; //grouped available relations
  isVersionChange = false; //to track version change
  $triggerAddRelation = new Subject(); //to open add relation.
  $updateHistory = new Subject(); //to update history.
  selectedDisclosureTypes = [];
  remainingSelectedDisclosureTypes = []; //remaining relationship lookup
  availableDisclType = [];
  perEntDisclTypeSelections = [];
  canShowMatrixForm = false;
  isNoFormType = false;
  isCommitmentTabAvailable = true;

  //form related variables
    formBuilderEvents = new Subject<FormBuilderEvent>();
    isFormBuilderDataChangePresent = false;
    triggerSaveComplete = new Subject<boolean>();
    formBuilderId: number = null;
    triggerForApplicableForms: Subject<any> = new Subject<any>();
    triggerFormId: Subject<any> = new Subject<any>();
    formStatusMap = new Map();
    answeredFormId: number;
    activeFormId = null;
    currentFormId = null;
    engagementValidation = new COIFormValidation();
    validationList = [];
    isMandatoryComponentAvailable = false;
    isFormCompleted = false;
    formSavingConfirmationId = 'LEAVE_WITHOUT_SAVING_FORM';
    modalConfig = new CommonModalConfig(this.formSavingConfirmationId, 'Stay On Page', 'Leave Page', '');
    isShowRelationshipDetailsTab = false;
    navigateUrl = '';
    isFormDataChanged = false;
    unsavedChangesSecndryBtn = 'Leave Page';
    formListData = [];
    hiddenUnSaveChnagesBtn = 'hidden-unsaved-changes-button';
    isAllQuestionnaireCompleted = false;
    stepsNavBtnConfig = new CoiStepsNavConfig();
    isMatrixComplete = false;
    isOnlyUnCompensatedAvailable = false;
    matrixResponse: COIMatrix[];
    isSFIMinRangeSelected = false;
    clikcedTab = '';
    isChangeinMatrix = false;

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  getSFIDetails(coiFinancialEntityId) {
    return this._http.get(`${this._commonService.baseUrl}/getSFIDetails/${coiFinancialEntityId}`);
  }

  checkFormCompleted(personEntityId) {
    return this._http.patch(`${this._commonService.baseUrl}/personEntity/checkFormCompleted/${personEntityId}`, {});
  }

  saveOrUpdateCoiFinancialEntityDetails(params) {
    return this._http.post(this._commonService.baseUrl + '/personEntity/addRelationship', params);
  }

  activateAndInactivateSfi(prams) {
    return this._http.put(this._commonService.baseUrl + '/personEntity/activateInactivate', prams);
  }

  async addSFILookUp(): Promise<any> {
    return this._http.get(`${this._commonService.baseUrl}/getRelationshipLookup`).toPromise();
  }

  getCoiEntityDetails(personEntityId) {
    return this._http.get(`${this._commonService.baseUrl}/getCoiEntityDetails/${personEntityId}`);
  }

  getRelationshipEntityDetails(personEntityId) {
    return this._http.get(`${this._commonService.baseUrl}/personEntity/${personEntityId}`);
  }

  fetchDisclosureQuestionType(personEntityId) {
    return this._http.get(`${this._commonService.baseUrl}/personEntity/fetchPerEntDisclTypeSelection/${personEntityId}`);
  }

loadSFILookups() {
    return this._http.get(this._commonService.baseUrl + '/loadSFILookups');
  }

  async loadUnifiedTypeLookups() {
    return this._http.get(this._commonService.baseUrl + '/loadSFILookups').toPromise();
  }

  entityRisk(params) {
    return this._http.post(this._commonService.baseUrl + '/entity/modifyRisk', params);
  }

  riskHistory(entityId) {
    return this._http.get(`${this._commonService.baseUrl}/entity/riskHistory/${entityId}`);
  }

  deletePersonEntityRelationship(personEntityRelId, personEntityId) {
    return this._http.delete(`${this._commonService.baseUrl}/personEntity/relationship/${personEntityRelId}/${personEntityId}`);
  }

  getApplicableQuestionnaire(requestObject: any) {
    return this._http.post(this._commonService.fibiUrl + '/getApplicableQuestionnaire', requestObject);
  }

  updateAdditionalDetails(params) {
    return this._http.put(this._commonService.baseUrl + '/personEntity', params);
  }

  modifyPersonEntity(params) {
    return this._http.post(this._commonService.baseUrl + '/personEntity/modify', params);
  }

  sfiHistory(params) {
    return this._http.post(this._commonService.baseUrl + '/personEntity/history', params);
  }

  getSfiVersion(personEntityNumber) {
    return this._http.get(`${this._commonService.baseUrl}/personEntity/versions/${personEntityNumber}`);
  }

  riskAlreadyModified(params: any) {
    return this._http.post(`${this._commonService.baseUrl}/entity/riskStatus`, params);
 }

 fetchMatrixJSON(personEntityId: any) {
    return this._http.get(`${this._commonService.baseUrl}/matrix/fetchMatrix/${personEntityId}`);
 }

 saveMatrixForm(params: any) {
    return this._http.post(`${this._commonService.baseUrl}/matrix/saveOrUpdateMatrixAnswer`, params);
 }

 evaluateOPAQuestionnaire(personEntityId: string | number): Observable<any> {
    return this._http.get(`${this._commonService.baseUrl}/opa/evaluateOPAQuestionnaire/${personEntityId}`);
}

evaluateFCOIMatrix(personEntityId: string | number): Observable<any> {
    return this._http.get(`${this._commonService.baseUrl}/matrix/evaluateMatrix/${personEntityId}`);
}

evaluateFormResponse(reqObj: FormValidationRO): Observable<any> {
    return this._http.post(`${this._commonService.baseUrl}/evaluateFormResponse`, reqObj).pipe(catchError(err => of({ error: 'Error in evaluating form' })));;
}

createTravelDisclosure(travelDisclosureRO: object): Observable<any> {
    return this._http.post(`${this._commonService.baseUrl}/travel/create`, travelDisclosureRO);
}

withdrawDisclosure(params: any) {
    return this._http.post(`${this._commonService.baseUrl}/withdrawDisclosure`, params);
}

withdrawRequest(params: any) {
    return this._http.post(`${this._commonService.baseUrl}/fcoiDisclosure/requestWithdrawal`, params);
}

deletePersonEntityIfUnifiedQuestionnaire(perEntDisclTypeSelectedId, personEntityId) {
    return this._http.delete(`${this._commonService.baseUrl}/personEntity/unifiedRelationship/${perEntDisclTypeSelectedId}/${personEntityId}`);
}

    updateEngRelation(params: any): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/personEntity/updateEngRelation`, params);
    }

    relatedTravelDisclosure(engagementNumber: number | string): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/travel/relatedDisclosures/${engagementNumber}`);
    }

    getCompensatedAmount(engagementId: number | string): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/personEntity/compensationAmount/${engagementId}`);
    }

    evaluateSFI(engagementId: number | string): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/personEntity/evaluateSfi/${engagementId}`);
    }

    saveCompensatedAmount(engagementId: number | string, amount: number): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/personEntity/compensationAmount`, {compensationAmount: amount, personEntityId: engagementId});
    }

    clearServiceVariable() {
        this.isRelationshipQuestionnaireChanged = false;
        this.isAdditionalDetailsChanged = false;
        this.isFormDataChanged = false;
        this.isMatrixChanged = false;
        this.validationList = [];
        this.unSavedSections = [];
        this.isMandatoryComponentAvailable = false;
        this.isFormCompleted = true;
    }
}

export class ValidateFormRO {
    formBuilderIds: (number | string)[];
    moduleItemCode: number | string;
    moduleSubItemCode: number | string;
    moduleItemKey: number | string;
    moduleSubItemKey: number | string;
}

export class TravelRO {
    personEntityId: number | string;
    entityId: number | string;
    entityNumber: number | string;
    travelerFundingTypeCode = TRAVEL_FUNDING_TYPE_CODE.EXTERNAL;
    travelDisclosureId = null;
}

export class FormValidationRO {
    moduleItemCode: number | string;
    moduleSubItemCode: number | string;
    moduleSubItemKey: number | string;
    moduleItemKey: number | string;
}

export class DisclosureType {
    coiDisclosureType: any;
    dataCapturingTypeCode: string | number | null;
    disclosureTypeCode: string | number | null;
    id: number;
    perEntDataCapturingType: any;
    personEntityId: number;
    updateTimestamp: number;
    updatedBy: string;
}

export class PersonEntityRelationships {
    personEntityRelId: number;
    personEntityId: number;
    personEntity: number | string;
    validPersonEntityRelTypeCode: number;
    validPersonEntityRelType = new ValidPersonEntityRelType();
    questionnaireAnsHeaderId: number | string;
    description: number | string;
    startDate: number | string;
    endDate: number | string;
    isActive: number | string;
    isSystemCreated: number | string;
    updateTimestamp: number;
    updateUser: string;
    perEntDisclTypeSelections: number | string;
    disclTypeCodes: number | string;
    validPersonEntityRelTypeCodes: number | string;
}

export class ValidPersonEntityRelType {
    validPersonEntityRelTypeCode: number;
    disclosureTypeCode: string;
    coiDisclosureType: CoiDisclosureType;
    relationshipTypeCode: string;
    personEntityRelType = new PersonEntityRelType();
    description: string;
    questionnaireNumber: number | string;
    isActive: boolean;
    updateTimestamp: number;
    updateUser: string;
}

export class CoiDisclosureType {
    disclosureTypeCode: string;
    description: string;
    dataCapturingTypeCode: number;
    perEntDataCapturingType = new PerEntDataCapturingType();
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
}

export class PerEntDataCapturingType {
    dataCapturingTypeCode: string;
    description: string;
    updateTimestamp: number;
    updatedBy: string;
    isActive: boolean;
}

export class PersonEntityRelType {
    relationshipTypeCode: string;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
}
