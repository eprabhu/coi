import { Component, OnInit, Input, OnDestroy, OnChanges } from '@angular/core';
import {
    getDuration, compareDates, getDateObjectFromTimeStamp,
    parseDateWithoutTimestamp,
    compareDatesWithoutTimeZone
} from '../../../../common/utilities/date-utilities';
import { InstituteProposalService } from '../../../services/institute-proposal.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { DEFAULT_DATE_FORMAT, EDITOR_CONFIURATION, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { CommonService } from '../../../../common/services/common.service';
import { DataStoreService } from '../../../services/data-store.service';
import {
    ActivityType, AwardType, DisciplineClusters,
    GrantCallType, InstituteProposal, InstProposal, InstProposalType, StatusCode
} from '../../../institute-proposal-interfaces';
import { getEndPointOptionsForKeyWords, getEndPointOptionsForSponsor } from '../../../../common/services/end-point.config';
import { onKeyPress, setFocusToElement } from '../../../../common/utilities/custom-utilities';
import { ElasticConfigService } from '../../../../common/services/elastic-config.service';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { OverviewService } from '../../overview.service';
import { setHelpTextForSubItems } from '../../../../common/utilities/custom-utilities';
import { AutoSaveService } from '../../../../common/services/auto-save.service';
@Component({
    selector: 'app-general-section-edit',
    templateUrl: './general-section-edit.component.html',
    styleUrls: ['./general-section-edit.component.css']
})
export class GeneralSectionEditComponent implements OnInit, OnDestroy, OnChanges {
    SECTION_ID = 'ip-general-section';
    @Input() helpText: any = {};
    generalDetails: InstProposal = this._overviewService.generalDetails;
    instProposalDataBindObj: any = {};
    showGrantDetails = false;
    ipStatusChangeObject: any = {};
    $subscriptions: Subscription[] = [];
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    isSaving = false;
    errorMap = new Map();
    isDataChanged = false;
    activityTypes: Array<ActivityType> = [];
    proposalTypes: Array<InstProposalType> = [];
    statusCodes: Array<StatusCode> = [];
    awardTypes: Array<AwardType> = [];
    grantCallTypes: Array<GrantCallType> = [];
    sponsorHttpOptions: any = {};
    primeSponsorHttpOptions: any = {};
    proposalElasticOptions: any = {};
    keywordHttpOptions: any = {};
    editorConfig = EDITOR_CONFIURATION;
    public Editor = DecoupledEditor;
    keyPress = onKeyPress;
    setFocusToElement = setFocusToElement;
    disciplineClusters: DisciplineClusters[];
    enableActivityGrantCallMapping = false;
    clearKeywordField: String;
    selectedKeyword;
    instituteProposalKeywords;
    keywordWarning;
    validationMap = new Map();

    constructor(public _commonService: CommonService,
        private _dataStore: DataStoreService, private _elasticConfig: ElasticConfigService,
        private _overviewService: OverviewService, public _instituteService: InstituteProposalService,
        public _autoSaveService: AutoSaveService) { }

    ngOnInit() {
        this.listenForGlobalSave();
        this.getGeneralDetails();
        this.setSearchOptions();
        this.proposalElasticOptions.defaultValue = this.generalDetails.baseProposalTitle && this.generalDetails.baseProposalNumber
            ? this.generalDetails.baseProposalNumber + '-' + this.generalDetails.baseProposalTitle
            : '';
        this.internalDateValidation();
    }

    ngOnChanges() {
        if (this.helpText) {
            if (Object.keys(this.helpText).length && this.helpText.instituteProposalInformation &&
                this.helpText.instituteProposalInformation.parentHelpTexts.length) {
                this.helpText = setHelpTextForSubItems(this.helpText, 'instituteProposalInformation');
            }
        }
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
        this._autoSaveService.clearUnsavedChanges();
    }

