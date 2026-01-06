/** last updated by Greeshma on 20-11-2019 **/
import { Component, OnInit, Input, OnDestroy, OnChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { ProposalHomeService } from '../../proposal-home.service';
import { CommonService } from '../../../../common/services/common.service';
import { ElasticConfigService } from '../../../../common/services/elastic-config.service';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS, EDITOR_CONFIURATION } from '../../../../app-constants';
import { ProposalService } from '../../../services/proposal.service';
import {
    compareDates, getCurrentTimeStamp, getDateObjectFromTimeStamp, getDuration,
    parseDateWithoutTimestamp
} from '../../../../common/utilities/date-utilities';
import { DEFAULT_DATE_FORMAT } from '../../../../app-constants';
import { setFocusToElement, onKeyPress, removeUnwantedTags, validatePercentage } from '../../../../common/utilities/custom-utilities';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

import { setHelpTextForSubItems } from '../../../../common/utilities/custom-utilities';
import { getEndPointOptionsForSponsor, getEndPointOptionsForLeadUnit } from '../../../../common/services/end-point.config';
import { AutoSaveService } from '../../../../common/services/auto-save.service';
import { DataStoreService } from '../../../services/data-store.service';
import { WebSocketService } from '../../../../common/services/web-socket.service';
import { concatUnitNumberAndUnitName } from '../../../../common/utilities/custom-utilities';
import { isValidDateFormat } from '../../../../common/utilities/date-utilities';
// KKI Specific Change Don't Delete
// import { HttpClient } from '@angular/common/http';
// import { environment } from '../../../../../environments/environment';
declare var $: any;

@Component({
    selector: 'app-proposal-details',
    templateUrl: './proposal-details.component.html',
    styleUrls: ['./proposal-details.component.css']
})
export class ProposalDetailsComponent implements OnInit, OnDestroy, OnChanges {

    SECTION_ID = 'general-proposal-information';

    @Input() result: any = {};
    @Input() dataVisibilityObj: any = {};
    @Input() proposalDataBindObj: any = {};
    @Input() departmentLevelRightsForProposal: any = {};
    @Input() helpText: any = {};

    isDateDecrement = false;
    showGrantDetails = false;
    editorConfig = EDITOR_CONFIURATION;
    public Editor = DecoupledEditor;
    prevProposalEndDate: any;
    clearField;
    elasticSearchProposalOptions: any = {};
    piElasticSearchOptions: any = {};
    sponsorHttpOptions: any = {};
    primeSponsorHttpOptions: any = {};
    keywordHttpOptions: any = {};
    unitHttpOptions: any = {};
    grantHttpOptions: any = {};
    selectedMemberObject: any = {};
    debounceTimer: any;
    grantCallDetails: any = {};

    clearGrantField: String;
    clearKeywordField: String;
    clearSponsorField: String;
    clearPrimeSponsorField: String;
    clearPIField: String;
    clearLUField: String;
    piName: string;
    personDetails: any = {};
    fundingScheme: string;
    fundingSourceTypeCode: string;
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    setFocusToElement = setFocusToElement;
    $subscriptions: Subscription[] = [];
    isEmployeeFlag = true;
    isDisableTitleOfGrantCall = false;
    keyPress = onKeyPress;
    isSaving = false;
    elasticSearchAwardOptions: any = {};
    isAwardCard = false;
    awardDetails: any = {};
    isDateFieldChanged = false;
    dataDependencies = ['proposal', 'isPINameAutoFilledRequired', 'piPersonId', 'rcbfTypeCode', 'isNonEmployee', 'availableRights'
        , 'grantEligibilityStatus', 'grantCall'];
    hasUnsavedChanges = false;
    concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;
    tempProposal: any = {};
    nonMandatoryField = false;
    formatChecker = {
        'startDateValidation': false,
        'endDateValidation': false
    };

    // KKI Specific Change Don't Delete
    // internalDeadlineWarningMsg: string;
    // public configUrl = environment.deployUrl + './assets/app-data-config.json';
    // private _http: HttpClient  // add to constructor KKI Specific Change
    constructor(
        private _elasticConfig: ElasticConfigService,
        private _proposalHomeService: ProposalHomeService,
        public _commonService: CommonService,
        private _router: Router,
        public _proposalService: ProposalService,
        public _autoSaveService: AutoSaveService,
        private _dataStore: DataStoreService,
        private _webSocket: WebSocketService,
        private _activatedRoute: ActivatedRoute
    ) { }

