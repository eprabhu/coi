/** last updated by Ramlekshmy on 06-07-2020 */
import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { GrantCallService } from '../../../services/grant.service';
import { CommonService } from '../../../../common/services/common.service';
import {
    deepCloneObject,
    removeUnwantedTags,
    setFocusToElement,
} from '../../../../common/utilities/custom-utilities';
import { environment } from '../../../../../environments/environment';
import { DEFAULT_DATE_FORMAT, EDITOR_CONFIURATION, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { compareDates, getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../../common/utilities/date-utilities';
import { Subscription } from 'rxjs';
import { GeneralDetailsService } from './general-details.service';
import { GrantCommonDataService } from '../../../services/grant-common-data.service';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { getEndPointOptionsForSponsor, getEndPointOptionsForSponsorByType, getEndPointOptionsForLeadUnit } from '../../../../common/services/end-point.config';
import { concatUnitNumberAndUnitName } from '../../../../common/utilities/custom-utilities';
import { AutoSaveService } from '../../../../common/services/auto-save.service';

declare var $: any;

@Component({
    selector: 'app-general-details-edit',
    templateUrl: './general-details-edit.component.html',
    styleUrls: ['./general-details-edit.component.css']
})
export class GeneralDetailsEditComponent implements OnInit, OnDestroy {

    SECTION_ID = 'grantcall-general-section';
    @Input() result: any = {};
    @Input() map: any = {};
    @Input() mode: any = {};
    editorValidate = new Map();
    mapSponsor = new Map();
    mapNonMandatory = new Map();
    submissionDateWarningText = false;
    selectedGrantCallType = null;
    selectedSponsorType = null;
    homeUnitName = null;
    selectedCurrency = null;
    selectedFundingType = null;
    selectedKeyword: string;
    clearField;
    removeObjIndex: number;
    removeObjId: number;
    public configUrl = environment.deployUrl + './assets/app-data-config.json';
    elasticSearchOptions: any = {};
    keywordHttpOptions: any = {};
    fundingAgencyHttpOptions: any = {};
    primeSponsorHttpOptions: any = {};
    completerOptions: any = {};
    keywords: any = [];
    setFocusToElement = setFocusToElement;
    clearLeadUnitField: any;
    grantCallObject: any = {};
    warningMsg: any = {};

    @Output() grantResults: EventEmitter<any> = new EventEmitter<any>();
    clearKeywordField: String;
    clearFundingAgencySearchField: String;
    deployMap = environment.deployUrl;
    sponsorDetails: any = {};
    departmentHttpOptions: any = {};
    unitHttpOptions: any = {};
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    $subscriptions: Subscription[] = [];
    isAddKeywordToDatabase: boolean;
    showAddSponsorModal: boolean;
    warningMessage = new Map();
    public Editor = DecoupledEditor;
    editorConfig = EDITOR_CONFIURATION;
    isSaving = false;
    isEnableUserDefinedFundingAgency = false;

    constructor(private _router: Router,
                private _grantService: GrantCallService,
                public commonData: GrantCommonDataService,
                public commonService: CommonService,
                private _generalDetailsService: GeneralDetailsService,
                private _autoSaveService: AutoSaveService) { }

    ngOnInit() {
        this.map.clear();
        // Commented the filtering
        // this.grantCallObject.grantStatusArray = this.result.grantCallStatus.filter(status => status.grantStatusCode === 1);
        this.setKeywordEndpointSearchOptions();
        this.setFundingAgencyEndPointSearchOptions(this.result.grantCall.sponsorTypeCode != null ? this.result.grantCall.sponsorTypeCode : '');
        this.setGrantCallCurrency();
        this.setCompleterOptions();
        if (this.result.grantCall.grantCallId) {
            this.setFundingObject();
        }
        this.unitHttpOptions = getEndPointOptionsForLeadUnit(`${this.result.grantCall.homeUnitNumber} - ${this.result.grantCall.homeUnitName}`);
        this.departmentHttpOptions = this._grantService.setEndPointSearchOptions('unitName', 'unitName', 'findDepartment', null, null);
        this.setPrimeSponsorEndPointSearchOptions();
        this.setOverHead();
        if (!this.result.grantCall.grantCallId) {
            this.grantCallUnitInitialize();
        }
        this.grantCallObject.selectedGrantStatus = this.result.grantCall.grantCallStatus.description;
        this.setDateObject();
        this.saveGrantCallDetails();
        this.isEnableUserDefinedFundingAgency = this.result.enableUserDefinedFundingAgency;
        this.listenForGlobalSave();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
        this._autoSaveService.clearUnsavedChanges();
    }

    public onReady(editor) {
        editor.ui.getEditableElement().parentElement.insertBefore(
            editor.ui.view.toolbar.element,
            editor.ui.getEditableElement()
        );
    }

    /**
     * @param
     * To set selected rateclass details to object
     */
    setFandAType(rateClassCode) {
        if (rateClassCode) {
            this.result.grantCall.rateType = this.result.rateTypes.find(item => item.rateClassCode === rateClassCode);
            this.result.grantCall.rateTypeCode = this.result.grantCall.rateType.rateTypeCode;
        }
    }

    /**
     * @param
     * to set overhead details in initial load if exist
     */
    setOverHead() {
        this.grantCallObject.isOverHead = (this.result.grantCall.rateTypeCode) ? true : false;
        this.result.grantCall.rateClassCode = (this.result.grantCall.rateClassCode) ? this.result.grantCall.rateClassCode : null;
    }

    saveGrantCallDetails() {
        this.$subscriptions.push(this._grantService.isSaveGrantcall.subscribe(() => {
            if (this.isFormValid()) {
                this.commonRequestObjects();
                this.commonData.$isMandatoryFilled.next(false);
                this.updateGrantCallStoreData();
            }
        }));
    }
    
    setGrantCallCurrency() {
        /* making SGD as default currency code */
        const currencyDetailObject = this.result.currencyDetail.find(type => type.currencyCode === 'SGD');
        if (this.result.grantCall.currency == null && currencyDetailObject != null) {
            this.result.grantCall.currencyCode = currencyDetailObject.currencyCode;
            this.result.grantCall.currency = currencyDetailObject;
        }
        this.selectedCurrency = (this.result.grantCall.currency != null) ?
            this.result.grantCall.currency.currencyCode : currencyDetailObject.currencyCode;
    }

    setCompleterOptions() {
        this.completerOptions.arrayList = this.result.relevantFields;
        this.completerOptions.contextField = 'description';
        this.completerOptions.filterFields = 'description';
        this.completerOptions.formatString = 'description';
    }
    
    checkClosingDatePassed() {
        this.warningMsg.closingDateWarning = null;
        const currentDate: Date = new Date();
        currentDate.setHours(0, 0, 0, 0);
        if (this.grantCallObject.closingDate) {
            if (compareDates(currentDate, (this.grantCallObject.closingDate)) === 1) {
                this.warningMsg.closingDateWarning = 'Selected closing date has already passed.';
            } 
        }
    }

    setFundingObject() {
        this.selectedSponsorType = (this.result.grantCall.sponsorType != null) ?
            this.result.grantCall.sponsorType.code : null;
        this.selectedGrantCallType = this.result.grantCall.grantCallType.description;
        this.selectedFundingType = (this.result.grantCall.sponsorFundingScheme != null) ?
            this.result.grantCall.sponsorFundingScheme.fundingSchemeId : null;
    }

    setDateObject() {
        this.grantCallObject.openingDate = getDateObjectFromTimeStamp(this.result.grantCall.openingDate);
        this.grantCallObject.internalSubmissionDeadlineDate = getDateObjectFromTimeStamp
            (this.result.grantCall.internalSubmissionDeadLineDate);
        this.grantCallObject.closingDate = getDateObjectFromTimeStamp(this.result.grantCall.closingDate);
        this.result.grantCall.closingTime = this.result.grantCall.closingTime ? this.result.grantCall.closingTime : '17:00:00';
    }

    selectedTime(timeObject) {
        this.result.grantCall.closingTime = timeObject.time ? timeObject.time : null;
        this.commonData.isGrantCallDataChange = timeObject.isChange;
    }

    grantCallUnitInitialize() {
        this.$subscriptions.push(this._grantService.getPersonInformation(this.commonService.getCurrentUserDetail('personID')).subscribe(
            (data: any) => {
                this.unitHttpOptions = getEndPointOptionsForLeadUnit(concatUnitNumberAndUnitName(data.unit.unitNumber, data.unit.unitName));
                this.setLeadUnit(data.unit.unitNumber, data.unit.unitName);
            }));
    }

    clearLeadUnit(event) {
        if (event) {
            this.setUnsavedChanges(true);
        }
    }

    setLeadUnit(unitNumber, unitName) {
        this.result.grantCall.homeUnitNumber = unitNumber;
        this.result.grantCall.homeUnitName = unitName;
    }

    /**
    * Set Endpoint  search option for keyword
    */
    setKeywordEndpointSearchOptions() {
        this.keywordHttpOptions = this._grantService.setEndPointSearchOptions('description', 'description', 'findKeyWords', '', null);
    }

    /**
    * Set Endpoint search option for Prime Sponsor
    */
    setPrimeSponsorEndPointSearchOptions() {
        this.primeSponsorHttpOptions = getEndPointOptionsForSponsor({ defaultValue: this.result.grantCall.primeSponsorName });
    }

    /** assigns selected grant call to result object */
    grantCallTypeChange() {
        this.setUnsavedChanges(true);
        if (this.selectedGrantCallType === 'null') {
            this.result.grantCall.grantCallType = null;
            this.result.grantCall.grantTypeCode = null;
        } else {
            const grantCallTypeObj = this.result.grantCallTypes.find(type => type.description === this.selectedGrantCallType);
            this.result.grantCall.grantCallType = grantCallTypeObj;
            this.result.grantCall.grantTypeCode = grantCallTypeObj.grantTypeCode;
        }
        this.result.grantCall.externalUrl = null;
        this.grantCallObject.internalSubmissionDeadlineDate = null;
    }

    currencyTypeChange() {
        this.setUnsavedChanges(true);
        if (this.selectedCurrency === 'null' || this.selectedCurrency == null) {
            this.result.grantCall.currencyCode = null;
            this.result.grantCall.currency = null;
        } else {
            const currencyObj = this.result.currencyDetail.find(type => type.currencyCode === this.selectedCurrency);
            if (currencyObj != null) {
                this.result.grantCall.currencyCode = currencyObj.currencyCode;
                this.result.grantCall.currency = currencyObj;
            }
        }
    }

    dateValidation() {
        this.warningMsg.dateWarningText = null;
        if (this.grantCallObject.closingDate != null) {
            if (compareDates((this.grantCallObject.openingDate), (this.grantCallObject.closingDate)) === 1) {
                this.warningMsg.dateWarningText = '* Please select a closing date after opening date';
            }
        }
    }

    submissionDateValidation() {
        if (this.grantCallObject.internalSubmissionDeadlineDate && this.result.grantCall.grantCallType.categoryCode === 2 &&
            (compareDates(this.grantCallObject.openingDate, this.grantCallObject.internalSubmissionDeadlineDate) === 1) ||
            (compareDates(this.grantCallObject.internalSubmissionDeadlineDate, this.grantCallObject.closingDate) === 1)) {
            this.submissionDateWarningText = true;
        } else {
            this.submissionDateWarningText = false;
        }
    }

    internalSubmissionDateValidation() {
        this.submissionDateWarningText = false;
        if (this.grantCallObject.openingDate !== null && this.grantCallObject.closingDate !== null ) {
          this.submissionDateValidation();
        }
    }

    /** assigns selected relevant field */
    relevantFieldChange(selectedRelevantField) {
        const relevantFieldObject: any = {};
        if (selectedRelevantField) {
            this.checkDuplicateRelevantField(selectedRelevantField);
            if (!this.warningMsg.relevantFieldWarningMessage && selectedRelevantField) {
                relevantFieldObject.relevantFieldCode = selectedRelevantField.relevantFieldCode;
                relevantFieldObject.updateTimestamp = new Date().getTime();
                relevantFieldObject.updateUser = this.commonService.getCurrentUserDetail('userName');
                relevantFieldObject.relevantField = selectedRelevantField;
                this.result.grantCall.grantCallRelevants.push(relevantFieldObject);
                this.clearField = new String('true');
                this.warningMsg.relevantFieldWarningMessage = null;
                selectedRelevantField = null;
            }
        }
        this.setUnsavedChanges(true);
    }

    /* checks duplicate relevant field added or not */
    checkDuplicateRelevantField(selectedRelevantField) {
        this.warningMsg.relevantFieldWarningMessage = null;
        const dupRelevantFieldObj = this.result.grantCall.grantCallRelevants.find
            (relevant => (selectedRelevantField) &&
                relevant.relevantFieldCode === (selectedRelevantField.relevantFieldCode));
        if (dupRelevantFieldObj) {
            this.warningMsg.relevantFieldWarningMessage = 'Relevant field already added';
            this.clearField = new String('true');
            selectedRelevantField = null;
        }
    }

    /** fetch sponsor names using sponsor type
     * @param type
     */
    fundingAgencyTypeChange(typeCode) {
        this.clearFundingScheme();
        this.clearFundingAgency();
        if (typeCode === 'null' || !typeCode) {
            this.clearFundingAgencyType();
            this.setFundingAgencyEndPointSearchOptions('');
        } else {
            const sponsorTypeObj = this.result.sponsorTypes.find(sponsorType => sponsorType.code === typeCode);
            if (sponsorTypeObj) {
                this.setSponsorType(sponsorTypeObj, 'code');
            }
        }
    }

    setFundingAgencyEndPointSearchOptions(sponsorTypeCode) {
        this.fundingAgencyHttpOptions = getEndPointOptionsForSponsorByType(this.result.grantCall.sponsorName,
            { 'sponsorTypeCode': sponsorTypeCode });
    }

    fundingAgencySelect(event) {
        this.clearFundingAgencyType();
        this.clearFundingScheme();
        if (event === null || !event) {
            this.clearFundingAgency();
        } else {
            this.clearFundingAgencySearchField = 'false';
            if (!this.result.grantCall.sponsorType) {
                this.result.grantCall.sponsorType = event.sponsorType;
                this.selectedSponsorType = this.result.grantCall.sponsorTypeCode = event.sponsorTypeCode;
            }
            this.setSponsor(event);
        }
        this.setUnsavedChanges(true);
    }

    setSponsor(sponsor) {
        this.result.grantCall.sponsor = sponsor;
        this.result.grantCall.sponsorCode = sponsor.sponsorCode;
        this.result.grantCall.sponsorName = sponsor.sponsorName;
        this.$subscriptions.push(this._grantService.fetchFundingSchemeBySponsor({ 'sponsorCode': sponsor.sponsorCode })
            .subscribe((data: any) => {
                this.result.sponsorFundingSchemes = data.sponsorFundingSchemes;
            }));
    }

    clearFundingScheme() {
        this.result.grantCall.sponsorFundingScheme = null;
        this.result.grantCall.fundingSchemeId = null;
        this.selectedFundingType = null;
    }

    clearFundingAgency() {
        this.result.grantCall.sponsor = null;
        this.result.grantCall.sponsorCode = null;
        this.result.grantCall.sponsorName = null;
        this.result.sponsorFundingSchemes = [];
        this.setFundingAgencyEndPointSearchOptions('');
    }

    clearFundingAgencyType() {
        this.result.grantCall.sponsorType = null;
        this.result.grantCall.sponsorTypeCode = null;
        this.selectedSponsorType = null;
    }

    /** assigns funding type
     * @param type
     */
    fundingTypeChange(fundingSchemeId) {
        if (fundingSchemeId === 'null' || !fundingSchemeId) {
            this.clearFundingScheme();
        } else {
            const fundingTypeObj = this.result.sponsorFundingSchemes.find(fundingType => fundingType.fundingSchemeId == fundingSchemeId);
            if (fundingTypeObj != null) {
                this.result.grantCall.sponsorFundingScheme = fundingTypeObj;
                this.result.grantCall.fundingSchemeId = fundingTypeObj.fundingSchemeId;
            }
        }
    }

    setSponsorType(sponsorTypeObject, type) {
        this.setFundingAgencyEndPointSearchOptions(type === 'code' ? sponsorTypeObject.code : sponsorTypeObject.sponsorTypeCode);
        this.result.grantCall.sponsorType = type === 'code' ? sponsorTypeObject : sponsorTypeObject.sponsorType;
        this.result.grantCall.sponsorTypeCode = this.selectedSponsorType = type === 'code' ?
            sponsorTypeObject.code : sponsorTypeObject.sponsorTypeCode;
        this.setUnsavedChanges(true);
    }

    /* Setting flag to identify change of grant call status from open state to any other state for notification */
    checkOpenStatusChanged() {
        this.result.isStatusChanged = this.result.grantCall.grantStatusCode === 2 && this.result.grantCall.isPublished &&
            (this.result.grantCallStatus.find(status =>
                status.description === this.grantCallObject.selectedGrantStatus).grantStatusCode !== 2) ?
            true : false;
    }

    clearOnwaiverPercentage() {
        if (!this.grantCallObject.isOverHead) {
            this.result.grantCall.rateTypeCode = null;
            this.result.grantCall.overHeadComment = null;
            this.result.grantCall.rateClassCode = null;
            this.result.grantCall.rateType = null;
            this.map.clear('grantCallOverWaiver');
        }
    }

    clearAddNewFundingAgencyDetails() {
        this.mapSponsor.clear();
        this.warningMsg.sponsorEmail = null;
        this.sponsorDetails = {};
        this.departmentHttpOptions.defaultValue = '';
        this.sponsorDetails.sponsorTypeCode = null;
        this.sponsorDetails.active = true;
    }

    leadUnitSelectFunction(selectedLeadUnit) {
        this.setUnsavedChanges(true);
        if (selectedLeadUnit != null) {
            this.setLeadUnit(selectedLeadUnit.unitNumber, selectedLeadUnit.unitName);
        } else {
            this.setLeadUnit(null, null);
        }
    }

    /**
     * temporarily saves grant details while the modal appears
     */
    temperorySaveGrant(id, index) {
        this.removeObjId = id;
        this.removeObjIndex = index;
        this.deleteGrantDetail();
    }

    deleteGrantDetail() {
        if (this.removeObjId == null) {
            this.result.grantCall.grantCallRelevants.splice(this.removeObjIndex, 1);
        } else {
            this.$subscriptions.push(this._grantService.deleteGrantCallRelevantField({
                'grantCallId': this.result.grantCall.grantCallId,
                'grantCallRelevantId': this.removeObjId
            }).subscribe(() => {
                this.result.grantCall.grantCallRelevants.splice(this.removeObjIndex, 1);
                this.updateGrantCallStoreData();
            }));
        }
    }

    showAddKeywordFunction(event) {
        this.selectedKeyword = event.searchString;
    }

    /* if keyword is selected from search results,that keyword object and its corresponding code is set to
      'scienceKeyword' and 'scienceKeywordCode' in keyword object and pushes to grantCallKeywords array.
      if keyword which is added is a user defined one,then that keyword is set to 'keyword'in keyword object and
       pushes to grantCallKeywords array. */
    keywordSelectFunction(event) {
        if (event) {
            this.selectedKeyword = event.description;
            this.checkDuplicateKeyword();
            if (!this.warningMsg.keywordWarningText) {
                this.setKeywordObject(event);
            }
            this.clearKeywordSearchBox();
            this.clearKeywordField = new String('true');
        } else {
            this.setKeywordObject(event);
        }
        this.setUnsavedChanges(true);
    }

    /* sets keyword object */
    setKeywordObject(event) {
        const keywordObject: any = {};
        keywordObject.scienceKeyword = event ? event : null;
        keywordObject.scienceKeywordCode = event ? event.code : null;
        keywordObject.keyword = event ? null : this.selectedKeyword;
        keywordObject.updateTimeStamp = new Date().getTime();
        keywordObject.updateUser = this.commonService.getCurrentUserDetail('userName');
        if (keywordObject.scienceKeywordCode) {
            this.result.grantCall.grantCallKeywords.push(keywordObject);
        }
    }

    /**
     * deletes keyword
     * @param  {} id
     * @param  {} index
     * @param  {} data
     */
    deleteKeyword(id, index) {
        this.warningMsg.keywordWarningText = null;
        if (this.result.grantCall.grantCallId && id) {
            this.$subscriptions.push(this._grantService.deleteGrantCallKeyword({
                'grantCallId': this.result.grantCall.grantCallId,
                'grantKeywordId': id
            }).subscribe(success => {
                this.actionsAfterKeywordDeletion(index);
            }));
        } else {
            this.result.grantCall.grantCallKeywords.splice(index, 1);
        }
    }

    /**
   * if there is no duplicate warning, keyword is spliced from the array
   * @param  {} index
   * @param  {} data
   */
    actionsAfterKeywordDeletion(index) {
        this.result.grantCall.grantCallKeywords.splice(index, 1);
        this.updateGrantCallStoreData();
        this.selectedKeyword = '';
    }

    /* if keyword doesn't exist in database (data contains code), keyword is added to the proposal. Otherwise warning
     such as 'Keyword already exist in database' is shown */
    checkKeywordExistInDatabase(data) {
        if (data && data.code) {
            this.keywordSelectFunction(data);
        } else {
            this.warningMsg.keywordWarningText = '* Keyword already exist in database';
            this.isAddKeywordToDatabase = false;
        }
    }

    /* checks for duplicate keyword in the list of keywords added.if duplication is found in user defined
    keywords which is added to this particular grant call,a modal is shown with a message
    'The keyword is already added in this grant call.Do you want to add this keyword to database for future use?'.
    if duplication is found in keywords selected from search results,a warning message 'keyword already added' is shown.
    if there is no duplication and user wands to add a new keyword which is not in database, a modal is shown with message
    'Do you want to add the keyword to database for future use?'. */
    checkDuplicateKeyword() {
        let dupKeywordObject = null;
        this.warningMsg.keywordWarningText = null;
        if (this.selectedKeyword) {
            if (this.result.grantCall.grantCallKeywords && this.result.grantCall.grantCallKeywords !== 0) {
                dupKeywordObject = this.result.grantCall.grantCallKeywords.find(dupKeyword =>
                    (dupKeyword.scienceKeyword &&
                        dupKeyword.scienceKeyword.description.toLowerCase() === this.selectedKeyword.toLowerCase()) ||
                        (dupKeyword.keyword && dupKeyword.keyword.toLowerCase() === this.selectedKeyword.toLowerCase()));
            }
            if (dupKeywordObject && (dupKeywordObject.scienceKeyword ||
                this.map.get('keyword'))) {
                this.warningMsg.keywordWarningText = '* Keyword already added';
                this.clearKeywordField = new String('true');
            }
        } else {
            this.warningMsg.keywordWarningText = '* Add any keyword';
            this.clearKeywordField = new String('true');
        }
    }

    clearKeywordSearchBox() {
        this.isAddKeywordToDatabase = false;
        this.selectedKeyword = null;
    }

    getSearchValue(event) {
        this.selectedKeyword = event;
    }

    /* adds user defined keyword to database and delete the same keyword added in this particular grant call */
    addKeywordToDatabase(event) {
        if (event) {
            this.selectedKeyword = event.searchString;
            if (this.selectedKeyword) {
                this.selectedKeyword = this.selectedKeyword.trim();
              }
            this.$subscriptions.push(this._grantService.addScienceKeyword({
                'scienceKeyword': this.selectedKeyword,
                'userName': this.commonService.getCurrentUserDetail('userName')
            }).subscribe(data => {
                this.isAddKeywordToDatabase = true;
                this.checkKeywordExistInDatabase(data);
                this.clearKeywordField = new String('true');
                this.selectedKeyword = null;
            }));
        }
    }

    isFormValid() {
        this.commonData.errorMessage = null;
        this.grantStatusChange();
        this.dateValidation();
        if (this.grantCallObject.openingDate !== null || this.grantCallObject.closingDate !== null) {
            this.submissionDateValidation();
        }
        this.updateEditorContent();
        this._grantService.isMandatoryFilled = this.validateMandatory() && this.editorValidation() &&
            !this.warningMsg.dateWarningText && !this.submissionDateWarningText;
        if (this._grantService.isMandatoryFilled && this.mapNonMandatory.size == 0) {
            return true;
        } else {
            this.commonData.errorMessage = !this._grantService.isMandatoryFilled ?
                'Please fill all the mandatory fields' : 'Please fill field(s) with valid data';
            this.commonData.$isMandatoryFilled.next(true);
            return false;
        }
    }

    saveGrant() {
        let saveType = 'SAVE';
        if (this.isFormValid() && !this.isSaving) {
            this.isSaving = true;
            this.commonRequestObjects();
            this.commonData.$isMandatoryFilled.next(false);
            // saveType = this.result.grantCall.grantCallStatus.grantStatusCode === 1 ||
            saveType = this.result.grantCall.grantCallId == null ? 'SAVE' : 'UPDATE';
            this.$subscriptions.push(this._generalDetailsService.saveGrantCall({
                'grantCall': this.result.grantCall, 'isStatusChanged': this.result.isStatusChanged, 'updateType': saveType,
            }).subscribe((response: any) => {
                this.grantCallObject.selectedGrantStatus = this.result.grantCall.grantCallStatus.description;
                this.result.grantCall = response.grantCall;
                this.result.canCreateIOI = response.canCreateIOI;
                this.result.availableRights = response.availableRights;
                this.result.fundingSchemeAttachment = response.fundingSchemeAttachment;
                this.warningMsg = {};
                this.grantCallObject.isGrantClosingDateChange = false;
                this.grantCallObject.isShowModifyGrant = false;
                this.updateEditorContent();
                this.updateGrantCallStoreData();
                this.commonData.getGrantCallMode();
                this.commonService.showToast(HTTP_SUCCESS_STATUS, response.message);
                this.isSaving = false;
                this.setUnsavedChanges(false);
            }, error => {
                this.isSaving = false;
                this._autoSaveService.clearErrors();
                this._autoSaveService.errorEvent(
                    { name: 'Grant Call Details', documentId: this.SECTION_ID, type: 'API' });
            }, () => {
                this._router.navigate(['/fibi/grant/overview'], { queryParams: { 'grantId': this.result.grantCall.grantCallId } });
                this.isSaving = false;
            }));
        }
    }

    commonRequestObjects() {
        if (!this.result.grantCall.grantCallId) {
            this.result.grantCall.createUser = this.commonService.getCurrentUserDetail('userName');
            this.result.grantCall.createTimestamp = new Date().getTime();
        }
        this.result.grantCall.updateTimeStamp = new Date().getTime();
        this.result.grantCall.openingDate = parseDateWithoutTimestamp(this.grantCallObject.openingDate);
        this.result.grantCall.closingDate = parseDateWithoutTimestamp(this.grantCallObject.closingDate);
        this.result.grantCall.internalSubmissionDeadLineDate = parseDateWithoutTimestamp
            (this.grantCallObject.internalSubmissionDeadlineDate);
        this.result.grantCall.updateUser = this.commonService.getCurrentUserDetail('userName');
        this.result.grantCall.grantCallStatus = this.grantCallObject.grantStatusObject;
        this.result.grantCall.grantStatusCode = this.grantCallObject.grantStatusObject.grantStatusCode;
    }

    updateEditorContent() {
        this.result.grantCall.description = removeUnwantedTags(this.result.grantCall.description);
        this.result.grantCall.grantTheme = removeUnwantedTags(this.result.grantCall.grantTheme);
        this.result.grantCall.applicationProcedure = removeUnwantedTags(this.result.grantCall.applicationProcedure);
        this.result.grantCall.otherInformation = removeUnwantedTags(this.result.grantCall.otherInformation);
    }

    validateMandatory() {
        this.grantCallObject.isFundingAgencyError = false;
        this.map.clear();
        if (!this.result.grantCall.grantCallType || this.result.grantCall.grantCallType === 'null') {
            this.map.set('grantCallType', 'Type of Grant');
        }
        if (!this.result.grantCall.grantCallStatus || this.result.grantCall.grantCallStatus === 'null') {
            this.map.set('grantCallStatus', 'Status');
        }
        if (!this.result.grantCall.grantCallName || this.result.grantCall.grantCallName === '') {
            this.map.set('grantCallName', 'Name of Grant Call');
        }
        if (!this.grantCallObject.openingDate) {
            this.map.set('grantCallOpeningdate', 'Opening date');
        }
        if (!this.grantCallObject.closingDate) {
            this.map.set('grantCallClosingdate', 'Closing date');
        }
        if (!this.result.grantCall.closingTime) {
            this.map.set('grantCallClosingTime', 'Closing time');
        }
        if (this.result.grantCall.grantCallType && (this.result.grantCall.grantCallType.categoryCode === 2)
            && (!this.grantCallObject.internalSubmissionDeadlineDate)) {
            this.map.set('internalSubmissionDate', 'Internal Submission Date');
        }
        if (!this.result.grantCall.description || this.result.grantCall.description === '') {
            this.map.set('grantCallDescription', 'Description');
        }
        if (this.result.grantCall.sponsor === 'null' || !this.result.grantCall.sponsor) {
            this.map.set('grantCallSponsor', 'Name of Funding agency');
            this.grantCallObject.isFundingAgencyError = true;
        }
        // Don't change null, written to exclude 0 condition, !null and !0 is true
        if (this.grantCallObject.isOverHead && (!this.result.grantCall.rateClassCode || this.result.grantCall.rateClassCode === 'null')) {
            this.map.set('grantCallOverWaiver', 'Please select the F&A Rate Type');
        }
        if (this.result.grantCall.homeUnitNumber === 'null' || !this.result.grantCall.homeUnitNumber) {
            this.map.set('leadUnit', 'Select lead unit');
        }
        this.validateAbbreviation();
        if (this.map.size !== 0) {
            this.warningMsg.mandatoryNotFilledMsg = 'Please fill all mandatory fields.';
            return false;
        }
        this.warningMsg.mandatoryNotFilledMsg = null;
        return true;
    }

    /** Clears validation as soon as date gets picked and also shows validation when field gets cleared.
     *  This validation occurs before action(save or proceed).
    */
    dateValidationBeforeAction(dateToCheck: any, mappedString: string, validationMessage: string) {
        this.map.delete(mappedString);
        if (dateToCheck == null) {
            this.map.set(mappedString, validationMessage);
        }
    }

    grantStatusChange() {
        if (this.grantCallObject.isGrantClosingDateChange && this.grantCallObject.isShowModifyGrant &&
            this.result.grantCall.grantStatusCode === 3) {
            const grantstatusObj = this.result.grantCallStatus.find(status => status.grantStatusCode === 2);
            if (grantstatusObj) {
                this.grantCallObject.grantStatusObject = grantstatusObj;
            }
        } else {
            const grantstatusObj = this.result.grantCallStatus.find(status =>
                status.description === this.grantCallObject.selectedGrantStatus);
            if (grantstatusObj) {
                this.grantCallObject.grantStatusObject = grantstatusObj;
            }
        }
    }

    editorValidation() {
        this.editorValidate.clear();
        if (this.editorMaxLength(this.result.grantCall.description)) {
            this.editorValidate.set('grantDescription', 'The description should be less than 1,00,000 characters');
        }
        if (this.result.grantCall.grantTheme != null) {
            if (this.editorMaxLength(this.result.grantCall.grantTheme)) {
                this.editorValidate.set('grantTheme', 'The grant call theme should be less than 1,00,000 characters');
            }
        }
        if (this.result.grantCall.applicationProcedure != null) {
            if (this.editorMaxLength(this.result.grantCall.applicationProcedure)) {
                this.editorValidate.set('applicationProcedure', 'The application procedure should be less than 1,00,000 characters');
            }
        }
        if (this.result.grantCall.otherInformation != null) {
            if (this.editorMaxLength(this.result.grantCall.otherInformation)) {
                this.editorValidate.set('otherInformation', 'The description should be less than 1,00,000 characters');
            }
        }
        if (this.editorValidate.size !== 0) {
            return false;
        }
        return true;
    }

    /**
     * @param  {} editorString as input for checking the the length for inputs in ngx editor
     */
    editorMaxLength(editorString) {
        if (editorString) {
            let ngxInput = editorString;
            ngxInput = ngxInput.replace('<[^>]+>', '');
            return (ngxInput.length > 99999) ? true : false;
        } else {
            return false;
        }
    }

    departmentSelect(event) {
        if (event) {
            this.sponsorDetails.unitNumber = event.unitNumber;
            this.sponsorDetails.unit = event;
        } else {
            this.sponsorDetails.unitNumber = null;
            this.sponsorDetails.unit = null;
        }
    }

    maintainSponsor(type) {
        this.sponsorValidation();
        if (this.mapSponsor.size === 1 && !this.warningMsg.sponsorEmail) {
            this.sponsorDetails.acType = type;
            this.sponsorDetails.sponsorType = this.result.sponsorTypes.find(sponsorType =>
                sponsorType.code === this.sponsorDetails.sponsorTypeCode);
            if (this.sponsorDetails.acType === 'I') {
                this.sponsorDetails.updateUser = this.commonService.getCurrentUserDetail('userName');
                this.sponsorDetails.createUser = this.commonService.getCurrentUserDetail('userName');
            }
            this.$subscriptions.push(this._grantService.maintainSponsorData(this.sponsorDetails).subscribe((data: any) => {
                this.showAddSponsorModal = false;
                document.getElementById('grant-sponsoradd-close-btn').click();
                delete data.responseMessage;
                delete data.acType;
                delete data.sponsorTypes;
                delete data.rolodexName;
                data.rolodex = null;
                this.setSponsor(data);
                this.grantCallObject.isFundingAgencyError = false;
                this.fundingAgencyHttpOptions.defaultValue = this.result.grantCall.sponsorName;
                this.clearFundingAgencySearchField = 'false';
                this.setSponsorType(data, null);
            }));
        }
    }

    sponsorValidation() {
        this.mapSponsor.clear();
        this.warningMsg.sponsorEmail = null;
        if (!this.sponsorDetails.sponsorName) {
            this.mapSponsor.set('sponsorname', 'name');
        }
        if (!this.sponsorDetails.sponsorTypeCode || this.sponsorDetails.sponsorTypeCode === 'null') {
            this.mapSponsor.set('sponsortype', 'type');
        }
        if (!this.sponsorDetails.unitNumber) {
            this.mapSponsor.set('sponsorunitnumber', 'unitnumber');
        }
        this.warningMsg.sponsorEmail = this.sponsorDetails.emailAddress &&
            !this.invalidMailOrNot(this.sponsorDetails.emailAddress) ?
            'Please provide a valid email address' : null;
    }

    /** email input validation */
    invalidMailOrNot(mail) {
        // tslint:disable-next-line:max-line-length
        if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            .test(mail)) {
            return (true);
        }
        return (false);
    }

    /**
    * setup grant call common data the values that changed after the service call need to be updatedinto the store.
    * every service call wont have all the all the details as reponse so
    * we need to cherry pick the changes and update them to the store.
    */
    updateGrantCallStoreData() {
        this.result = deepCloneObject(this.result);
        this.commonData.setGrantCallData(this.result);
        this.grantResults.emit(true);
    }

    inputRestriction(input) {
        this.warningMessage.clear();
        // tslint:disable-next-line:max-line-length
        const pattern = (/^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[0-9]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/);
        if (!pattern.test(input)) {
            this.checkForInvalidPhoneNumber(input);
        }
    }

    checkForInvalidPhoneNumber(input) {
        if (/^[a-zA-Z]+$/.test(input)) {
            this.warningMessage.set('phoneNumberWarningAlphabets', 'Alphabets cannot be added in  Phone number field.');
        } else {
            this.warningMessage.set('phoneNumberWarning', 'Please add a valid number');
        }
    }

    inputRestrictionForAmountFields(field, key) {
        field = field && field >= 0 ? parseFloat(field) : null;
        this.mapNonMandatory.delete(key);
        const pattern = /^(?:[0-9][0-9]{0,9}(?:\.\d{0,2})?|9999999999|9999999999.00|9999999999.99)$/;
        if (field && !pattern.test(field)) {
            this.mapNonMandatory.set(key, true);
        }
        if (this.result.grantCall.maximumBudget === 0) {
          this.result.grantCall.maximumBudget = null;
        }
    }

    /**
     * @param  event
     * For assigning values to grantcall object once a prime sponsor is selected from field.
     */
    primeSponsorSelect(event) {
        if (event) {
            this.result.grantCall.primeSponsorCode = event.sponsorCode;
            this.result.grantCall.primeSponsor = event;
        } else {
            this.result.grantCall.primeSponsorCode = null;
            this.result.grantCall.primeSponsor = null;
        }
    }

    validateAbbreviation() {
        this.map.delete('abbrevation');
        this.map.delete('abbrevationLength');
        if (!this.result.grantCall.abbrevation) {
            this.map.set('abbrevation', 'Abbrevation');
        } else if (this.result.grantCall.abbrevation.length > 100) {
            this.map.set('abbrevationLength', 'AbbrevationLength');
        }
    }

    setUnsavedChanges(flag: boolean) {
        this.commonData.isGrantCallDataChange = flag;
        this._autoSaveService.setUnsavedChanges('Grant Call Details', 'grantcall-general-section', flag, true);
    }

    listenForGlobalSave() {
        this.$subscriptions.push(this._autoSaveService.autoSaveTrigger$.subscribe(_saveClick => {
            this.saveGrant();
        }));
    }
}
