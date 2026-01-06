import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { CoiDisclosure } from '../coi-interface';
import { CoiService } from '../services/coi.service';
import { DataStoreService } from '../services/data-store.service';
import {subscriptionHandler} from "../../../../../fibi/src/app/common/utilities/subscription-handler";
import {deepCloneObject} from "../../../../../fibi/src/app/common/utilities/custom-utilities";
import {HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS} from "../../../../../fibi/src/app/app-constants";
import {SfiService} from "../sfi/sfi.service";
import { fadeInOutHeight } from '../../common/utilities/animations';
import { EXTERNAL_QUESTIONAIRE_MODULE_SUB_ITEM_CODE } from '../../app-constants';
import { AutoSaveService } from '../../common/services/auto-save.service';
import { getCurrentTime } from '../../common/utilities/date-utilities';
import { DataStoreEvent } from '../../common/services/coi-common.interface';

@Component({
    selector: 'app-screening-questionnaire',
    template: `
        <div id="screening-questionnaire-coi" [@fadeInOutHeight]>
            <app-common-shared-info-text [elementId]="'coi-disc-quest-info-text'" [subSectionId]="813" [customClass]="'pb-2 px-0'"></app-common-shared-info-text>
            <app-view-questionnaire-list
                    [isShowExportButton]="false"
                    [configuration]="configuration"
                    [questionnaireHeader]="''"
                    [isShowSave]="false"
                    [isAutoSaveEnabled]="true"
                    [saveButtonLabel]="'Save and Continue'"
                    (QuestionnaireSaveEvent)="getSaveEvent($event)"
                    (currentActiveQuestionnaire)="currentActiveQuestionaireChanged($event)"
                    (QuestionnaireEditEvent)="markQuestionnaireAsEdited($event)"
                    [isQuestionnaireValidateMode]="isQuestionnaireValidateMode">
            </app-view-questionnaire-list>
        </div>
    `,
    animations: [fadeInOutHeight]
})
export class ScreeningQuestionnaireComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];

    coiDisclosure: CoiDisclosure = new CoiDisclosure();
    configuration: any = {
        moduleItemCode: 8,
        moduleSubitemCodes: [0, EXTERNAL_QUESTIONAIRE_MODULE_SUB_ITEM_CODE],
        moduleItemKey: '',
        moduleSubItemKey: 0,
        actionUserId: this._commonService.getCurrentUserDetail('personID'),
        actionPersonName: this._commonService.getCurrentUserDetail('fullName'),
        enableViewMode: [0, EXTERNAL_QUESTIONAIRE_MODULE_SUB_ITEM_CODE],
        isChangeWarning: true,
        isEnableVersion: true,
    };
    isQuestionnaireValidateMode = false;

    constructor(
        private _commonService: CommonService,
        private _dataStore: DataStoreService,
        private _sfiService: SfiService,
        private _router: Router,
        public coiService: CoiService,
        private _autoSaveService: AutoSaveService
    ) { }

    ngOnInit() {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        window.scrollTo(0, 0);
        this.getQuestionnaireValidateMode();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe((storeEvent: DataStoreEvent) => {
                if (storeEvent.action === 'REFRESH') {
                    this.getDataFromStore();
                }
            })
        );
    }

    private getDataFromStore() {
        const DATA = this._dataStore.getData();
        this.coiDisclosure = DATA.coiDisclosure;
        this.configuration.moduleItemKey = DATA.coiDisclosure.disclosureId;
        this.configuration.enableViewMode = !this._dataStore.getEditModeForCOI() ? [ 0, EXTERNAL_QUESTIONAIRE_MODULE_SUB_ITEM_CODE ] : [ EXTERNAL_QUESTIONAIRE_MODULE_SUB_ITEM_CODE ];
        this.configuration = deepCloneObject(this.configuration);
    }

    getSaveEvent(_event: any) {
        setTimeout(() => {
            const HAS_ANY_CHANGES = !!this._commonService.loaderRestrictedUrls.length;
            if (HAS_ANY_CHANGES && this._commonService.isNavigationStopped && this._commonService.attemptedPath) {
                this._commonService.appLoaderContent = 'Saving...';
                this._commonService.isShowLoader.next(true);
            }
            if (!HAS_ANY_CHANGES) {
                this._commonService.isShowLoader.next(false);
                this.coiDisclosure.updateTimestamp = _event?.ANS_UPDATE_TIMESTAMP;
                this._dataStore.updateStore(['coiDisclosure'], { coiDisclosure: this.coiDisclosure });
                this._autoSaveService.updatedLastSaveTime(this.coiDisclosure.updateTimestamp, true);
            }
            this._commonService.setChangesAvailable(HAS_ANY_CHANGES);
        });
    }

    private evaluateDisclosureQuestionnaire() {
        this.$subscriptions.push(
            this.coiService.evaluateDisclosureQuestionnaire({
                moduleCode : this.configuration.moduleItemCode,
                submoduleCode : 0,
                moduleItemId : this.configuration.moduleItemKey
            }).subscribe((data: boolean) => {
                this.coiDisclosure.isDisclosureQuestionnaire = data;
                this._sfiService.isSFIRequired = data;
                const NEXT_STEP = data ? '/coi/create-disclosure/sfi' : '/coi/create-disclosure/certification';
                this._router.navigate([NEXT_STEP], { queryParamsHandling: 'preserve' });
                this.coiService.stepTabName = data ? 'sfi' : 'certify';
                this._commonService.showToast(HTTP_SUCCESS_STATUS, `Questionnaire Saved Successfully`);
            }, _err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in Evaluating Disclosure.');
            })
        );
    }

    markQuestionnaireAsEdited(changeStatus: boolean): void {
        this.coiService.unSavedModules = 'Screening Questionnaire';
        this._commonService.setChangesAvailable(true);
    }

    currentActiveQuestionaireChanged(activeQuestionnaire: any): void {
        this.coiService.currentActiveQuestionnaire = activeQuestionnaire;
    }

    getQuestionnaireValidateMode() {
        if(this.coiService.isFromCertificationTab) {
            this.coiService.isFromCertificationTab = false;
            this.isQuestionnaireValidateMode = true;
        }
    }

}
