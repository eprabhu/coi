import { Component, OnChanges, OnDestroy, Input, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { CommonService } from '../../../common/services/common.service';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../../app-constants';
import { ProposalService } from '../../services/proposal.service';
import { AutoSaveService } from '../../../common/services/auto-save.service';
import { DataStoreService } from '../../services/data-store.service';

@Component({
    selector: 'app-questionnaire',
    template: `
        <app-view-questionnaire-list id="proposal-common-questionnaire" *ngIf="_proposalService.proposalSectionConfig['312'].isActive"
            [configuration] = "configurationData" [externalSaveEvent] = '_autoSaveService.autoSaveTrigger$' [isShowSave]=false
            (QuestionnaireSaveEvent) = "getSaveEvent($event)" (QuestionnaireEditEvent) = "markQuestionnaireAsEdited($event)">
        </app-view-questionnaire-list>`,
})
export class QuestionnaireCommonComponent implements OnChanges {

    @Input() requestObject: any;
    @Input() dataVisibilityObj: any;
    @Input() isViewMode = false;

    $subscriptions: Subscription[] = [];

    configurationData: any = {};

    constructor(
        public _commonService: CommonService,
        public _proposalService: ProposalService,
        public _autoSaveService: AutoSaveService,
        private _dataStore: DataStoreService
    ) { }

    ngOnChanges(changes: SimpleChanges) {
        if ((changes.requestObject && changes.requestObject.currentValue) ||
            (changes.isViewMode && changes.isViewMode.currentValue !== changes.isViewMode.previousValue)) {
            this.configurationData.moduleItemKey = this.requestObject.moduleItemKey;
            this.configurationData.actionUserId = this._commonService.getCurrentUserDetail('personID');
            this.configurationData.actionPersonName = this._commonService.getCurrentUserDetail('userName');
            this.configurationData.moduleItemCode = 3;
            this.configurationData.questionnaireMode = this.requestObject.questionnaireMode;
            this.configurationData.moduleSubitemCodes = this.requestObject.moduleSubitemCodes;
            this.configurationData.moduleSubItemKey = this.requestObject.moduleSubItemKey || '';
            this.configurationData.enableViewMode = this.isViewMode;
            this.configurationData.isEnableVersion = true;
            this.configurationData.isChangeWarning = true;
            this.configurationData = Object.assign({}, this.configurationData);
        }
    }


    /** Sets toast message based on questionnaire save resposne
     * @param event
     */
    getSaveEvent(event) {
        if (event) {
            this._commonService.showToast(HTTP_SUCCESS_STATUS, this.requestObject.name + ' saved successfully.');
            this.setUnsavedChanges(false);
        } else {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving questionnaire failed. Please try again.');
        }
    }

    markQuestionnaireAsEdited(changeStatus: boolean): void {
        this.setUnsavedChanges(changeStatus);
    }

    setUnsavedChanges(flag: boolean) {
        if (this.dataVisibilityObj.dataChangeFlag !== flag) {
            this._autoSaveService.setUnsavedChanges(this.requestObject.name, 'proposal-common-questionnaire', flag, true);
        }
        this.dataVisibilityObj.dataChangeFlag = flag;
        this._dataStore.updateStore(['dataVisibilityObj'], this);
    }

}