    setSearchOptions() {
        this.sponsorHttpOptions = getEndPointOptionsForSponsor();
        this.sponsorHttpOptions.defaultValue = this.generalDetails.sponsorName;
        this.primeSponsorHttpOptions = getEndPointOptionsForSponsor();
        this.primeSponsorHttpOptions.defaultValue = this.generalDetails.primeSponsorName;
        this.proposalElasticOptions = this._elasticConfig.getElasticForIP();
        this.proposalElasticOptions.contextField = 'proposal_number - ' + this.proposalElasticOptions.contextField;
        this.keywordHttpOptions = getEndPointOptionsForKeyWords();
    }

    differenceBetweenDates(startDate, endDate) {
        const DATE = getDuration(startDate, endDate);
        this.generalDetails.duration = DATE.durInYears + ' year(s), ' + DATE.durInMonths +
            ' month(s) & ' + DATE.durInDays + ' day(s)';
    }

    saveIpDetails() {
        if (!this.isSaving && this.mandatoryFieldsChecking()) {
            this.generalDetails.instProposalKeywords = this.instituteProposalKeywords;
            this.isSaving = true;
            this.convertDateToDateString();
            this.$subscriptions.push(this._overviewService.saveOrUpdateInstProposal({ instProposal: this.generalDetails ,
                instituteProposalDateChanged: this.setDateChangeFlag()}).subscribe((data: any) => {
                    this.generalDetails = data.instProposal;
                    this._overviewService.generalDetails = data.instProposal;
                    this._dataStore.currentStartDate = this.generalDetails.startDate;
                    this._dataStore.currentEndDate = this.generalDetails.endDate;
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Institute Proposal successfully updated.');
                    this._dataStore.updateStoreData({ instProposal: data.instProposal,
                         instituteProposalKeywords: data.instProposal.instProposalKeywords });
                    this.convertDateToDateObject();
                    this.isSaving = false;
                    this.setUnsavedChanges(false);
                }, err => { this.isSaving = false;
                    this._autoSaveService.clearErrors();
                    this._autoSaveService.errorEvent(
                        { name: 'General Proposal Information', documentId: this.SECTION_ID, type: 'API' });
                 }));
        }
    }

    setUnsavedChanges(flag: boolean) {
        this._instituteService.isInstituteProposalDataChange = flag;
        this._autoSaveService.setUnsavedChanges('General Proposal Information', 'ip-general-section', flag, true);
    }

    setDateChangeFlag() {
        if ((compareDatesWithoutTimeZone(getDateObjectFromTimeStamp(this._dataStore.currentStartDate),
             this.generalDetails.startDate) !== 0) ||
            (compareDatesWithoutTimeZone(getDateObjectFromTimeStamp(this._dataStore.currentEndDate),
            this.generalDetails.endDate) !== 0)) {
                 return true;
            } else {
                return false;
        }
    }

    setGrantDetailsValue(isShowModal) {
        this.showGrantDetails = isShowModal;
    }

    getDataStoreEvent() {
        this.$subscriptions.push(this._dataStore.dataEvent
            .subscribe((data: any) => {
                if (data.includes('instProposal')) {
                    this.getGeneralDetails();
                }
            }));
    }

    getGeneralDetails() {
        const data: InstituteProposal = this._dataStore.getData(['instProposal',
            'activityTypes', 'proposalTypes', 'awardTypes', 'grantCallTypes',
            'statusCodes', 'disciplineClusters', 'enableActivityGrantCallMapping', 'instituteProposalKeywords']);
        this.convertDateToDateObject();
        this.activityTypes = data.activityTypes || [];
        this.proposalTypes = data.proposalTypes || [];
        this.awardTypes = data.awardTypes || [];
        this.grantCallTypes = data.grantCallTypes || [];
        this.statusCodes = data.statusCodes;
        this.disciplineClusters = data.disciplineClusters;
        this.instituteProposalKeywords = data.instituteProposalKeywords || [];
        this.enableActivityGrantCallMapping = data.enableActivityGrantCallMapping;
    }

    changeCategoryValue() {
        if (this.generalDetails.grantTypeCode) {
            const typeObj = this.grantCallTypes.find(grantType => grantType.grantTypeCode == this.generalDetails.grantTypeCode);
            this.generalDetails.grantCallType = typeObj;
            this.generalDetails.grantTypeCode = typeObj.grantTypeCode;
        } else {
            this.generalDetails.grantCallType = null;
            this.generalDetails.grantTypeCode = null;
        }
        if (this.enableActivityGrantCallMapping) {
            this.generalDetails.activityTypeCode = null;
        }
    }