    ngOnInit() {
        this.proposalDataBindObj.dateWarningList.clear();
        this.setElasticOptions();
        this.setEndpointOptions();
        this.setDefaultValues();
        this.initializeProposalDetails();
        this.listenForGlobalSave();
        this.resetValidations();
        this.getDataFromStore();
        this.listenDataChangeFromStore();
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe((dependencies: string[]) => {
                this.getDataFromStore();
            })
        );
    }

    private getDataFromStore() {
        const DATA = this._dataStore.getData();
        this.tempProposal = DATA.proposal;
    }

    private setElasticOptions() {
        this.piElasticSearchOptions = this._elasticConfig.getElasticForPerson();
        this.elasticSearchAwardOptions = this._elasticConfig.getElasticForAward();
        this.elasticSearchAwardOptions.contextField = this.elasticSearchAwardOptions.contextField + ' - title';
        this.setElasticProposalOption();
    }

    private setDefaultValues() {
        this.piElasticSearchOptions.defaultValue = this.piName;
        this.elasticSearchAwardOptions.defaultValue = this.result.proposal.awardNumber ?
            this.result.proposal.awardNumber + '-' + this.result.proposal.awardTitle : null;
        this.elasticSearchProposalOptions.defaultValue = this.result.proposal.baseProposalTitle ?
            this.result.proposal.baseProposalNumber + '-' + this.result.proposal.baseProposalTitle : '';
        this.grantHttpOptions.defaultValue = this.result.grantCall != null
            ? this.result.grantCall.grantCallId + '-' + this.result.grantCall.grantCallName : null;
    }

    private setEndpointOptions() {
        this.sponsorHttpOptions = getEndPointOptionsForSponsor({ defaultValue: this.result.proposal.sponsorName });
        this.primeSponsorHttpOptions = getEndPointOptionsForSponsor({ defaultValue: this.result.proposal.primeSponsorName });
        this.keywordHttpOptions = this._proposalService.setHttpOptions('description', 'description', 'findKeyWords', '');
        this.unitHttpOptions = this.constructDepartmentHttpOptions(this.result.proposal.homeUnitNumber, this.result.proposal.homeUnitName);
        // tslint:disable-next-line:max-line-length
        this.grantHttpOptions = this._proposalService.setHttpOptions('grantCallId - grantCallName', 'grantCallId | grantCallName', 'findGrantCall', '', { 'moduleCode': '3' });
    }

    private initializeProposalDetails() {
        if (!this.result.proposal.duration) {
            this.result.proposal.duration = '0 year(s) , 0 month(s) & 0 day(s)';
        }
        this.result.proposal.homeUnitNumber = (this.result.proposal.proposalId === null || this.result.proposal.homeUnitNumber === null) ?
            null : this.result.proposal.homeUnitNumber;
        this.result.proposal.homeUnitName = (this.result.proposal.proposalId === null || this.result.proposal.homeUnitName === null) ?
            null : this.result.proposal.homeUnitName;
        this.prevProposalEndDate = getDateObjectFromTimeStamp(this.result.proposal.endDate);
        this.fundingSourceTypeCode = this.result.grantCall && this.result.grantCall.sponsorFundingScheme ?
            this.result.grantCall.sponsorFundingScheme.fundingSchemeCode : null;
        if (this.dataVisibilityObj.mode === 'create') { this.preloadRCBF(); }
        this.fundingScheme = this.result.grantCall && this.result.grantCall.sponsorFundingScheme ?
            this.result.grantCall.sponsorFundingScheme.description : null;
        // this.result.proposal.sponsorDeadlineDate = getDateObjectFromTimeStamp(this.result.proposal.sponsorDeadlineDate);
        this.proposalPiIntialise();
        this.enableOrDisableGrantCall();
        this.updateEditorContent();
        this.deadlineDatesValidation();
        //  KKI Specific Change Don't Delete
        // this._http.get(this.configUrl).subscribe(data => {
        //   this.internalDeadlineWarningMsg = data['internalDeadlineWarning'];
        //   if (this.result.proposal.sponsorDeadlineDate != null) {
        //     this.checkInternalDeadLineInterval();
        //   }
        // });
        // if (this.dataVisibilityObj.mode === 'create') {
        //   this.result.proposal.grantTypeCode = 3;
        //   this.changeGrantType();
        // }
    }

    updateEditorContent(): void {
        this.result.proposal.abstractDescription = removeUnwantedTags(this.result.proposal.abstractDescription);
    }

    //  KKI Specific Change Don't Delete
    // checkInternalDeadLineInterval() {
    //   if (this.result.proposal.internalDeadLineDate != null) {
    //     this.compareAndSetInternalDateMessage();
    //   } else {
    //     this.getInternalDeadlineDate(this.result.proposal.sponsorDeadlineDate, null);
    //     this.compareAndSetInternalDateMessage();
    //   }
    // }

    // compareAndSetInternalDateMessage() {
    //   if (this.result.proposal.sponsorDeadlineDate != null &&
    //     compareDates(this.result.proposal.internalDeadLineDate, getCurrentTimeStamp(), 'dateObject', 'timeStamp') === -1) {
    //     this.proposalDataBindObj.dateWarningList.set('internalDeadlineDate', this.internalDeadlineWarningMsg);
    //   }
    // }

    ngOnChanges() {
        if (Object.keys(this.helpText).length && this.helpText.proposalInformation &&
            this.helpText.proposalInformation.parentHelpTexts.length) {
            this.helpText = setHelpTextForSubItems(this.helpText, 'proposalInformation');
        }
        if (Object.keys(this.helpText).length && this.helpText.keyPersons && this.helpText.keyPersons.parentHelpTexts.length) {
            this.helpText = setHelpTextForSubItems(this.helpText, 'keyPersons');
        }
    }

    ngOnDestroy() {
        this._autoSaveService.clearUnsavedChanges();
        subscriptionHandler(this.$subscriptions);
    }

    public onReady(editor) {
        editor.ui.getEditableElement().parentElement.insertBefore(
            editor.ui.view.toolbar.element,
            editor.ui.getEditableElement()
        );
    }

    /**
     * This function is used to remove array of the list of sub items that comes on response.
     * This is because to remove index and convert to objects
     * so that you can easily display the help text using [] notation as used in html.
     */

    /**
   * Set Elastic search option for Institute proposal
   */
    setElasticProposalOption() {
        this.elasticSearchProposalOptions = this._elasticConfig.getElasticForIP();
        this.elasticSearchProposalOptions.contextField = 'proposal_number - ' + this.elasticSearchProposalOptions.contextField;
        this.elasticSearchProposalOptions.defaultValue = this.result.proposal.baseProposalTitle ?
            this.result.proposal.baseProposalNumber + '-' + this.result.proposal.baseProposalTitle : '';
        this.elasticSearchProposalOptions.fontSize = '1rem';
    }
    selectBaseProposalNumber(event) {
        if (event) {
            this.result.proposal.baseProposalNumber = event.proposal_number;
            this.result.proposal.baseProposalTitle = event.title;
            this.dataVisibilityObj.dataChangeFlag = true;
        } else {
            this.result.proposal.baseProposalNumber = null;
            this.result.proposal.baseProposalTitle = '';
            this.dataVisibilityObj.dataChangeFlag = false;
        }
        this._dataStore.updateStore(['dataVisibilityObj'], this);
        this.setDataChangeFlag();
    }

    /**
     * @param  {}
     * This function sets current logined user as default PI
     * using service _proposalHomeService.getPersonInformation loginned user details is fetched
     * and used to set leadunit
     */
    proposalPiIntialise() {
        if (this.result.isPINameAutoFilledRequired && !this.result.proposal.proposalId) {
            this.result.piPersonId = this._commonService.getCurrentUserDetail('personID');
            this.piElasticSearchOptions.defaultValue = this._commonService.getCurrentUserDetail('fullName');
            this.$subscriptions.push(this._proposalHomeService.getPersonInformation(this.result.piPersonId).subscribe((data: any) => {
                if (data.unit) {
                    this.checkUnitRight(data.unit.unitNumber, 'CREATE_PROPOSAL').then((isRightExists: boolean) => {
                        if (isRightExists) {
                            this.unitHttpOptions = this.constructDepartmentHttpOptions(data.unit.unitNumber, data.unit.unitName);
                            this.setLeadUnit(data.unit.unitNumber, data.unit.unitName);
                        }
                    });
                }
            }));
        }
    }

    emptyValidationKeyup(event) {
        if (event.keyCode >= 46 && event.keyCode <= 90 || event.keyCode === 8) {
            this.result.proposal.baseProposalNumber = '';
        }
        this.setDataChangeFlag();
    }

    proposalCategoryChange() {
        // tslint:disable:triple-equals
        if (this.result.proposal.activityTypeCode === 'null' || this.result.proposal.activityTypeCode == null) {
            this.clearCategory();
        } else {
            const categoryObj = this.result.activityTypes.find(category =>
                category.activityTypeCode == this.result.proposal.activityTypeCode);
            this.result.proposal.activityType = categoryObj;
        }
    }

    proposalTypeChange() {
        if (this.result.proposal.typeCode === 'null') {
            this.result.proposal.proposalType = null;
            this.result.proposal.typeCode = null;
        } else {
            const typeObj = this.result.proposalTypes.find(category =>
                category.typeCode === this.result.proposal.typeCode);
            this.result.proposal.proposalType = typeObj;
        }
    }

    proposalAwardTypeChange() {
        if (this.result.proposal.awardTypeCode === 'null') {
            this.result.proposal.awardType = null;
            this.result.proposal.awardTypeCode = null;
        } else {
            const awardTypeObj = this.result.awardType.find(type =>
                type.awardTypeCode === this.result.proposal.awardTypeCode);
            this.result.proposal.awardType = awardTypeObj;
        }
    }

    leadUnitSelectFunction(selectedLeadUnit) {
        if (selectedLeadUnit) {
            this.setLeadUnit(selectedLeadUnit.unitNumber, selectedLeadUnit.unitName);
        } else {
            this.clearLeadUnit();
        }
        this.setDataChangeFlag();
    }

    setLeadUnit(unitNumber, unitName) {
        this.result.proposal.homeUnitNumber = unitNumber;
        this.result.proposal.homeUnitName = unitName;
    }

    clearLeadUnit() {
        this.result.proposal.homeUnitNumber = null;
        this.result.proposal.homeUnitName = null;
    }

    sponsorSelectFunction(event) {
        if (event != null) {
            this.result.proposal.sponsorName = event.sponsorName;
            this.result.proposal.sponsorCode = event.sponsorCode;
            this.updateSponsorField(this.result.proposal.sponsorName);
        } else {
            this.result.proposal.sponsorName = null;
            this.result.proposal.sponsorCode = null;
        }
        this.setDataChangeFlag();
    }

    primeSponsorSelect(event) {
        if (event != null) {
            this.result.proposal.primeSponsorCode = event.sponsorCode;
            this.result.proposal.primeSponsorName = event.sponsorName;
            this.updatePrimeSponsorField(this.result.proposal.primeSponsorName);
        } else {
            this.result.proposal.primeSponsorCode = null;
            this.result.proposal.primeSponsorName = null;
        }
        this.setDataChangeFlag();
    }

    dateValidation() {
        if (!this.nonMandatoryField ) {
        this.proposalDataBindObj.dateWarningList.clear();
        }
        if (this.result.proposal.endDate != null) {
            this.proposalDataBindObj.mandatoryList.delete('endDate');
            if (compareDates(this.result.proposal.startDate, this.result.proposal.endDate, 'dateObject', 'dateObject') === 1) {
                this.proposalDataBindObj.dateWarningList.set('endDate', '* Please select an end date after start date');
            }
        }
        if (this.result.proposal.sponsorDeadlineDate != null && this.result.proposal.internalDeadLineDate != null &&
            // tslint:disable-next-line:max-line-length
            compareDates(this.result.proposal.internalDeadLineDate, this.result.proposal.sponsorDeadlineDate, 'dateObject', 'dateObject') === 1) {
            this.proposalDataBindObj.dateWarningList.set('internalDeadline', '* Please select an internal deadline date before sponsor deadline date');
        }
        this.deadlineDatesValidation();
        this.getDuration();
    }

    deadlineDatesValidation() {
        const currentDate: Date = new Date();
        currentDate.setHours(0, 0, 0, 0);
        if (this.result.proposal.sponsorDeadlineDate != null &&
            compareDates(this.result.proposal.sponsorDeadlineDate, currentDate, 'dateObject', 'dateObject') === -1) {
            this.proposalDataBindObj.dateWarningList.set('deadlineDate', 'Sponsor deadline date already passed.');
        }
        // KKI Specific Change Don't Delete Remove below if block & uncomment function
        // this.compareAndSetInternalDateMessage();
        if (this.result.proposal.internalDeadLineDate != null &&
            compareDates(this.result.proposal.internalDeadLineDate, currentDate, 'dateObject', 'dateObject') === -1) {
            this.proposalDataBindObj.dateWarningList.set('internalDeadline', 'Internal deadline date already passed.');
        }
    }

    getDuration() {
        if (this.result.proposal.startDate != null && this.result.proposal.endDate != null) {
            this.differenceBetweenDates(this.result.proposal.startDate, this.result.proposal.endDate);
        }
    }
    differenceBetweenDates(startDate, endDate) {
        const DATEOBJ = getDuration(startDate, endDate);
        this.result.proposal.duration = DATEOBJ.durInYears + ' year(s), ' + DATEOBJ.durInMonths +
            ' month(s) & ' + DATEOBJ.durInDays + ' day(s)';
    }

    getInternalDeadlineDate(sponsorDeadlineDate, holidaysArray) {
        this.result.proposal.internalDeadLineDate = this.result.proposal.internalDeadLineDate ?
            this.result.proposal.internalDeadLineDate : null;
        let dateCount = 0;
        this.isDateDecrement = false;
        if (sponsorDeadlineDate !== null && this.result.noOfDays) {
            // There was a mismatch when changing time zone, so date is parsed through new Date()
            this.result.proposal.internalDeadLineDate = new Date(sponsorDeadlineDate);
            do {
                this.result.proposal.internalDeadLineDate.setDate(this.result.proposal.internalDeadLineDate.getDate() - 1);
                (holidaysArray) ? this.checkHolidayAndWeekend(holidaysArray) : this.checkWeekend();
                if (this.isDateDecrement) { dateCount++; }
            } while (dateCount < this.result.noOfDays);
        }
        this.dateValidation();
    }
    checkHolidayAndWeekend(holidaysArray) {
        let isDateDecrement;
        for (const HOLIDAY of holidaysArray) {
            if (this.result.proposal.internalDeadLineDate.getTime() !== new Date(HOLIDAY).getTime() &&
                this.result.proposal.internalDeadLineDate.toString().split(' ')[0] !== 'Sun' &&
                this.result.proposal.internalDeadLineDate.toString().split(' ')[0] !== 'Sat') {
                isDateDecrement = true;
            } else {
                isDateDecrement = false; break;
            }
        }
    }
    checkWeekend() {
        if (this.result.proposal.internalDeadLineDate.toString().split(' ')[0] !== 'Sun' &&
            this.result.proposal.internalDeadLineDate.toString().split(' ')[0] !== 'Sat') {
            this.isDateDecrement = true;
        } else {
            this.isDateDecrement = false;
        }
    }
    /* if keyword is selected from search results,that keyword object and its corresponding code is set to
      'scienceKeyword' and 'scienceKeywordCode' in keyword object and pushes to proposalKeywords array.
      if keyword which is added is a user defined one,then that keyword is set to 'keyword'in keyword object and
       pushes to proposalKeywords array. */
    keywordSelectFunction(event) {
        if (event) {
            this.proposalDataBindObj.selectedKeyword = event.description;
            this.checkDuplicateKeyword();
            if (!this.proposalDataBindObj.keywordWarningText) {
                this.setKeywordObject(event);
            }
            this.clearKeywordSearchBox();
            this.clearKeywordField = new String('true');
        } else {
            this.setKeywordObject(event);
        }
        this.setDataChangeFlag();
    }
    /* sets keyword object */
    setKeywordObject(event) {
        const keywordObject: any = {};
        keywordObject.scienceKeyword = event ? event : null;
        keywordObject.scienceKeywordCode = event ? event.code : null;
        keywordObject.keyword = event ? null : this.proposalDataBindObj.selectedKeyword;
        keywordObject.updateTimeStamp = new Date().getTime();
        keywordObject.updateUser = this._commonService.getCurrentUserDetail('userName');
        if (keywordObject.scienceKeywordCode) {
            this.result.proposal.proposalKeywords.push(keywordObject);
        }
    }
    /* to show add button for adding new keyword while search result of keyword is 'No results' */
    showAddKeywordFunction(event) {
        this.proposalDataBindObj.selectedKeyword = event.searchString;
    }
    /* checks for duplicate keyword in the list of keywords added.if duplication is found in user defined
    keywords which is added to this particular proposal,a modal is shown with a message
    'The keyword is already added in this proposal.Do you want to add this keyword to database for future use?'.
    if duplication is found in keywords selected from search results,a warning message 'keyword already added' is shown.
    if there is no duplication and user wands to add a new keyword which is not in database, a modal is shown with message
    'Do you want to add the keyword to database for future use?'. */
    checkDuplicateKeyword() {
        let dupKeywordObject = null;
        this.proposalDataBindObj.keywordWarningText = null;
        if (this.proposalDataBindObj.selectedKeyword) {
            if (this.result.proposal.proposalKeywords && this.result.proposal.proposalKeywords.length !== 0) {
                dupKeywordObject = this.result.proposal.proposalKeywords.find(dupKeyword =>
                    (dupKeyword.scienceKeyword &&
                        dupKeyword.scienceKeyword.description.toLowerCase() === this.proposalDataBindObj.selectedKeyword.toLowerCase()) ||
                    (dupKeyword.keyword && dupKeyword.keyword.toLowerCase() === this.proposalDataBindObj.selectedKeyword.toLowerCase()));
            }
            if (dupKeywordObject && (dupKeywordObject.scienceKeyword ||
                !this.proposalDataBindObj.keywordWarningText)) {
                this.proposalDataBindObj.keywordWarningText = '* Keyword already added';
                this.clearKeywordField = new String('true');
            }
        } else {
            this.proposalDataBindObj.keywordWarningText = '* Add any keyword';
            this.clearKeywordField = new String('true');
        }
    }

    getSearchValue(event) {
        this.proposalDataBindObj.selectedKeyword = event;
    }

    /**
      * deletes keyword
      * @param  {} id
      * @param  {} index
      * @param  {} data
      */
    deleteKeyword(id, index) {
        this.proposalDataBindObj.keywordWarningText = null;
        if (this.result.proposal.proposalId) {
            this.$subscriptions.push(this._proposalHomeService.deleteProposalKeyword({
                'proposalId': this.result.proposal.proposalId,
                'keywordId': id
            }).subscribe(success => {
                this.actionsAfterKeywordDeletion(index);
            }));
        } else {
            this.result.proposal.proposalKeywords.splice(index, 1);
        }
    }

    /**
     * if there is no duplicate warning, keyword is spliced from the array
     * @param  {} index
     * @param  {} data
     */
    actionsAfterKeywordDeletion(index) {
        this.result.proposal.proposalKeywords.splice(index, 1);
        this.proposalDataBindObj.selectedKeyword = '';
    }

    /* if keyword doesn't exist in database (data contains code), keyword is added to the proposal. Otherwise warning
     such as 'Keyword already exist in database' is shown */
    checkKeywordExistInDatabase(data) {
        if (data && data.code) {
            this.keywordSelectFunction(data);
        } else {
            this.proposalDataBindObj.keywordWarningText = '* Keyword already exist in database';
            this.dataVisibilityObj.addKeywordToDatabase = false;
            this._dataStore.updateStore(['dataVisibilityObj'], this);
        }
    }

    /* adds user defined keyword to database and delete the same keyword added in this particular proposal */
    addKeywordToDatabase(event) {
        if (event) {
            this.proposalDataBindObj.selectedKeyword = event.searchString;
            if (this.proposalDataBindObj.selectedKeyword) {
                this.proposalDataBindObj.selectedKeyword = this.proposalDataBindObj.selectedKeyword.trim();
            }
            this.$subscriptions.push(this._proposalHomeService.addScienceKeyword({
                'scienceKeyword': this.proposalDataBindObj.selectedKeyword,
                'userName': this._commonService.getCurrentUserDetail('userName')
            }).subscribe((data: any) => {
                this.dataVisibilityObj.addKeywordToDatabase = true;
                this.checkKeywordExistInDatabase(data);
                this.clearKeywordField = new String('true');
                this.proposalDataBindObj.selectedKeyword = null;
                this._dataStore.updateStore(['dataVisibilityObj'], this);
            }));
        }
    }

    /* clears keyword search box */
    clearKeywordSearchBox() {
        this.dataVisibilityObj.addKeywordToDatabase = false;
        this.proposalDataBindObj.selectedKeyword = null;
        this._dataStore.updateStore(['dataVisibilityObj'], this);
    }

    /* fibi-base*/
    // extendProposalDate() {
    //   this.dataVisibilityObj.dataChangeFlag = true;
    //   if (this.dataVisibilityObj.isBudgetHeaderFound && this.prevProposalEndDate < this.result.proposal.endDate) {
    //     $('#budgetExtendWarning').modal('show');
    //   }
    //   this.dateValidation(null);
    // this._dataStore.updateStore(['dataVisibilityObj'], this);
    // }

    /* below changes are made for NTU and fibi base
    * warning message triggers only when budget is created
    */
    proposalDate(): void {
        if (this.dataVisibilityObj.isBudgetHeaderFound && (this.result.proposal.startDate || this.result.proposal.endDate)) {
            $('#budgetExtendWarning').modal('show');
        }
    }

    saveProposal() {
        this.saveProposalDetails();
        $('#budgetExtendWarning').modal('hide');
    }

    proposalDisciplineClusterChange(clusterCode) {
        if (clusterCode != null) {
            const disciplineClusterObj = this.result.disciplineClusters.find(cluster => cluster.id === clusterCode);
            if (disciplineClusterObj != null) {
                this.result.proposal.disciplineCluster = disciplineClusterObj;
            }
        } else { this.result.proposal.disciplineCluster = null; }
    }

    grantCallSelectFunction(selectedGrantCall) {
        this.proposalDataBindObj.isGrantClosingDateError = false;
        if (selectedGrantCall != null) {
            this.clearCategory();
            this.closingDateValidation(selectedGrantCall.closingDate);
            this.setProposalDetails(selectedGrantCall);
            this.preloadRCBF();
            this.setDataChangeFlag();
        } else {
            this.result.proposal.grantCallId = null;
            this.result.proposal.grantCallName = null;
            this.removeGrantCallDetails();
        }
    }
    // rcbfFundingStatusCode and rcbfTypeCode will be read from from paramater table
    preloadRCBF() {
        if (this.fundingSourceTypeCode === this.result.rcbfFundingStatusCode) {
            this.result.proposal.activityTypeCode = this.result.rcbfTypeCode;
            this.proposalCategoryChange();
        }
    }

    /* assigns elastic result to an object */
    selectedMemberName(value) {
        if (value) {
            this.selectedMemberObject = value;
            this.result.isNonEmployee = this.isEmployeeFlag ? false : true;
            this.result.piPersonId = this.isEmployeeFlag ? value.prncpl_id : value.rolodex_id;
            this.proposalDataBindObj.isPiError = false;
            this.proposalDataBindObj.mandatoryList.delete('piPersonId');
            if (value.unit_number) {
                this.checkUnitRight(value.unit_number, 'CREATE_PROPOSAL').then((isRightExists: boolean) => {
                    if (isRightExists) {
                        this.setLeadUnit(value.unit_number, value.unit_name);
                        this.unitHttpOptions.defaultValue = concatUnitNumberAndUnitName(value.unit_number, value.unit_name);
                        this.clearLUField = new String('false');
                        this.proposalDataBindObj.isUnitError = false;
                        this.proposalDataBindObj.mandatoryList.delete('unit');
                    }
                });
            }
        } else {
            this.selectedMemberObject.full_name = null;
            this.result.piPersonId = null;
            this.clearLeadUnit();
            this.clearLUField = new String('true');
        }
        this.setDataChangeFlag();
    }

    checkUnitRight(unitNumber, right) {
        return new Promise((resolve, reject) => {
            this.$subscriptions.push(this._proposalService.checkUnitRight({
                'unitNumber': unitNumber, 'rightName': right
            }).subscribe((data: any) => {
                resolve(data.isRightExist);
            }));
        });
    }

    constructDepartmentHttpOptions(unitNumber, unitName) {
        const httpOptions = getEndPointOptionsForLeadUnit(concatUnitNumberAndUnitName(unitNumber, unitName));
        httpOptions.params = {
            check: 'all',
            rightName: ['CREATE_PROPOSAL']
        };
        return httpOptions;
    }

    /** Clears validation as soon as date gets picked and also shows validation when field gets cleared.
     *  This validation occurs before action(save or proceed).
    */
    dateValidationBeforeAction(dateToCheck: any, mappedString: string, validationMessage: string) {
        this.proposalDataBindObj.mandatoryList.delete(mappedString);
        if (!dateToCheck) {
            this.proposalDataBindObj.mandatoryList.set(mappedString, validationMessage);
        }
    }



    /** Saves proposal basic details to craete proposal
      */
    saveProposalDetails() {
        this.proposalDataBindObj.keywordWarningText = null;
        this.dataVisibilityObj.isProposalSaved = true;
        this._dataStore.updateStore(['dataVisibilityObj'], this);
        const isMandatoryFilled = this.overviewValidation();
        if (this.result.proposal.abstractDescription) {
            this.updateEditorContent();
            this.editorValidation(this.result.proposal.abstractDescription);
        }
        if (this.dataVisibilityObj.dataChangeFlag) {
            if (isMandatoryFilled && !this.proposalDataBindObj.isGrantClosingDateError &&
                !this.proposalDataBindObj.mandatoryList.has('abstract') && !this.isSaving) {
                this.isSaving = true;
                const TYPE = (this.result.proposal.proposalId != null) ? 'UPDATE' : 'SAVE';
                if (TYPE === 'SAVE') {
                    this.result.proposal.createUser = this._commonService.getCurrentUserDetail('userName');
                    this.result.proposal.createTimeStamp = new Date().getTime();
                }
                this.result.proposal.documentStatusCode = this.result.proposal.documentStatusCode ?
                    this.result.proposal.documentStatusCode : '1';
                this.result.proposal.updateUser = this._commonService.getCurrentUserDetail('userName');
                this.result.proposal.updateTimeStamp = new Date().getTime();
                this.convertDateFormatWithoutTimeStamp();
                this.$subscriptions.push(this._proposalHomeService.saveProposalDetails({
                    'proposalId': this.result.proposal.proposalId,
                    'isNonEmployee': this.result.isNonEmployee,
                    'proposal': this.result.proposal,
                    'updateType': TYPE, 'piPersonId': this.result.piPersonId,
                    'percentageOfEffort': this.result.percentageOfEffort,
                }).subscribe(async (data: any) => {
                    this._proposalService.proposalStartDate = data.proposal.startDate;
                    this._proposalService.proposalEndDate = data.proposal.endDate;
                    this._proposalService.internalDeadLineDate = data.proposal.internalDeadLineDate;
                    this._proposalService.sponsorDeadlineDate = data.proposal.sponsorDeadlineDate;
                    if (data.grantEligibilityStatus && data.grantEligibilityStatus.status === 'TRUE') {
                        this.updateStoreOnSave(data);
                        this.dataVisibilityObj.dataChangeFlag = false;
                        this.setUnsavedChanges(false);
                        this._proposalService.proposalTitle = data.proposal.title;
                        this.dataVisibilityObj.grantCallId = data.grantCall ? data.grantCall.grantCallId : null;
                        this.departmentLevelRightsForProposal = this._proposalService.checkDepartmentLevelPermission(data.availableRights);
                        this.enableOrDisableGrantCall();
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Proposal saved successfully.');
                        this.dataVisibilityObj.isProposalSaved = true;
                        if (TYPE === 'SAVE') {
                            this._dataStore.updateStore(['proposalPersons'], data);
                            await this._webSocket.isModuleLocked('Proposal', this.result.proposal.proposalId);
                            this._webSocket.getLockForModule('Proposal', this.result.proposal.proposalId);
                            this.clearPIpersonID();
                            this._proposalService.proposalMode = this.dataVisibilityObj.mode = 'edit';
                            this._router.navigate(['/fibi/proposal/overview'], { queryParams: { 'proposalId': data.proposal.proposalId } });
                        }
                        this._dataStore.updateStore(['dataVisibilityObj'], this);
                        this.isAwardCard = false;
                    } else {
                        this._dataStore.updateStore(['grantEligibilityStatus'], data);
                        $('#EligibilityWarningProceedModal').modal('show');
                    }
                    this.isSaving = false;
                    this._autoSaveService.clearErrors();
                }, err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Save Proposal failed. Please try again.');
                    this.isSaving = false;
                    this.revertDateChange();
                    this._autoSaveService.errorEvent(
                        { name: 'General Proposal Information', documentId: this.SECTION_ID, type: 'API' });
                }));
            } else if (!this.isSaving && this.result.proposal.proposalId) {
                this._autoSaveService.errorEvent(
                    { name: 'General Proposal Information', documentId: this.SECTION_ID, type: 'VALIDATION' });
            }
        }
    }

    private updateStoreOnSave(data) {
        this.result.proposal = data.proposal;
        if (!this._activatedRoute.snapshot.queryParams['proposalId']) {
            this._dataStore.updateStore(this.dataDependencies.concat(['proposalOrganizations', 'proposalKpis']), data);
        } else if (this.result.proposalKpis.length !== data.proposalKpis.length) {
            this._dataStore.updateStore(this.dataDependencies.concat(['proposalKpis']), data);
        } else {
            this._dataStore.updateStore(this.dataDependencies, data);
        }
    }

    revertDateChange() {
        this.result.proposal.startDate = getDateObjectFromTimeStamp(this.result.proposal.startDate);
        this.result.proposal.endDate = getDateObjectFromTimeStamp(this.result.proposal.endDate);
    }

    openDateChangeModal() {
        if (this.dataVisibilityObj.isBudgetHeaderFound) {
            this.setProposalDateChange();
        } else {
            this.saveProposalDetails();
        }
    }

    setProposalDateChange() {
        if ((compareDates(getDateObjectFromTimeStamp(this._proposalService.proposalStartDate), this.result.proposal.startDate) === -1) ||
            (compareDates(getDateObjectFromTimeStamp(this._proposalService.proposalEndDate), this.result.proposal.endDate) === -1)) {
            this._proposalService.proposalDateChangeType = 'INC';
            this.proposalDate();
            this._proposalService.$isShowDateWarning.next(false);
        } else if ((compareDates(getDateObjectFromTimeStamp(this._proposalService.proposalStartDate), this.result.proposal.startDate) === 1)
            || (compareDates(getDateObjectFromTimeStamp(this._proposalService.proposalEndDate), this.result.proposal.endDate) === 1)) {
            this._proposalService.proposalDateChangeType = 'DEC';
            this.proposalDate();
            this._proposalService.$isShowDateWarning.next(false);
        } else {
            this.saveProposalDetails();
        }
    }

    convertDateFormatWithoutTimeStamp() {
        this.result.proposal.startDate = parseDateWithoutTimestamp(this.result.proposal.startDate);
        this.result.proposal.sponsorDeadlineDate = parseDateWithoutTimestamp(this.result.proposal.sponsorDeadlineDate);
        this.result.proposal.internalDeadLineDate = parseDateWithoutTimestamp(this.result.proposal.internalDeadLineDate);
        this.result.proposal.endDate = parseDateWithoutTimestamp(this.result.proposal.endDate);
    }

    /** method saves grant if grantCallId has value, otherwise function act as remove grant call
     * @param grantCallId
     */
    removeGrantCallDetails() {
        if (this.result.proposal.proposalId != null && this.result.grantCall != null && this.result.grantCall.grantCallName != null) {
            this.$subscriptions.push(this._proposalHomeService.saveOrRemoveGrantCall({
                'updateUser': this._commonService.getCurrentUserDetail('userName'),
                'proposalId': this.result.proposal.proposalId
            }).subscribe((data: any) => {
                this.result.grantCall = null;
                this.result.proposal.grantCallId = data.proposal.grantCallId;
                this.result.proposalKpis = data.proposalKpis;
                this.tempProposal.grantCallId = data.proposal.grantCallId;
                this._dataStore.manualDataUpdate({'proposal': this.tempProposal});
                this._dataStore.updateStore(['proposalKpis', 'grantCall'], this.result);
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Grant Call removed successfully.');
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Removing Grant Call failed. Please try again.');
            }));
        } else {
            this.result.grantCall = null;
            this.result.proposalKpis = [];
        }
    }

    /** to trigger ngOnChange of endpointsearch to update the value of sponsor according to grant
   * @param defaultValue
   * @param clearField
   */
    updateSponsorField(defaultValue) {
        this.sponsorHttpOptions.defaultValue = defaultValue;
        this.clearSponsorField = new String('false');
    }

    /** to trigger ngOnChange of endpointsearch to update the value of prime sponsor according to grant
   * @param defaultValue
   */
    updatePrimeSponsorField(defaultValue) {
        this.primeSponsorHttpOptions.defaultValue = defaultValue;
        this.clearPrimeSponsorField = new String('false');
    }

    /* clear PI personID after first save of proposal to avoid passing piPersonId in all 'saveProposalDetails' service calls*/
    clearPIpersonID() {
        this.result.piPersonId = null;
        this._dataStore.updateStore(['piPersonId'], this.result);
    }

    /* clears category field */
    clearCategory() {
        this.result.proposal.activityTypeCode = null;
        this.result.proposal.activityType = null;
    }

    changeGrantType() {
        // tslint:disable:triple-equals
        if (this.result.proposal.grantTypeCode && this.result.proposal.grantTypeCode !== 'null') {
            const grantTypeObj = this.result.grantCallTypes
                .find(grantType => grantType.grantTypeCode == this.result.proposal.grantTypeCode);
            if (grantTypeObj != null) {
                this.result.proposal.grantCallType = grantTypeObj;
                this.result.proposal.grantTypeCode = grantTypeObj.grantTypeCode;
                this.result.proposal.categoryCode = grantTypeObj.categoryCode;
            }
        } else {
            this.result.proposal.grantCallType = null;
            this.result.proposal.grantTypeCode = null;
            this.result.proposal.categoryCode = null;
        }
        if (this.result.enableActivityGrantCallMapping) {
            this.result.proposal.activityTypeCode = null;
        }
    }

    /* set proposal details according to selected grant call */
    setProposalDetails(selectedGrantCall) {
        this.result.proposal.grantCallId = selectedGrantCall.grantCallId;
        this.fundingScheme = selectedGrantCall.sponsorFundingScheme ? selectedGrantCall.sponsorFundingScheme.description : '';
        this.result.proposal.sponsorDeadlineDate = selectedGrantCall.closingDate != null ?
            getDateObjectFromTimeStamp(selectedGrantCall.closingDate) : null;
        this.result.proposal.internalDeadLineDate = selectedGrantCall.internalSubmissionDeadLineDate != null ?
            getDateObjectFromTimeStamp(selectedGrantCall.internalSubmissionDeadLineDate) : null;
        this.result.proposal.sponsorName = selectedGrantCall.sponsorName;
        this.result.proposal.sponsorCode = selectedGrantCall.sponsorCode;
        this.result.proposal.primeSponsorName = selectedGrantCall.primeSponsor ? selectedGrantCall.primeSponsor.sponsorName : null;
        this.result.proposal.primeSponsorCode = selectedGrantCall.primeSponsor ? selectedGrantCall.primeSponsor.sponsorCode : null;
        // this.setLeadUnit(selectedGrantCall.homeUnitNumber, selectedGrantCall.homeUnitName);
        this.updateSponsorField(this.result.proposal.sponsorName);
        this.updatePrimeSponsorField(this.result.proposal.primeSponsorName);
        this.result.proposal.grantCallType = selectedGrantCall.grantCallType;
        this.result.proposal.categoryCode = selectedGrantCall.grantCallType != null ? selectedGrantCall.grantCallType.categoryCode : null;
        this.result.proposal.grantTypeCode = selectedGrantCall.grantCallType != null ? selectedGrantCall.grantCallType.grantTypeCode : null;
        this.fundingSourceTypeCode = selectedGrantCall.sponsorFundingScheme != null ?
            selectedGrantCall.sponsorFundingScheme.fundingSchemeCode : null;
    }

    /* check whether grant call is closed or not */
    closingDateValidation(closingDate) {
        if (!this.result.enableClosedGrantCallLinkingInProposal &&
            (compareDates(closingDate, getCurrentTimeStamp(), 'dateObject', 'timeStamp') === -1)) {
            this.proposalDataBindObj.isGrantClosingDateError = true;
        }
    }

    editorMaxLength(editorString) {
        if (editorString) {
            let ngxInput = editorString;
            ngxInput = ngxInput.replace('<[^>]+>', '');
            return (ngxInput.length > 99999) ? true : false;
        } else {
            return false;
        }
    }

    editorValidation(abstract) {
        this.proposalDataBindObj.mandatoryList.delete('abstract');
        if (abstract && this.editorMaxLength(abstract)) {
            this.proposalDataBindObj.mandatoryList.set('abstract', 'The abstract should be less than 1,00,000 characters');
        }
    }

    /** changeMemberType - if a person is employee then sets fibiperson elastic search otherwise sets fibirolodex elastic search */
    changeMemberType() {
        this.clearPIpersonID();
        this.clearLeadUnit();
        this.clearLUField = new String('true');
        this.piElasticSearchOptions.defaultValue = '';
        (this.isEmployeeFlag) ? this.setElasticPersonOption() : this.setElasticRolodexOption();
        this.setDataChangeFlag();
    }
    /**setElasticPersonOption - Set Elastic search option for Fibi Person */
    setElasticPersonOption() {
        this.piElasticSearchOptions = this._elasticConfig.getElasticForPerson();
    }

    /**setElasticRolodexOption - Set Elastic search option for Fibi rolodex */
    setElasticRolodexOption() {
        this.piElasticSearchOptions = this._elasticConfig.getElasticForRolodex();
    }

    filterGrantTypes() {
        this.result.grantCallTypes = this.result.grantCallTypes.filter(type => type.grantTypeCode !== 10);
    }

    /* disables title of grant call field and shows edit icon ,if grant call is linked and saved to the proposal.*/
    enableOrDisableGrantCall() {
        this.isDisableTitleOfGrantCall = this.result.grantCall ? true : false;
    }

    setGrantDetailsValue(isShowModal) {
        this.showGrantDetails = isShowModal;
    }

    selectAward(event) {
        this.awardDetails = event;
        this.isAwardCard = event ? true : false;
        if (event) {
            this.result.proposal.awardId = this.awardDetails.award_id;
            this.result.proposal.awardNumber = this.awardDetails.award_number;
        } else {
            this.result.proposal.awardId = null;
            this.result.proposal.awardNumber = null;
        }
        this.setDataChangeFlag();
    }

    openProposal(id: number) {
        const url = window.location.origin + window.location.pathname + '#/fibi/proposal?proposalId=' + id;
        window.open(url, '_blank');
    }

    listenForGlobalSave() {
        this.$subscriptions.push(this._autoSaveService.autoSaveTrigger$.subscribe(_saveClick => {
            if (this._proposalHomeService.hasProposalOverviewChanged) {
                this.openDateChangeModal();
            }
        }));
    }

    setDataChangeFlag() {
        this.dataVisibilityObj.dataChangeFlag = true;
        this._dataStore.updateStore(['dataVisibilityObj'], this);
        this.setUnsavedChanges(true);
    }

    resetValidations() {
        this.proposalDataBindObj.isSponsorError = false;
        this.proposalDataBindObj.isUnitError = false;
        this.proposalDataBindObj.isPiError = false;
        this.proposalDataBindObj.clearPIField = String(false);
        if (!this.formatChecker.endDateValidation && !this.formatChecker.startDateValidation) {
            this.proposalDataBindObj.mandatoryList.clear();
        }
        this.dataVisibilityObj.isBudgetPeriodDate = false;
    }

    overviewValidation() {
        this.resetValidations();
        if (this.result.proposal.title === '' || this.result.proposal.title == null) {
            this.proposalDataBindObj.mandatoryList.set('title', true);
        }
        if (this.result.proposal.grantTypeCode == null || this.result.proposal.grantTypeCode === 'null') {
            this.proposalDataBindObj.mandatoryList.set('grant-type', true);
        }
        if (this.result.proposal.activityTypeCode == null || this.result.proposal.activityTypeCode === 'null') {
            this.proposalDataBindObj.mandatoryList.set('category', true);
        }
        if (this.result.proposal.typeCode == null || this.result.proposal.typeCode === 'null') {
            this.proposalDataBindObj.mandatoryList.set('type', true);
        }
        if (!this.result.proposal.proposalId && (!this.result.proposal.homeUnitName || !this.result.proposal.homeUnitNumber)) {
            this.proposalDataBindObj.mandatoryList.set('unit', true);
            this.proposalDataBindObj.isUnitError = true;
        }
        if (this.result.proposal.sponsorName === '' || this.result.proposal.sponsorName == null ||
            this.result.proposal.sponsorCode === null) {
            this.proposalDataBindObj.mandatoryList.set('sponsor', true);
            this.proposalDataBindObj.isSponsorError = true;
        }
        if (this.result.proposal.startDate === '' || this.result.proposal.startDate == null) {
            this.proposalDataBindObj.mandatoryList.set('startDate', true);
        }
        if (this.result.proposal.endDate === '' || this.result.proposal.endDate == null) {
            this.proposalDataBindObj.mandatoryList.set('endDate', true);
        }
        if (this.result.proposal.proposalId == null && this.result.piPersonId == null) {
            this.proposalDataBindObj.mandatoryList.set('piPersonId', true);
            this.proposalDataBindObj.isPiError = true;
        }
        // KKI Specific Change Don't Delete
        // if (this.result.proposal.sponsorDeadlineDate === '' || this.result.proposal.sponsorDeadlineDate == null) {
        //   this.proposalDataBindObj.mandatoryList.set('deadlineDate', true);
        // }
        if (this.proposalDataBindObj.mandatoryList.size !== 0 || this.proposalDataBindObj.dateWarningList.has('endDate') &&
            !this.dataVisibilityObj.isBudgetPeriodDate) {
            return false;
        }
        if (this.formatChecker.endDateValidation && this.formatChecker.startDateValidation) {
            return false;
        }
        return true;
    }

    setUnsavedChanges(flag: boolean) {
        if (this.hasUnsavedChanges !== flag) {
            this._autoSaveService.setUnsavedChanges('General Proposal Information', this.SECTION_ID, flag, true);
        }
        this.hasUnsavedChanges = flag;
        this._proposalHomeService.hasProposalOverviewChanged = flag;
    }

    limitKeypress(value) {
        this.proposalDataBindObj.mandatoryList.delete('percentageOfEffort');
        if (validatePercentage(value)) {
            this.proposalDataBindObj.mandatoryList.set('percentageOfEffort', validatePercentage(value));
        }
    }

    getSystemDate() {
        return new Date(new Date().setHours(0, 0, 0, 0));
    }

    checkForValidFormat(date, type) {
        if (!isValidDateFormat(date)) {
            if (type === 'startDate') {
                this.formandatoryFields('startDateFormat');
            } else if (type === 'endDate') {
                this.formandatoryFields('endDateFormat');
            } else if (type == 'subDt') {
                this.forNonMandatoryFields('subdtFormat');
            }
        } else if (isValidDateFormat(date)) {
            if (type === 'startDate') {
                this.validationRemoverForMandatoryFields('startDateFormat');
            } else if (type === 'endDate') {
                this.validationRemoverForMandatoryFields('endDateFormat');
            } else if (type == 'subDt') {
                this.validationRemoverForNonMandatoryFields('subdtFormat');
            }
        }
    }

    formandatoryFields(flag) {
        this.proposalDataBindObj.mandatoryList.set(flag, true);
        if (flag === 'startDateFormat') {
            this.formatChecker.startDateValidation = true;
        } else if (flag === 'endDateFormat') {
            this.formatChecker.endDateValidation = true;
        }
    }

    validationRemoverForMandatoryFields(flag) {
        this.proposalDataBindObj.mandatoryList.delete(flag);
        if (flag === 'startDateFormat') {
            this.formatChecker.startDateValidation = false;
        } else if (flag === 'endDateFormat') {
            this.formatChecker.endDateValidation = false;
        }
    }

    forNonMandatoryFields(flag) {
        this.proposalDataBindObj.dateWarningList.set(flag, true);
        this.nonMandatoryField = true;
    }

    validationRemoverForNonMandatoryFields(flag) {
        this.proposalDataBindObj.dateWarningList.delete(flag);
        this.nonMandatoryField = false;
    }

    clearDateOnValidation(id) {
        if (id === 'prop-start-date-icon' && this.formatChecker.startDateValidation) {
            this.result.proposal.startDate = this.getSystemDate();
            this.validationRemoverForMandatoryFields('startDateFormat');
            this.calenderOpener(id);
        } else if (id === 'prop-end-date-icon' && this.formatChecker.endDateValidation) {
            this.result.proposal.endDate = this.getSystemDate();
            this.validationRemoverForMandatoryFields('endDateFormat');
            this.calenderOpener(id);
        } else if (id === 'prop-sub-date-icon' && this.nonMandatoryField) {
            this.result.proposal.sponsorDeadlineDate = this.getSystemDate();
            this.validationRemoverForNonMandatoryFields('subdtFormat');
            this.calenderOpener(id);
        } else {
            this.calenderOpener(id);
        }
    }

    calenderOpener(id) {
        setTimeout(() => {
            document.getElementById(id).click();
        });
    }


}
