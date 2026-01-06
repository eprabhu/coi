/** last updated by Aravind on 12-11-2019 **/

import { Component, OnInit, Input, OnChanges, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { slideInOut, fadeDown } from '../../common/utilities/animations';
import { ElasticConfigService } from '../../common/services/elastic-config.service';
import { WorkflowEngineService } from './workflow-engine.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { AWARD_ERR_MESSAGE, WORKFLOW_ADD_ALTERNATE_APPROVER_BUTTON, WORKFLOW_ADD_NEW_APPROVER_BUTTON, WORKFLOW_BYPASS_BUTTON, WORKFLOW_NEW_SEQUENTIAL_STOP_BUTTON, WORKFLOW_STATUS } from '../../app-locales';
import { Subject, Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { fileDownloader, hideModal, openModal, scrollIntoView } from '../../common/utilities/custom-utilities';
import { BypassRO, MapWorkFlow, Person, SequentialStop, WorkFlowAction, Workflow, WorkflowAttachment, WorkflowDetail, WorkflowLabels} from './workflow-engine-interface';
import { DateFormatPipeWithTimeZone } from '../../shared/pipes/custom-date.pipe';
import { environment } from '../../../environments/environment';

export interface BypassValidateAction {
    actiontype: string; 
    content: any;
}
// declare var $: any;
@Component({
    selector: 'workflow-engine2',
    templateUrl: './workflow-engine.component.html',
    styleUrls: ['./workflow-engine.component.css'],
    animations: [slideInOut, fadeDown],
    providers: [WorkflowEngineService]
})
export class WorkflowEngineComponent2 implements OnInit, OnChanges, OnDestroy {

    @Input() workFlowResult: any = {};
    @Input() workFlowDetailKey: any = {};
    @Input() workFlowLabels: WorkflowLabels;
    @Input() isByPassValidationNeeded = false;
    @Input() $byPassValidationEvent = new Subject<BypassValidateAction>();
    @Output() workFlowResponse: EventEmitter<any> = new EventEmitter<any>();
    @Output() errorEvent: EventEmitter<any> = new EventEmitter<any>();
    
    WORKFLOW_ADD_ALTERNATE_APPROVER_BUTTON = WORKFLOW_ADD_ALTERNATE_APPROVER_BUTTON;
    WORKFLOW_ADD_NEW_APPROVER_BUTTON = WORKFLOW_ADD_NEW_APPROVER_BUTTON;
    WORKFLOW_BYPASS_BUTTON = WORKFLOW_BYPASS_BUTTON;
    WORKFLOW_NEW_SEQUENTIAL_STOP_BUTTON = WORKFLOW_NEW_SEQUENTIAL_STOP_BUTTON;

    moduleDetails: any;
    elasticSearchOptions: any = {};
    versionHistorySelected: number;
    bypassReviewerRight: boolean;
    addApproverRight: boolean;
    latestVersion: any;
    clearField: String;
    workflowDetail: any = {};
    tempWorkflowStopList: any;
    isNonEmployee = false;
    currentPersonId: any;
    scoringCriteriaList: any = [];
    isShowEvaluationMap = true;
    $subscriptions: Subscription[] = [];
    stopMap = new Map();
    approverName = null;
    isSaving = false;
    isExpandall = false;
    isViewExpand = false;
    filteredScoringWithComments: any = [];
    workflowStartDate: number;
    workflowEndDate: number;
    workflowCreatedBy: string;
    DEFAULT_STOP_NAME = 'Stop ';
    routeLogAction: string;
    workFlowPerson: Person = new Person();
    validationMap = new Map();
    workFlowActionRO = new WorkFlowAction();
    showPersonCard = false;
    comment;
    mapWorkFlow = [];
    selectedMap;
    selectedMapIndex = -1;
    workFlowStatus = new Map();
    isExpandComment = new Map();
    statusBadgeStyleMapping = new Map();
    isAnimate = false;
    currentMapNumber;
    stopNames: any;
    actionLabelMap = new Map();
    mapStatusList = [];
    deployMap = environment.deployUrl;
    WORKFLOW_STATUS = WORKFLOW_STATUS;

    constructor(private _commonService: CommonService, private _workFlowService: WorkflowEngineService,
        private _elasticConfig: ElasticConfigService, public _dataFormatPipe: DateFormatPipeWithTimeZone) { }

    ngOnChanges() {
        if (this.workFlowResult) {
            if (this.workFlowResult.workflow) {
                this.latestVersion = this.versionHistorySelected = this.workFlowResult.workflow.workflowSequence;
            }
            this.getPermissions();
            this.currentPersonId = this._commonService.getCurrentUserDetail('personID');
            this.moduleDetails = this.workFlowResult[this.workFlowDetailKey];
            if (this.workFlowResult.workflow && this.workFlowResult.workflow.mapWorkFlow) {
                this.selectedMapIndex = -1;
                this.updateWorkflowStops(this.workFlowResult.workflow);
                this.navigateToNextMap();
            }
        }
    }

    ngOnInit() {
        this.setStatusMapping();
        this.setTextColorMapping();
        this.setModalHeaderLabel();
        this.getPermissions();
        this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
        this.currentPersonId = this._commonService.getCurrentUserDetail('personID');
        this.toggleAnimation();
        this.listenToOpenBypassModal();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
        this.clearWorkFlowAction();
    }

    private listenToOpenBypassModal(): void {
        this.$subscriptions.push(this.$byPassValidationEvent.subscribe((data: BypassValidateAction) => {
            if (data?.actiontype === 'OPEN_BYPASS_MODAL') {
                this.workFlowActionRO = data?.content?.workflow;
                this.routeLogAction = data?.content?.flag;
                this.tempWorkflowStopList = data?.content?.allApprovers;
                openModal('route-log-workflow-action-modal-container', { backdrop: 'static', keyboard: false, focus: true });
            }
        }));
    }

    // Gets label from status code
    private setStatusMapping(): void {
        this.workFlowStatus.set('A', this.workFlowLabels?.approved || WORKFLOW_STATUS.APPROVED);
        this.workFlowStatus.set('O', this.workFlowLabels?.approved || WORKFLOW_STATUS.APPROVED);
        this.workFlowStatus.set('R', this.workFlowLabels?.rejected || WORKFLOW_STATUS.REJECTED);
        this.workFlowStatus.set('J', this.workFlowLabels?.rejected || WORKFLOW_STATUS.REJECTED);
        this.workFlowStatus.set('B', this.workFlowLabels?.bypassed || WORKFLOW_STATUS.BYPASSED);
        this.workFlowStatus.set('K', this.workFlowLabels?.bypassed || WORKFLOW_STATUS.BYPASSED);
        this.workFlowStatus.set('T', this.workFlowLabels?.toBeSubmitted || WORKFLOW_STATUS.TO_BE_SUBMITTED);
        this.workFlowStatus.set('W', this.workFlowLabels?.pending || WORKFLOW_STATUS.PENDING);
        this.workFlowStatus.set('C', this.workFlowLabels?.withdrawn || WORKFLOW_STATUS.WITHDRAWN);
        this.workFlowStatus.set('P', this.workFlowLabels?.pending || WORKFLOW_STATUS.PENDING);
        this.workFlowStatus.set('X', this.workFlowLabels?.deactivated || WORKFLOW_STATUS.DEACTIVATED);
    }

    // Gets style from status code
    private setTextColorMapping(): void {
        this.statusBadgeStyleMapping.set('A', 'approved-badge');
        this.statusBadgeStyleMapping.set('O', 'approved-badge');
        this.statusBadgeStyleMapping.set('R', 'rejected-badge');
        this.statusBadgeStyleMapping.set('J', 'rejected-badge');
        this.statusBadgeStyleMapping.set('B', 'bypass-badge');
        this.statusBadgeStyleMapping.set('K', 'bypass-badge');
        this.statusBadgeStyleMapping.set('T', 'to-be-submitted-badge');
        this.statusBadgeStyleMapping.set('W', 'waiting-badge');
        this.statusBadgeStyleMapping.set('C', 'withdrawn-badge');
        this.statusBadgeStyleMapping.set('P', 'waiting-badge');
        this.statusBadgeStyleMapping.set('I', 'ignored-badge');
        this.statusBadgeStyleMapping.set('X', 'deactivate-badge');
    }

    /**
 * setting up of route log by separating workflow list w.r.t to the
 * workflow version selected
 */
    routeLogVersionChange(version: number): void {
        if (this.versionHistorySelected != version) {
            this.selectedMapIndex = -1;
            this.selectedMap = null;
            this.mapWorkFlow = [];
            this.versionHistorySelected = version;
            const WORKFLOW = this.workFlowResult.workflowList.find(workflow => workflow.mapWorkFlow && (workflow.workflowSequence.toString() === this.versionHistorySelected.toString()));
            if (WORKFLOW) {
                this.workFlowResult.workflow = WORKFLOW;
                this.updateWorkflowStops(WORKFLOW);
                this.navigateToNextMap();
            }
        }
    }

    // This function navigate to map depedning on last action made.
    navigateToNextMap(): void {
        let tempMap = JSON.parse(JSON.stringify(this.selectedMap))
        this.selectedMap = this.mapWorkFlow.find(el => el.mapNumber == this.currentMapNumber);
        if ((this.selectedMap.mapNumber != tempMap.mapNumber)) {
            this.toggleAnimation();
        }
    }

    toggleAnimation(): void {
        this.isAnimate = true;
        setTimeout(() => this.isAnimate = false, 350)
    }

    /**
     * Get rights for bypass and add alternate approver
     */
    getPermissions(): void {
        this.bypassReviewerRight = (this.workFlowResult.availableRights &&
            this.workFlowResult.availableRights.find(rights => rights === 'BYPASS_WORKFLOW')) ? true : false;
        this.addApproverRight = (this.workFlowResult.availableRights &&
            this.workFlowResult.availableRights.find(rights => rights === 'ADD_APPROVER_WORKFLOW')) ? true : false;
        this.isShowEvaluationMap = (this.workFlowDetailKey === 'proposal' &&
            this.workFlowResult.availableRights.find(rights => rights === 'VIEW_EVALUATION_ROUTE_LOG')) ? true : false;
    }

    switchMap(selectedMapIndex: number): void {
        let tempMap = this.selectedMap;
        this.selectedMapIndex = selectedMapIndex;
        this.updateWorkflowStops(this.workFlowResult.workflow);
        if ((this.selectedMap.mapNumber != tempMap.mapNumber)) {
            this.toggleAnimation();
        }
    }
    
    expandComment(i: number): void {
        this.isExpandComment.set(i, !this.isExpandComment.get(i));
    }

    /**
     * Included 2 new flags in resultArray.
     * Purpose of isLoginPerson : Users not having right to see evaluation panel but -
     * is a panel member have to see his stop and his comments.this flag determines the login person is able to see his stop.
     * isScoringPanel : used to differentiate between scoring and non scoring panel
     */
    setEvaluationFlags(): void {
        this.mapWorkFlow.forEach(element => {
            element = Object.assign(element, this.checkEvaluationFlags(element.mapNumber, element.sequentialStops));
        });
    }

    /**
     * @param  {} mapNumber
     * If the login person exist in any one of the evaluation panel-
     * then returns a true value. other wise returns a false value.
     * If the panel meber can score then returns true value.
     * otherwise returns a false value.
     */
    checkEvaluationFlags(mapNumber: number, stops: SequentialStop[]): { isLoginPerson: boolean, isScoringPanel: boolean } {
        let isLoginPerson = false, isScoringPanel = false;
        stops.forEach((stop) => {
            stop.allApprovers.forEach((approver) => {
                if (approver.workflowMap.mapType === 'E' && !isLoginPerson &&
                    approver.mapNumber === mapNumber && approver.approverPersonId == this.currentPersonId) {
                    isLoginPerson = true;
                }
                if (approver.workflowMap.mapType === 'E' && !isScoringPanel &&
                    approver.mapNumber === mapNumber && approver.isReviewerCanScore) {
                    isScoringPanel = true;
                }
            })
        })

        return { isLoginPerson, isScoringPanel };
    }

    /**
   * memberTypeChanged - calls elastic search according to member type selected
   * */
    memberTypeChanged(): void {
        this.clearField = new String('true');
        if (!this.isNonEmployee) {
            this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
        } else {
            this.elasticSearchOptions = this._elasticConfig.getElasticForRolodex();
        }
    }


    /**
     * Updates workflow stops w.r.t map number by creating an map array
     * and separating each workflow list w.r.t map number
     */
    updateWorkflowStops(WORKFLOW: Workflow): void {
        this.mapWorkFlow = WORKFLOW.mapWorkFlow || [];
        this.mapWorkFlow.sort((a, b) => a.mapNumber > b.mapNumber ? 1 : a.mapNumber < b.mapNumber ? -1 : 0);
        this.setHeaderDetails(WORKFLOW);
        this.mapActionCommentAndAttachment();
        this.setEvaluationFlags();
        this.updateSelectedMap();
    }

    updateSelectedMap(): void {
        this.setIgnoreMapStatus();
        this.selectedMap = this.mapWorkFlow[this.selectedMapIndex];
        this.stopNames = this.getAllStopName();
        this.scrollToWaitingStop();
    }

    private scrollToWaitingStop(): void {
        const WAITING_STOP_INDEX = this.selectedMap.sequentialStops.findIndex((ele: any) => ele.primaryApprovers.some((e: any) => e.approvalStatusCode === 'W'));
        if (WAITING_STOP_INDEX !== -1) {
            setTimeout(() => scrollIntoView(`route-log-stop-number-${WAITING_STOP_INDEX}`)
            );
        }
    }

    // R- returned map
    // C- withdrawn map
    // X- Deactivated map
    private setIgnoreMapStatus(): void {
        let index = this.mapStatusList.findIndex(status => ['R', 'C', 'X'].includes(status));
        if (index >= 0) {
            this.mapStatusList = this.mapStatusList.map((status, i) => {
                return (index < i) && status == 'T' ? 'I' : this.mapStatusList[i];
            });
        }
    }

    private setHeaderDetails(WORKFLOW: Workflow): void {
        if (WORKFLOW != null) {
            this.workflowStartDate = WORKFLOW.workflowStartDate;
            this.workflowEndDate = WORKFLOW.workflowEndDate;
            this.workflowCreatedBy = WORKFLOW.workflowCreatedBy;
        }
    }

    private mapActionCommentAndAttachment(): void {
        let templist = [];
        this.mapStatusList = [];
        this.prepareCommentsAndAttachments(templist);
        this.setMapNumberAndIndex(templist);
    }

    private setMapNumberAndIndex(templist: any[]) {
        const SORTED_TEMP_LIST = this.sortByDate(templist);
        const WAITING_STOP = SORTED_TEMP_LIST.find(e => e.approvalStatusCode === 'W');
        this.currentMapNumber = WAITING_STOP ? WAITING_STOP.mapNumber : SORTED_TEMP_LIST[0].mapNumber;
        if (this.selectedMapIndex === -1) {
            this.selectedMapIndex = this.mapWorkFlow.findIndex((ele: any) => ele.mapNumber === this.currentMapNumber);
        }
    }

    private prepareCommentsAndAttachments(templist: any[]) {
        this.mapWorkFlow.forEach((currentMap) => {
            this.mapStatusList.push(currentMap.mapStatus);
            this.setAttachmentAndComment(currentMap, templist);
        });
    }

    private setAttachmentAndComment(currentMap: MapWorkFlow, templist: WorkflowDetail[]): void {
        currentMap.sequentialStops.forEach((currentStop) => {
            templist.push(this.sortByDate(currentStop.allApprovers)[0]);
            currentStop.primaryApprovers.forEach((currentPrimaryPerson) => {
                this.setComment(currentPrimaryPerson);
                this.setAttachment(currentPrimaryPerson);
            });
        });
    }

    private setComment(currentPrimaryPerson: WorkflowDetail): void {
        const approverWithComment = this.getpersonFromAlternateApprover(currentPrimaryPerson, (el) => el.approvalComment);
        if (approverWithComment) {
            currentPrimaryPerson.approvalComment = approverWithComment.approvalComment;
        }
    }

    private setAttachment(currentPrimaryPerson: any) {
        const approverWithAttachments = this.getpersonFromAlternateApprover(currentPrimaryPerson, (el) => el.workflowAttachments.length > 0);
        if (approverWithAttachments) {
            currentPrimaryPerson.workflowAttachments = approverWithAttachments.workflowAttachments;
        }
    }

    getpersonFromAlternateApprover(currentPrimaryPerson, callBack) {
        return currentPrimaryPerson.alternateApprovers.find(callBack)
    }

    sortByDate(list: WorkflowDetail[]): WorkflowDetail[] {
        list.sort((a: WorkflowDetail, b: WorkflowDetail) => {
            let first: any, second: any;
            first = new Date(a.updateTimeStamp);
            second = new Date(b.updateTimeStamp);
            if (first > second) {
                return -1;
            }
            if (first < second) {
                return 1;
            }
            return 0;
        });
        return list;
    }

    //Opens common modal for workflow actions
    openWorkFlowActionModal(workflow: WorkFlowAction, flag: string, allApprovers: WorkflowDetail[]): void {
        if (flag === 'BYPASS_STOP' && this.isByPassValidationNeeded) {
            this.$byPassValidationEvent.next({ actiontype: 'BYPASS_STOP', content: { workflow, flag, allApprovers } });
        } else {
            this.workFlowActionRO = workflow;
            this.routeLogAction = flag;
            this.tempWorkflowStopList = allApprovers;
            openModal('route-log-workflow-action-modal-container', { backdrop: 'static', keyboard: false, focus: true });
        }
    }

    //Initiates workflow actions after confirmation from workflow actions modal
    workFlowAction(flag: string): void {
        if (this.validateWorkflowAction()) {
            switch (flag) {
                case 'NEW_APPROVER':
                    this.addAlternateApprover(this.workFlowActionRO, 'approver');
                    break;
                case 'ALTERNATE_APPROVER':
                    this.addAlternateApprover(this.workFlowActionRO, 'alternate');
                    break;
                case 'NEW_SEQUENTIAL_STOP':
                    this.addSequentialStop(this.workFlowActionRO);
                    break;
                case 'BYPASS_STOP':
                    this.bypassWorkFlow(this.workFlowActionRO);
                    break;
            }
        }
    }

    /**
 * @param  {} workFlowAction
 * Add alternate approver under the primary approver
 * and updates the workflow version and stops
 */
    addAlternateApprover(workFlowAction: WorkFlowAction, type: string): void {
        if (!this.isSaving && !this.duplicateCheckForApprover(workFlowAction) ) {
            this.isSaving = true;
            // this._commonService.isShowOverlay = true;
            this.$subscriptions.push(this._workFlowService.addAlternateApprover(this.setAlternateApproverROForAModule(workFlowAction, type)).subscribe((data: any) => {
                this.workFlowResponse.emit(data);
                this.latestVersion = this.workFlowResult.workflow.workflowSequence;
                this.updateWorkflowStops(this.workFlowResult.workflow);
                this.navigateToNextMap();
                if (type === 'approver') {
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'New Approver added successfully.');
                } else {
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Alternate Approver added successfully.');
                }
                this.clearWorkFlowAction();
                // this._commonService.isShowOverlay = false;
                this.isSaving = false;
            }, err => {
                if (err && err.status === 405) {
                    this.errorEvent.emit();
                } else {
                    if (type === 'approver') {
                        this._commonService.showToast(HTTP_ERROR_STATUS, (err && typeof err.error == 'string') ?
                            err.error : 'Adding New Approver failed. Please try again.');
                    } else {
                        this._commonService.showToast(HTTP_ERROR_STATUS, ' Adding Alternate Approver failed. Please try again.');
                    }
                }
                // this._commonService.isShowOverlay = false;
                this.isSaving = false;
            }
            ));
        } else {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Cannot add the same approver in the same stop.');
        }
        this.clearField = new String('true');
        this.elasticSearchOptions.defaultValue = '';
    }

    clearWorkFlowAction(): void {
        this.showPersonCard = false;
        this.workFlowActionRO = new WorkFlowAction();
        this.workFlowPerson = new Person();
        hideModal('route-log-workflow-action-modal-container');
        this.clearField = new String('true');
        this.elasticSearchOptions.defaultValue = '';
        this.comment = null;
        this.validationMap.clear();
    }

    /**
 * @param  {} workFlowAction
 * Check multiple insertion of approver by checking
 * both primary and alternate approvers
 */
    duplicateCheckForApprover(workFlowAction: WorkFlowAction): boolean {
        const isDuplicate = this.tempWorkflowStopList.filter(element =>
            element.approverPersonId === this.workFlowPerson.personId && element.mapNumber === workFlowAction.mapNumber
        );
        return isDuplicate.length > 0 ? true : false;
    }

    /**
     * @param  {} workFlowAction
     * Setting up of Alternate Approver Object
     */
    setAlternateApproverROForAModule(workFlowAction: WorkFlowAction, type: string): WorkFlowAction {
        switch (this.workFlowDetailKey) {
            case 'award':
                return this.setAlternateApproverObject(workFlowAction, '1', '0', '0', this.workFlowResult[this.workFlowDetailKey].awardId, type);
            case 'proposal':
                return this.setAlternateApproverObject(workFlowAction, '3', '0', '0', this.workFlowResult[this.workFlowDetailKey].proposalId, type);
            case 'task':
                return this.setAlternateApproverObject(workFlowAction, '1', '2', this.workFlowResult[this.workFlowDetailKey].taskId, this.workFlowResult[this.workFlowDetailKey].moduleItemId, type);
            case 'claim':
                return this.setAlternateApproverObject(workFlowAction, '14', '0', '0', this.workFlowResult[this.workFlowDetailKey].claimId, type);
            case 'awardProgressReport':
                return this.setAlternateApproverObject(workFlowAction, '16', '0', '0', this.workFlowResult[this.workFlowDetailKey].progressReportId, type);
            case 'agreementHeader':
                return this.setAlternateApproverObject(workFlowAction, '13', '0', '0', this.workFlowResult[this.workFlowDetailKey].agreementRequestId, type);
            case 'serviceRequest':
                return this.setAlternateApproverObject(workFlowAction, '20', '0', '0', this.workFlowResult[this.workFlowDetailKey].serviceRequestId, type);
            case 'opaDisclosure':
                return this.setAlternateApproverObject(workFlowAction, '23', '0', '0', this.workFlowResult[this.workFlowDetailKey].opaDisclosureId, type);
            case 'coiDisclosure':
                return this.setAlternateApproverObject(workFlowAction, '8', '0', '0', this.workFlowResult[this.workFlowDetailKey].disclosureId, type);
        }
    }

    setAlternateApproverObject(workFlowAction: WorkFlowAction, moduleCode: string, subModuleCode: string, subModuleItemKey: string, moduleItemKey: number, type: string): WorkFlowAction {
        let alternateApproverRO = new WorkFlowAction();
        alternateApproverRO.primaryApprover = type === 'approver' ? true : '';
        alternateApproverRO.workFlowId = this.workFlowResult.workflow.workflowId;
        alternateApproverRO.mapId = workFlowAction.mapId;
        alternateApproverRO.mapNumber = workFlowAction.mapNumber;
        alternateApproverRO.moduleCode = moduleCode;
        alternateApproverRO.moduleItemKey = moduleItemKey;
        alternateApproverRO.subModuleCode = subModuleCode;
        alternateApproverRO.subModuleItemKey = subModuleItemKey;
        alternateApproverRO.mapName = workFlowAction.mapName;
        alternateApproverRO.stopName = workFlowAction.stopName;
        alternateApproverRO.approvalStopNumber = workFlowAction.approvalStopNumber;
        alternateApproverRO.approverNumber = workFlowAction.approverNumber;
        alternateApproverRO.approverPersonId = this.workFlowPerson.personId;
        alternateApproverRO.mapDescription = workFlowAction.mapDescription;
        alternateApproverRO.note = this.comment;
        return alternateApproverRO;
    }

    addSequentialStop(workFlowAction: WorkFlowAction): void {
        if (!this.isSaving) {
            this.isSaving = true;
            // this._commonService.isShowOverlay = true;
            this.$subscriptions.push(this._workFlowService.addSequentialStop(this.getSequentialStopROForModule(workFlowAction)).subscribe((data: any) => {
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'New Sequential Stop added successfully.');
                this.workFlowResponse.emit(data);
                // this._commonService.isShowOverlay = false;
                this.latestVersion = this.workFlowResult.workflow.workflowSequence;
                this.updateWorkflowStops(this.workFlowResult.workflow);
                this.isSaving = false;
                this.clearWorkFlowAction();
            }, err => {
                if (err && err.status === 405) {
                    this.errorEvent.emit();
                } else {
                    this._commonService.showToast(HTTP_ERROR_STATUS, (err && typeof err.error == 'string') ?
                        err.error : 'Adding sequential stop failed. Please try again.');
                }
                this.isSaving = false;
                // this._commonService.isShowOverlay = false;
            }));
        }
    }

    getSequentialStopROForModule(workFlowAction: WorkFlowAction): WorkFlowAction {
        switch (this.workFlowDetailKey) {
            case 'award':
                return this.setSequentialStopRO(workFlowAction, '1', '0', '0', this.workFlowResult[this.workFlowDetailKey].awardId);
            case 'proposal':
                return this.setSequentialStopRO(workFlowAction, '3', '0', '0', this.workFlowResult[this.workFlowDetailKey].proposalId);
            case 'task':
                return this.setSequentialStopRO(workFlowAction, '1', '2',
                    this.workFlowResult[this.workFlowDetailKey].taskId, this.workFlowResult[this.workFlowDetailKey].moduleItemId);
            case 'claim':
                return this.setSequentialStopRO(workFlowAction, '14', '0', '0', this.workFlowResult[this.workFlowDetailKey].claimId);
            case 'awardProgressReport':
                return this.setSequentialStopRO(workFlowAction, '16', '0', '0', this.workFlowResult[this.workFlowDetailKey].progressReportId);
            case 'agreementHeader':
                return this.setSequentialStopRO(workFlowAction, '13', '0', '0', this.workFlowResult[this.workFlowDetailKey].agreementRequestId);
            case 'serviceRequest':
                return this.setSequentialStopRO(workFlowAction, '20', '0', '0', this.workFlowResult[this.workFlowDetailKey].serviceRequestId);
            case 'opaDisclosure':
                return this.setSequentialStopRO(workFlowAction, '23', '0', '0', this.workFlowResult[this.workFlowDetailKey].opaDisclosureId);
            case 'coiDisclosure':
                return this.setSequentialStopRO(workFlowAction, '8', '0', '0', this.workFlowResult[this.workFlowDetailKey].disclosureId);
        }
    }

    setSequentialStopRO(workFlowAction: WorkFlowAction, moduleCode: string, subModuleCode: string, subModuleItemKey: string, moduleItemKey: number): WorkFlowAction {
        let sequentialStopRO = new WorkFlowAction();
        sequentialStopRO.workFlowId = this.workFlowResult.workflow.workflowId;
        sequentialStopRO.mapId = workFlowAction.mapId;
        sequentialStopRO.mapNumber = workFlowAction.mapNumber;
        sequentialStopRO.mapName = workFlowAction.mapName;
        sequentialStopRO.stopName = this.DEFAULT_STOP_NAME;
        sequentialStopRO.moduleCode = moduleCode;
        sequentialStopRO.moduleItemKey = moduleItemKey;
        sequentialStopRO.subModuleCode = subModuleCode;
        sequentialStopRO.subModuleItemKey = subModuleItemKey;
        sequentialStopRO.approverNumber = 1;
        sequentialStopRO.primaryApprover = true;
        sequentialStopRO.updateUser = this._commonService.getCurrentUserDetail('userName');
        sequentialStopRO.personId = this._commonService.getCurrentUserDetail('personID');
        sequentialStopRO.approverPersonId = this.workFlowPerson.personId;
        sequentialStopRO.note = this.comment;
        return sequentialStopRO;
    }

    bypassWorkFlow(workflow: WorkFlowAction) {
        if (!this.isSaving) {
            this.isSaving = true;
            // this._commonService.isShowOverlay = true;
            const {approveFormData, moduleCode} = this.setFormDataForBypassRO(this.getBypassRO(workflow));
            this.$subscriptions.push(this._workFlowService.maintainWorkFlow(approveFormData, moduleCode).subscribe((data: any) => {
                this.workFlowResponse.emit(data);
                this.latestVersion = this.workFlowResult.workflow.workflowSequence;
                this.updateWorkflowStops(this.workFlowResult.workflow);
                this.navigateToNextMap();
                if (!data.messageType) {
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Reviewer bypassed successfully.');
                }
                this.clearWorkFlowAction();
                // this._commonService.isShowOverlay = false;
                this.isSaving = false;
            }, err => {
                this.clearWorkFlowAction();
                // this._commonService.isShowOverlay = false;
                this.isSaving = false;
                if (err.error && err.error.errorMessage === 'Deadlock') {
                    this._commonService.showToast(HTTP_ERROR_STATUS, `Action failed as another update is being processed in current document.
              Please click bypass again. If error persistent after 2 mins, ${AWARD_ERR_MESSAGE} for assistance`);
                } else if (err && err.status === 405) {
                    this.errorEvent.emit();
                } else {
                    this._commonService.showToast(HTTP_ERROR_STATUS, `Action cannot be completed due to a system error.
                ${AWARD_ERR_MESSAGE} for assistance.`);
                }
            }));
        }
    }


    getBypassRO(workFlowAction: WorkFlowAction): BypassRO {
        let bypassRO = new BypassRO();
        bypassRO.actionType = 'B';
        bypassRO.workFlowPersonId = workFlowAction.approverPersonId;
        bypassRO.approverStopNumber = workFlowAction.approvalStopNumber;
        bypassRO.mapNumber = workFlowAction.mapNumber;
        bypassRO.mapId = workFlowAction.mapId;
        bypassRO.approverNumber = workFlowAction.approverNumber;
        bypassRO.personId = this._commonService.getCurrentUserDetail('personID');
        bypassRO.approveComment = this.comment;
        bypassRO.updateUser = this._commonService.getCurrentUserDetail('userName');
        switch (this.workFlowDetailKey) {
            case 'award':
                bypassRO.moduleItemKey = this.workFlowResult[this.workFlowDetailKey].awardId;
                bypassRO.awardId = this.workFlowResult[this.workFlowDetailKey].awardId;
                bypassRO.awardNumber = this.workFlowResult[this.workFlowDetailKey].awardNumber;
                break;
            case 'proposal':
                bypassRO.moduleItemKey = this.workFlowResult[this.workFlowDetailKey].proposalId;
                bypassRO.proposalId = this.workFlowResult[this.workFlowDetailKey].proposalId;
                break;
            case 'task':
                bypassRO.moduleItemId = this.workFlowResult[this.workFlowDetailKey].moduleItemId;
                bypassRO.taskId = this.workFlowResult[this.workFlowDetailKey].taskId;
                bypassRO.moduleItemKey = this.workFlowResult[this.workFlowDetailKey].moduleItemKey;
                bypassRO.endModuleSubItemKey = this.workFlowResult[this.workFlowDetailKey].endModuleSubItemKey;
                break;
            case 'claim':
                bypassRO.claimId = this.workFlowResult[this.workFlowDetailKey].claimId;
                break;
            case 'awardProgressReport':
                bypassRO.progressReportId = this.workFlowResult[this.workFlowDetailKey].progressReportId;
                break;
            case 'agreementHeader':
                bypassRO.moduleItemId = this.workFlowResult[this.workFlowDetailKey].moduleItemId;
                bypassRO.agreementRequestId = this.workFlowResult[this.workFlowDetailKey].agreementRequestId;
                bypassRO.moduleItemKey = this.workFlowResult[this.workFlowDetailKey].moduleItemKey;
                bypassRO.endModuleSubItemKey = this.workFlowResult[this.workFlowDetailKey].endModuleSubItemKey;
                break;
            case 'serviceRequest':
                bypassRO.serviceRequestId = this.workFlowResult[this.workFlowDetailKey].serviceRequestId;
                break;
            case 'opaDisclosure':
                bypassRO.opaDisclosureId = this.workFlowResult[this.workFlowDetailKey].opaDisclosureId;
                bypassRO.opaDisclosureNumber = this.workFlowResult[this.workFlowDetailKey].opaDisclosureNumber;
                break;
            case 'coiDisclosure':
                bypassRO.coiDisclosureId = this.workFlowResult[this.workFlowDetailKey].disclosureId;
                bypassRO.coiDisclosureNumber = this.workFlowResult[this.workFlowDetailKey].disclosureNumber;
                break;
        }
        return bypassRO
    }

    setFormDataForBypassRO(bypassRO: BypassRO): any {
        const approveFormData = new FormData();
        let moduleCode = '';
        approveFormData.append('formDataJson', JSON.stringify(bypassRO));
        switch (this.workFlowDetailKey) {
            case 'award': {
                moduleCode = '1';
                approveFormData.append('moduleCode', '1');
                approveFormData.append('subModuleCode', '0');
            } break;
            case 'proposal': {
                moduleCode = '3';
                approveFormData.append('moduleCode', '3');
                approveFormData.append('subModuleCode', '0');
            } break;
            case 'task': {
                moduleCode = '1';
                approveFormData.append('moduleCode', '1');
                approveFormData.append('subModuleCode', '2');
            } break;
            case 'claim': {
                moduleCode = '14';
                approveFormData.append('moduleCode', '14');
                approveFormData.append('subModuleCode', '0');
            } break;
            case 'awardProgressReport': {
                moduleCode = '16';
                approveFormData.append('moduleCode', '16');
                approveFormData.append('subModuleCode', '0');
            } break;
            case 'agreementHeader': {
                moduleCode = '13';
                approveFormData.append('moduleCode', '13');
                approveFormData.append('subModuleCode', '0');
            } break;
            case 'serviceRequest': {
                moduleCode = '20';
                approveFormData.append('moduleCode', '20');
                approveFormData.append('subModuleCode', '0');
            } break;
            case 'opaDisclosure': {
                moduleCode = '23';
                approveFormData.append('moduleCode', '23');
                approveFormData.append('subModuleCode', '0');
            } break;
            case 'coiDisclosure': {
                moduleCode = '8';
                approveFormData.append('moduleCode', '8');
                approveFormData.append('subModuleCode', '0');
            } break;
            default: break;
        }
        return {'approveFormData': approveFormData, 'moduleCode': moduleCode};
    }

    validateWorkflowAction(): boolean {
        this.validationMap.clear();
        if (!this.comment) {
            this.validationMap.set('actionComment', '* Please add comments.');
        }
        if (this.workFlowPerson && !this.workFlowPerson.personId && this.routeLogAction != 'BYPASS_STOP') {
            this.validationMap.set('approver', '*Please specify a approver.');
        }
        return this.validationMap.size == 0;
    }



    selectedWorkFlowPerson(event: any): void {
        this.showPersonCard = event != null;
        this.workFlowPerson = new Person();
        if (event) {
            this.workFlowPerson.personId = event.prncpl_id;
            this.workFlowPerson.emailAddress = event ? event.email_addr : null;
            this.workFlowPerson.name = event ? event.full_name : null;
            this.workFlowPerson.phoneNumber = event ? event.phone_nbr : null;
            this.workFlowPerson.primaryTitle = event ? event.primary_title : null;
            this.workFlowPerson.isExternalUser = event.external == "Y" ? true : false;
            this.workFlowPerson.homeUnit = event.unit_display_name;
        }
    }

    downloadRouteAttachment(attachment: WorkflowAttachment): void {
        this.$subscriptions.push(this._workFlowService.downloadRoutelogAttachment(attachment.attachmentId)
            .subscribe(
                data => {
                    fileDownloader(data, attachment.fileName);
                }));
    }

    /**
     * fetchscoring criteia from workflow person
     */
    fetchScoringCriterias(WorkflowpersonId: number, workflowDetailId: number): void {
        this.scoringCriteriaList = [];
        const RequestObject = {
            'grantCallId': this.workFlowResult.grantCall.grantCallId,
            'personId': WorkflowpersonId,
            'proposalId': this.workFlowResult.proposal.proposalId,
            'workflowDetailId': workflowDetailId
        };
        this.$subscriptions.push(this._workFlowService.fetchScoringCriteriaByProposal(RequestObject)
            .subscribe((data: any) => {
                this.scoringCriteriaList = data.workflowReviewerScores || [];
                this.scoringCriteriaList[0].isOpen = !this.scoringCriteriaList[0].workflowReviewerComments.length ? false : true;
                this.isViewExpand = this.scoringCriteriaList.find(criteria => criteria.workflowReviewerComments.length) ? true : false;
                this.filteredScoringWithComments = [];
                this.checkConditionArray();
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching scoring criteria failed. Please try again.');
            }));
    }

    /**
    * @param  {} attachment
    * service to download attachment in score card in workflow
    */
    downloadAttachments(attachment: any): void {
        if (attachment.workflowReviewerAttmntsId != null) {
            this.$subscriptions.push(this._workFlowService.downloadWorkflowReviewerAttachment(attachment.workflowReviewerAttmntsId)
                .subscribe(data => {
                    fileDownloader(data, attachment.fileName);
                }));
        } else {
            const URL = 'data:' + attachment.mimeType + ';base64,' + attachment.attachment;
            const a = document.createElement('a');
            a.href = URL;
            a.download = attachment.fileName;
            document.body.appendChild(a);
            a.click();
        }
    }

    scrollToComments(criteriaIndex: number) {
        if (this.scoringCriteriaList[criteriaIndex].isOpen) {
            setTimeout(() => {
                const ITEM = document.getElementById('comment' + criteriaIndex);
                ITEM.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
    }

    toggleComments(): void {
        this.isExpandall = !this.isExpandall;
        this.scoringCriteriaList.map(item => item.isOpen = this.isExpandall ? true : false);
    }

    getBadgeByStatusCode(statusCode: string) {
        if (statusCode === '3') {
            return 'success';
        } else if (statusCode === '2') {
            return 'danger';
        } else if (statusCode === '1') {
            return 'warning';
        } else {
            return 'info';
        }
    }

    /**
     * for checking the condition to show collapse button or expand button
     */
    checkConditionArray(): void {
        if (!this.filteredScoringWithComments.length) {
            this.filteredScoringWithComments = this.scoringCriteriaList.filter((element: any) =>
                element.workflowReviewerComments.length);
        }
        this.isExpandall = this.filteredScoringWithComments.length && this.filteredScoringWithComments.every((element: any) => element.isOpen);
    }

    /**
     * Filter Workflow based on Map Number
     */
    getMapListBasedOnMapNumber(mapNumber: number): WorkflowDetail[] {
        if (this.workFlowResult.workflow) {
            return this.workFlowResult.workflow.workflowDetails.filter((e) => e.mapNumber === mapNumber);
        }
    }

    /**
 * @param  {} allApprovers
 * returns true if selected stop contains waiting for approval or to be submitted else false
 */
    isStopActive(allApprovers: WorkflowDetail[]): boolean {
        let activeList: any = [];
        let workflow = this.workFlowResult[this.workFlowDetailKey]
        switch (this.workFlowDetailKey) {
            case 'award':
                activeList = allApprovers.filter(e => this.isPendingOrToBeSubmitted(e) && workflow.awardWorkflowStatus.workflowAwardStatusCode === '2'
                );
                break;
            case 'proposal':
                activeList = allApprovers.filter(e => this.isPendingOrToBeSubmitted(e) && (workflow.statusCode === 2 || workflow.statusCode === 8) && workflow.documentStatusCode != '2'
                );
                break;
            case 'task':
                activeList = allApprovers.filter(e => this.isPendingOrToBeSubmitted(e) && (workflow.taskStatusCode == 3));
                break;
            case 'claim':
                activeList = allApprovers.filter(e => this.isPendingOrToBeSubmitted(e) && (workflow.claimStatus.claimStatusCode == 3)
                );
                break;
            case 'awardProgressReport':
                activeList = allApprovers.filter(e => this.isPendingOrToBeSubmitted(e) && (workflow.progressReportStatusCode == 3));
                break;
            case 'agreementHeader':
                activeList = allApprovers.filter(e => this.isPendingOrToBeSubmitted(e) && (workflow.agreementStatusCode == 5)
                );
                break;
            case 'serviceRequest':
                activeList = allApprovers.filter(e => this.isPendingOrToBeSubmitted(e) && (workflow.statusCode == 2));
                break;
            case 'opaDisclosure':
                activeList = allApprovers.filter(e => this.isPendingOrToBeSubmitted(e) && (workflow.reviewStatusCode.toString() === '9'));
                break;
            case 'coiDisclosure':
                activeList = allApprovers.filter(e => this.isPendingOrToBeSubmitted(e) && (workflow.reviewStatusCode.toString() === '9'));
                break;

        }
        return activeList.length > 0 ? true : false;
    }

    isPendingOrToBeSubmitted(e): boolean {
        return ['W', 'T'].includes(e.workflowStatus.approveStatusCode);
    }

    focusVersionButton(): void {
        let button = document.getElementById('route-log-version-button');
        if (button) {
            button.focus();
            button.click();
        }
    }

    setModalHeaderLabel(): void {
        this.actionLabelMap.set('ALTERNATE_APPROVER', WORKFLOW_ADD_ALTERNATE_APPROVER_BUTTON);
        this.actionLabelMap.set('NEW_APPROVER', WORKFLOW_ADD_NEW_APPROVER_BUTTON);
        this.actionLabelMap.set('NEW_SEQUENTIAL_STOP', WORKFLOW_NEW_SEQUENTIAL_STOP_BUTTON);
        this.actionLabelMap.set('BYPASS_STOP', WORKFLOW_BYPASS_BUTTON);
    }

    //Below section set labels for screen reader
    getAllStopName(): string {
        return this.selectedMap.sequentialStops.map((stop) => this.removeCommasInFullName(stop.stopName ? stop.stopName : this.DEFAULT_STOP_NAME + stop.stopNumber )).join('. ');
    }
    getApproverScreenReaderLabel(primaryApprover): string {
        let screeReaderLabel = `${this.getApproverDetails(primaryApprover, 'primary Approver')} status is ${this.workFlowStatus.get(primaryApprover.approvalStatusCode)}.`;
        const numAlternateApprovers = primaryApprover.alternateApprovers.length;
        if (numAlternateApprovers > 0) {
            screeReaderLabel = `${screeReaderLabel} Have ${numAlternateApprovers} alternate approver: ${this.getAlternateApproverNames(primaryApprover.alternateApprovers)}.`;
        }
        return screeReaderLabel;
    }

    getAlternateApproverNames(alternateApprovers: WorkflowDetail[]): string {
        return alternateApprovers.map((approver) => {
            let alternateApproverName = this.getApproverDetails(approver, '');
            return alternateApproverName;
        }).join(' , ');
    }

    private getApproverDetails(approver: WorkflowDetail, approverType: string): string {
        let label = '';
        if (approver.note) {
            label = 'Adhoc approver';
        }
        label += ` ${approverType} ${this.removeCommasInFullName(approver.approverPersonName)}.`
        if (approver.delegatedPersonName) {
            label = ` ${label} Delegate of ${approver.delegatedPersonName},`;
        }
        if (approver.workflowDetailExt && approver.workflowDetailExt.feedbackTypeCode) {
            label += ` Overall comment is ${approver.workflowDetailExt.workflowFeedbackType.description}.`;
        }
        return label;
    }

    getCommentScreenReaderLabel(primaryApprover: WorkflowDetail): string {
        const date = this._dataFormatPipe.transform(primaryApprover.updateTimeStamp, 'screen-reader-datetime');
        return `on ${date}. ${this.removeCommasInFullName(primaryApprover.updateUserFullName)} commented that ${primaryApprover.approvalComment}.`;
    }

    getScreenReaderLabelForCommentAttachments(primaryApprover: WorkflowDetail): string {
        return `Have ${primaryApprover.workflowAttachments.length} attachments.`
    }

    removeCommasInFullName(name: string): string {
        return name.split(',').join(' ');
    }

    setScreenReaderForCommentContent(): string {
        if (this.comment) {
            return `you have commented that. ${this.comment}`
        } else {
            return `add comment here`
        }

    }

}