    public onReady(editor: any): void {
        editor.ui.getEditableElement().parentElement.insertBefore(
            editor.ui.view.toolbar.element,
            editor.ui.getEditableElement()
        );
    }

    onSponsorSelect(event) {
        if (event) {
            this.generalDetails.sponsor = event;
            this.generalDetails.sponsorName = event.sponsorName;
            this.generalDetails.sponsorCode = event.sponsorCode;
        } else {
            this.generalDetails.sponsor = null;
            this.generalDetails.sponsorName = null;
            this.generalDetails.sponsorCode = null;
        }
        this.setUnsavedChanges(true);
    }

    onPrimeSponsorSelect(event) {
        if (event) {
            this.generalDetails.primeSponsor = event;
            this.generalDetails.primeSponsorName = event.sponsorName;
            this.generalDetails.primeSponsorCode = event.sponsorCode;
        } else {
            this.generalDetails.primeSponsor = null;
            this.generalDetails.primeSponsorName = null;
            this.generalDetails.primeSponsorCode = null;
        }
        this.setUnsavedChanges(true);
    }

    onBaseProposalNumberSelect(event) {
        if (event) {
            this.generalDetails.baseProposalNumber = event.proposal_number;
            this.generalDetails.baseProposalTitle = event.title;
        } else {
            this.generalDetails.baseProposalNumber = '';
            this.generalDetails.baseProposalTitle = '';
        }
        this.setUnsavedChanges(true);
    }

    proposalStartDateValidation() {
        this.errorMap.delete('endDate');
        if (this.generalDetails.endDate && this.generalDetails.startDate) {
            if (compareDates(this.generalDetails.startDate, this.generalDetails.endDate, 'dateObject', 'dateObject') === 1) {
                this.errorMap.set('endDate', '* Please select an end date after start date');
            }
            this.differenceBetweenDates(this.generalDetails.startDate, this.generalDetails.endDate);
        }
    }

    internalDateValidation() {
        this.validationMap.delete('internalDeadline');
        const CURRENT_DATE = new Date(new Date().setHours(0, 0, 0, 0));
        if (this.generalDetails.internalDeadLineDate != null &&
            compareDates(this.generalDetails.internalDeadLineDate, CURRENT_DATE, 'dateObject', 'dateObject') === -1) {
            this.validationMap.set('internalDeadline', 'Internal deadline date already passed.');
        }
        if (this.generalDetails.sponsorDeadlineDate != null && this.generalDetails.internalDeadLineDate != null &&
            compareDates(this.generalDetails.internalDeadLineDate, this.generalDetails.sponsorDeadlineDate,
                'dateObject', 'dateObject') === 1) {
            this.validationMap.set('internalDeadline',
                'Internal deadline date already passed.');
        }
    }

    convertDateToDateObject() {
        this.generalDetails.startDate = this.generalDetails.startDate ? getDateObjectFromTimeStamp(this.generalDetails.startDate) : null;
        this.generalDetails.endDate = this.generalDetails.endDate ? getDateObjectFromTimeStamp(this.generalDetails.endDate) : null;
        this.generalDetails.internalDeadLineDate = this.generalDetails.internalDeadLineDate ?
            getDateObjectFromTimeStamp(this.generalDetails.internalDeadLineDate) : null;
        this.generalDetails.sponsorDeadlineDate = this.generalDetails.sponsorDeadlineDate ?
            getDateObjectFromTimeStamp(this.generalDetails.sponsorDeadlineDate) : null;
    }

