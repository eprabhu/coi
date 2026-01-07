import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProposalService } from '../../services/proposal.service';
import { DataStoreService } from '../../services/data-store.service';
import { AutoSaveService } from '../../../common/services/auto-save.service';
import { Subscription } from 'rxjs';
import { EvaluationService } from '../evaluation.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { Router } from '@angular/router';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';

declare var $: any;

@Component({
    selector: 'app-proposal-evaluation',
    templateUrl: './proposal-evaluation.component.html',
    styleUrls: ['./proposal-evaluation.component.css']
})
export class ProposalEvaluationComponent implements OnInit, OnDestroy {

    result: any = {};
    isViewMode = true;
    isGrantAdmin = false;
    checkAll = false;
    isCanScoreMultiple = false;
    isAddPanelMember = false;
    isPanelMemberRepeated = false;
    isPanelMemberValid = false;
    tempPanel: any;
    tempIndex = null;
    clearField: String;
    evaluationType: string;
    proposalEvaluationPanelsList: any = [];
    elasticSearchOptions: any = {};
    panelMemberObj: any = {};
    dataDependencies = ['proposal', 'availableRights', 'dataVisibilityObj'];
    $subscriptions: Subscription[] = [];

    constructor(public _proposalService: ProposalService,
        public _commonService: CommonService,
        private _router: Router,
        private _elasticConfig: ElasticConfigService,
        private _dataStore: DataStoreService,
        public _evaluationService: EvaluationService,
        private _autoSaveService: AutoSaveService) {
    }

    ngOnInit() {
        this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        this.listenForGlobalSave();
        this.fetchEvaluationPanelsList();
    }

    ngOnDestroy(): void {
        this.setUnsavedChanges(false);
        subscriptionHandler(this.$subscriptions);
    }

    private getDataFromStore() {
        this.result = this._dataStore.getData(this.dataDependencies);
        this.getPermissions();
        this.isViewMode = this.checkViewMode();
    }

    getPermissions() {
        this.isGrantAdmin = this.result.availableRights.includes('START_EVALUATION');
    }

    checkViewMode() {
        return !(this.result.dataVisibilityObj.mode === 'edit' || (this.isGrantAdmin && this.result.proposal
            && [8, 37].includes(this.result.proposal.statusCode)));
    }