    convertDateToDateString() {
        this.generalDetails.startDate = this.generalDetails.startDate ? parseDateWithoutTimestamp(this.generalDetails.startDate) : null;
        this.generalDetails.endDate = this.generalDetails.endDate ? parseDateWithoutTimestamp(this.generalDetails.endDate) : null;
        this.generalDetails.internalDeadLineDate = this.generalDetails.internalDeadLineDate ?
            parseDateWithoutTimestamp(this.generalDetails.internalDeadLineDate) : null;
        this.generalDetails.sponsorDeadlineDate = this.generalDetails.sponsorDeadlineDate ?
            parseDateWithoutTimestamp(this.generalDetails.sponsorDeadlineDate) : null;
    }

    getInternalDeadlineDate() {
        this.generalDetails.internalDeadLineDate = null;
        let dateCount = 0;
        let finalDate = new Date(this.generalDetails.sponsorDeadlineDate);
        if (finalDate) {
            do {
                finalDate.setDate(finalDate.getDate() - 1);
                if (!this.checkForHolidayOrWeekend(finalDate)) { dateCount++; }
            } while (dateCount < 5);
            this.generalDetails.internalDeadLineDate = finalDate;
        }
    }

    checkForHolidayOrWeekend(date: Date) {
        return date.getDay() === 6 || date.getDay() === 0 ? true : false;
    }

    mandatoryFieldsChecking(): boolean {
        this.errorMap.clear();
        this.proposalStartDateValidation();
        if (this.generalDetails.title === '' || this.generalDetails.title == null) {
            this.errorMap.set('title', true);
        }
        if (this.generalDetails.typeCode == null || this.generalDetails.typeCode === 'null') {
            this.errorMap.set('type', true);
        }
        if (this.generalDetails.activityTypeCode == null || this.generalDetails.activityTypeCode == 'null') {
            this.errorMap.set('category', true);
        }
        if (this.generalDetails.grantTypeCode == null || this.generalDetails.grantTypeCode === 'null') {
            this.errorMap.set('grantType', true);
        }
        if (!this.generalDetails.startDate) {
            this.errorMap.set('startDate', '* Please provide a start date');
        }
        if (!this.generalDetails.endDate) {
            this.errorMap.set('endDate', '* Please provide an end date');
        }
        return this.errorMap.size == 0 ? true : false;
    }

    setProposalStatus() {
        this.generalDetails.instProposalStatus = this.statusCodes.find(S => S.statusCode == this.generalDetails.statusCode);
    }

    setDisciplineCluster(): void {
        this.generalDetails.disciplineCluster =
            this.disciplineClusters.find(cluster => cluster.id === this.generalDetails.clusterCode);
    }

    keywordSelectFunction(event) {
        if (event) {
            this.selectedKeyword = event.description;
            this.checkDuplicateKeyword();
            if (!this.keywordWarning) {
                this.setKeywordObject(event);
            }
            this.clearKeywordSearchBox();
            this.clearKeywordField = new String('true');
        } else {
            this.setKeywordObject(event);
        }
        this.setUnsavedChanges(true)
    }
    setKeywordObject(event) {
        const keywordObject: any = this.prepareKeywordObject(event);
        if (keywordObject.scienceKeywordCode) {
            this.instituteProposalKeywords.push(keywordObject);
        }
    }

    private prepareKeywordObject(event: any) {
        return {
            scienceKeyword : event ? event : null,
            scienceKeywordCode : event ? event.code : null,
            keyword : event ? null : this.selectedKeyword,
            proposalNumber : this.generalDetails.proposalNumber,
            sequenceNumber : this.generalDetails.sequenceNumber
        };
    }

    showAddKeywordFunction(event) {
        this.selectedKeyword = event.searchString;
    }

    checkDuplicateKeyword() {
        let dupKeywordObject = null;
        this.keywordWarning = null;
        if (this.selectedKeyword) {
            if (this.instituteProposalKeywords && this.instituteProposalKeywords.length !== 0) {
                dupKeywordObject = this.instituteProposalKeywords.find(dupKeyword => this.duplicatekeywordCondition(dupKeyword));
            }
            if (dupKeywordObject && (dupKeywordObject.scienceKeyword || !this.keywordWarning )) {
                this.keywordWarning = '* Keyword already added';
                this.clearKeywordField = new String('true');
            }
        } else {
            this.keywordWarning = '* Add any keyword';
            this.clearKeywordField = new String('true');
        }
    }