    fetchEvaluationPanelsList() {
        this.$subscriptions.push(this._evaluationService.fetchEvaluationPanelsList({ 'proposalId': this.result.proposal.proposalId })
            .subscribe((data: any) => {
                this.proposalEvaluationPanelsList = data.proposalEvaluationPanelsList;
            }));
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe((dependencies: string[]) => {
                if (dependencies.some((dep) => this.dataDependencies.includes(dep))) {
                    this.getDataFromStore();
                    if (dependencies.includes('proposal')) {
                        this.fetchEvaluationPanelsList();
                    }
                }
            })
        );
    }

    listenForGlobalSave() {
        this.$subscriptions.push(this._autoSaveService.autoSaveTrigger$.subscribe(_saveClick => {
            if ((this.result.dataVisibilityObj.mode == 'edit' && (this.result.proposal.statusCode == 1 ||
                this.result.proposal.statusCode == 3 || this.result.proposal.statusCode == 9)) ||
                (this.isGrantAdmin && this.result.proposal.statusCode == 37)) { this.saveProposalEvaluationPanelDetails() }
        }));
    }

    saveProposalEvaluationPanelDetails() {
        this.proposalEvaluationPanelsList.map(item => delete item.isPanelOpen);
        this.$subscriptions.push(this._evaluationService.saveProposalEvaluationPanelDetails({
            'proposalEvaluationPanelsList': this.proposalEvaluationPanelsList,
            'updateUser': this._commonService.getCurrentUserDetail('userName')
        }).subscribe((data: any) => {
            this.proposalEvaluationPanelsList = data.proposalEvaluationPanelsList;
            this.result.dataVisibilityObj.isPanelNotSeleceted = false;
            this.setUnsavedChanges(false);
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Evaluation Panels saved successfully.');
        }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving Evaluation Panels failed. Please try again.');
        }));
    }

    /**
     * To set all check boxes checked or uncheked
     */
    checkOrUncheckPanels() {
        (this.checkAll) ? this.checkAllPanels() : this.unCheckAllPanels();
        this.setCanScoreSelectable();
    }

    /**
     * To check all check boxes
     * for the admin only isAdminSelected is set as true
     * for the PI isAdminSelected & isPiSelected is set as true
     * because admin can alter PI's checks
     */
    checkAllPanels() {
        (this.isGrantAdmin) ? this.proposalEvaluationPanelsList.map(item => item.isAdminSelected = true) :
            this.proposalEvaluationPanelsList.map(item => item.isAdminSelected = item.isPiSelected = true);
    }

    /**
     * To uncheck all check boxes
     * for the admin only isAdminSelected is set as false
     * for the PI isAdminSelected & isPiSelected is set as false
     * because admin can alter PI's checks
     */
    unCheckAllPanels() {
        (this.isGrantAdmin) ? this.proposalEvaluationPanelsList.map(item => item.isAdminSelected = false) :
            this.proposalEvaluationPanelsList.map(item => item.isAdminSelected = item.isPiSelected = false);
    }

    /**
     * if user uncheks every panels the sets can score of every panel to unset
     */
    setCanScoreSelectable() {
        if (!this.checkAll) {
            this.proposalEvaluationPanelsList.map(item => item.canScore = false);
        }
    }

    /**
     * @param  {} panel
     * if the panel is selected then allows to set can score.
     */
    checkSelected(panel, checkedItem) {
        panel.canScore = checkedItem ? panel.canScore : false;
        this.setUnsavedChanges(true);
    }

    /**
     * @param  {} panel
     * allows to set multiple 'can score' if and only if isCanScoreMultiple is enabled
     * other wise check validation
     */
    setCanScore(panel) {
        this.tempPanel = panel;
        (this.isCanScoreMultiple) ? this.setCanScoreValue(panel) : this.setCanScoreValidation(panel);
    }

    /**
     * @param  {} panel
     * set can score with respect to user's selection
     */
    setCanScoreValue(panel) {
        (!panel.canScore) ? panel.canScore = true : panel.canScore = false;
    }

    /**
     * @param  {} panel
     * if there is any panel having true value other than selected panel then shows validation pop up
     * other wise calls setCanScoreValue()
     */
    setCanScoreValidation(panel) {
        (this.proposalEvaluationPanelsList.findIndex(item => item.canScore === true) >= 0 && panel.canScore === false) ?
            document.getElementById('canScorePopupBtnId').click() : this.setCanScoreValue(panel);
    }

    onAddMemberClick(id) {
        if (!this.isAddPanelMember) {
            const VALUE = this.proposalEvaluationPanelsList[id].isPanelOpen;
            this.proposalEvaluationPanelsList.map((item) => item.isPanelOpen = false);
            this.proposalEvaluationPanelsList[id].isPanelOpen = true;
        }
        this.isAddPanelMember = !this.isAddPanelMember;
        setTimeout(() => {
            (document.getElementsByClassName('app-elastic-search')[0] as HTMLElement).focus();
        }, 200);
    }

    collapsePanels(id) {
        this.isAddPanelMember = false;
        const VALUE = this.proposalEvaluationPanelsList[id].isPanelOpen;
        this.proposalEvaluationPanelsList.map((item) => item.isPanelOpen = false);
        this.proposalEvaluationPanelsList[id].isPanelOpen = !VALUE;
        // this.isAddPanelMember = !this.isAddPanelMember;
    }

    clearPanelMemberObj() {
        this.clearField = new String('true');
        this.elasticSearchOptions.defaultValue = '';
        this.panelMemberObj = {};
        this.isAddPanelMember = this.isPanelMemberRepeated = this.isPanelMemberValid = false;
    }

    selectedPerson(event) {
        if (event) {
            this.panelMemberObj.approverPersonId = event.prncpl_id;
            this.panelMemberObj.approverPersonName = event.full_name;
        } else {
            this.panelMemberObj.approverPersonId = null;
        }
    }

    /**
     * Add new person to panel
     */
    addPanelMember(panel) {
        if (!this.valiadatePanelMember()) {
            this.$subscriptions.push(this._evaluationService.addEvaluationPanelPerson({
                'proposalId': this.result.proposal.proposalId,
                'updateUser': this._commonService.getCurrentUserDetail('userName'),
                'proposalEvaluationPanelId': panel.proposalEvaluationId,
                'proposalEvaluationPanelPerson': this.panelMemberObj
            }).subscribe((data: any) => {
                this.isAddPanelMember = false;
                this.result.dataVisibilityObj.isNoPersonSeleceted = false;
                panel.proposalEvaluationPanelPersons.push(data.proposalEvaluationPanelPerson);
                $('#addPanelMemberModal').modal('hide');
                this.clearPanelMemberObj();
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Panel Member saved successfully.');
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving Person failed. Please try again.');
            }));
        }
    }

    /**
     * validations for adding new panel member
     * checks person empty & repeat validations
     */
    valiadatePanelMember() {
        this.isPanelMemberValid = !this.panelMemberObj.approverPersonId ? true : false;
        if (!this.isPanelMemberValid) {
            this.panelMembeRepeatValidation();
        }
        return (this.isPanelMemberRepeated || this.isPanelMemberValid) ? true : false;
    }

    /**
     * sets isPanelMemberRepeated to true if the added person is already added
     */
    panelMembeRepeatValidation() {
        this.isPanelMemberRepeated = false;
        this.proposalEvaluationPanelsList.forEach(element => {
            if (this.checkPanelMemberRepeated(element) > -1) {
                this.isPanelMemberRepeated = true;
            }
        });
    }

    /**
     * @param  {} list
     * return index of first duplicate person having approverPersonId of any other persons in the list
     */
    checkPanelMemberRepeated(list) {
        return list.proposalEvaluationPanelPersons.findIndex(item => item.approverPersonId === this.panelMemberObj.approverPersonId);
    }

    saveAdminEvaluationPanel(type) {
        this.result.dataVisibilityObj.isNoPersonSeleceted = false;
        this.result.dataVisibilityObj.isPanelNotSeleceted = false;
        if (this.isAddPanelMember) {
            this.clearPanelMemberObj();
        }
        if (this.panelSelectedValidation()) {
            if (this.panelPersonValidation()) {
                this.proposalEvaluationPanelsList.map(item => delete item.isPanelOpen);
                this.$subscriptions.push(this._evaluationService
                    .saveAdminEvaluationPanel(this.setRequestObject(type)).subscribe((data: any) => {
                        this.setUnsavedChanges(false);
                        $('#evaluationPanelStart').modal('show');
                    }, err => {
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Start Evaluation failed. Please try again.');
                    }));
            } else {
                this.result.dataVisibilityObj.isNoPersonSeleceted = true;
            }
        } else {
            this.result.dataVisibilityObj.isPanelNotSeleceted = true;
        }
        this._dataStore.updateStore(['dataVisibilityObj'], this.result);
    }

    /**
     * @param  {} type
     * sets the request object for save, start or continue evaluation
     */
    setRequestObject(type) {
        return {
            'proposalEvaluationPanelsList': this.proposalEvaluationPanelsList,
            'proposalId': this.result.proposal.proposalId,
            'actionType': type,
            'personId': this._commonService.getCurrentUserDetail('personID'),
            'updateUser': this._commonService.getCurrentUserDetail('userName')
        };
    }

    /**
     * returns true if there is at least one selected panel is there
     */
    panelSelectedValidation() {
        return this.proposalEvaluationPanelsList.findIndex(item => item.isAdminSelected === true) > -1 ?
            (this.proposalEvaluationPanelsList.findIndex(item => item.canScore === true) > -1 ? true : false) : false;
    }

    panelPersonValidation() {
        let isValid = false;
        this.proposalEvaluationPanelsList.forEach(element => {
            if (element.isAdminSelected === true && element.proposalEvaluationPanelPersons.length > 0) {
                isValid = true;
            }
        });
        return isValid;
    }

    /**
     * @param  {} customElementId
     * to uncheck a checked can score button.
     */
    isActivateCancelled(customElementId) {
        (document.getElementById(customElementId) as HTMLInputElement).checked = this.tempPanel.canScore;
    }

    /**
     * delete panel member
     */
    removePanelMember() {
        this.$subscriptions.push(this._evaluationService.deleteEvaluationPanelPerson
            ({ 'proposalEvaluationPanelPersonId': this.tempPanel.proposalEvaluationPanelPersons[this.tempIndex].evaluationPanelPersonId })
            .subscribe((data: any) => {
                this.tempPanel.proposalEvaluationPanelPersons.splice(this.tempIndex, 1);
                $('#deletePanelPerson').modal('hide');
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Panel Member deleted successfully.');
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving Panel Member failed. Please try again.');
            }));
    }

    startOrContinueEvaluation(type) {
        this.result.dataVisibilityObj.isNoPersonSeleceted = false;
        this.result.dataVisibilityObj.isPanelNotSeleceted = false;
        if (this.panelSelectedValidation()) {
            if (this.panelPersonValidation()) {
                this.proposalEvaluationPanelsList.map(item => delete item.isPanelOpen);
                $('#evaluationPanelStart').modal('hide');
                this.$subscriptions.push(this._evaluationService.startEvaluation(this.setRequestObject(type)).subscribe((data: any) => {
                    this.result.dataVisibilityObj.currentTab = 'ROUTE_LOG';
                    this.result.dataVisibilityObj.isPanelNotSeleceted = false;
                    this.result.dataVisibilityObj.isNoPersonSeleceted = false;
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Evaluation started');
                    this.result.dataVisibilityObj = Object.assign({}, this.result.dataVisibilityObj);
                    this.reloadProposalById();
                }, err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Starting Evaluation failed. Please try again.');
                }));
            } else {
                this.result.dataVisibilityObj.isNoPersonSeleceted = true;
            }
        } else {
            this.result.dataVisibilityObj.isPanelNotSeleceted = true;
        }
        this.evaluationType = '';
    }

    /**
     * for reloading proposal data after endorse or start evaluation
     */
    reloadProposalById() {
        this._commonService.isManualLoaderOn = true;
        this.$subscriptions.push(this._proposalService.loadProposalById({
            'proposalId': this.result.proposal.proposalId
        }).subscribe((data: any) => {
            this._dataStore.manualDataUpdate(data);
            this.navigateToRouteLog();
            this._commonService.isShowLoader.next(false);
            this._commonService.isManualLoaderOn = false;
        }, err => {
            this._commonService.isShowLoader.next(false);
            this._commonService.isManualLoaderOn = false;
        }));
    }

    private navigateToRouteLog(): void {
        localStorage.setItem('currentTab', 'ROUTE_LOG');
        this._router.navigate(['fibi/proposal/route-log'], { queryParamsHandling: 'merge' });
    }

    setUnsavedChanges(flag: boolean) {
        if (this.result.dataVisibilityObj.dataChangeFlag !== flag) {
            this._autoSaveService.setUnsavedChanges('Evaluation Panel', 'proposal-evaluation-panel', flag, true);
        }
        this.result.dataVisibilityObj.dataChangeFlag = flag;
        this._dataStore.updateStore(['dataVisibilityObj'], this.result);
    }
}