    private duplicatekeywordCondition(dupKeyword: any) {
        return (dupKeyword.scienceKeyword &&
            dupKeyword.scienceKeyword.description.toLowerCase() === this.selectedKeyword.toLowerCase()) ||
            (dupKeyword.keyword && dupKeyword.keyword.toLowerCase() === this.selectedKeyword.toLowerCase());
    }

    getSearchValue(event) {
        this.selectedKeyword = event;
    }

    /**
      * deletes keyword
      * @param  {} id
      * @param  {} index
      * @param  {} data
      */
    deleteKeyword(id, index) {
        this.keywordWarning = null;
        if (this.generalDetails.proposalId && id) {
            this.$subscriptions.push(this._instituteService.deleteIPKeyword(this.generalDetails.proposalId, id).subscribe(success => {
                this.actionsAfterKeywordDeletion(index);
            }));
        } else {
            this.instituteProposalKeywords.splice(index, 1);
            this.generalDetails.instProposalKeywords.splice(index, 1);
            this._dataStore.updateStoreData({
                instProposal: this.generalDetails ,
                instituteProposalKeywords: this.instituteProposalKeywords});
        }
    }

    /**
     * if there is no duplicate warning, keyword is spliced from the array
     * @param  {} index
     * @param  {} data
     */
    actionsAfterKeywordDeletion(index) {
        this.instituteProposalKeywords.splice(index, 1);
        this.selectedKeyword = '';
        this.generalDetails.instProposalKeywords.splice(index, 1);
        this._dataStore.updateStoreData({ instProposal: this.generalDetails, instituteProposalKeywords: this.instituteProposalKeywords });
    }

    /* if keyword doesn't exist in database (data contains code), keyword is added to the proposal. Otherwise warning
     such as 'Keyword already exist in database' is shown */
    checkKeywordExistInDatabase(data) {
        if (data && data.code) {
            this.keywordSelectFunction(data);
        } else {
            this.keywordWarning = '* Keyword already exist in database';
        }
    }

    /* adds user defined keyword to database and delete the same keyword added in this particular proposal */
    addKeywordToDatabase(event) {
        if (event) {
            this.selectedKeyword = event.searchString;
            if(this.selectedKeyword){
                this.selectedKeyword = this.selectedKeyword.trim();
            }
            this.$subscriptions.push(this._instituteService.addScienceKeyword({
                'scienceKeyword': this.selectedKeyword,
                'userName': this._commonService.getCurrentUserDetail('userName')
            }).subscribe((data: any) => {
                this.checkKeywordExistInDatabase(data);
                this.clearKeywordSearchBox();
            }));
        }
    }

    /* clears keyword search box */
    clearKeywordSearchBox() {
        this.selectedKeyword = null;
        this.clearKeywordField = new String('true');
    }

    ipCategoryChange() {
        if (this.generalDetails.activityTypeCode) {
            const categoryObj = this.activityTypes.find(category =>
                category.activityTypeCode == this.generalDetails.activityTypeCode);
            this.generalDetails.activityType = categoryObj;
        } else {
            this.generalDetails.activityTypeCode = null;
            this.generalDetails.activityType = null;
        }
    }

    ipTypeChange() {
        if (this.generalDetails.typeCode) {
            const typeObj = this.proposalTypes.find(type =>
                type.typeCode == this.generalDetails.typeCode);
            this.generalDetails.instProposalType = typeObj;
        } else {
            this.generalDetails.instProposalType = null;
            this.generalDetails.typeCode = null;
        }
    }

    ipAwardTypeChange() {
        if (this.generalDetails.awardTypecode) {
            const awardTypeObj = this.awardTypes.find(type =>
                type.awardTypeCode == this.generalDetails.awardTypecode);
            this.generalDetails.awardType = awardTypeObj;
        } else {
            this.generalDetails.awardType = null;
            this.generalDetails.awardTypecode = null;
        }
    }

    listenForGlobalSave() {
        this.$subscriptions.push(this._autoSaveService.autoSaveTrigger$.subscribe(_saveClick => {
            this.saveIpDetails();
        }));
    }
}
