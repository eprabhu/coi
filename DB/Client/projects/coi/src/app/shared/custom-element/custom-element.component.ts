import {Component, OnInit, Input, OnDestroy, Output, EventEmitter, OnChanges} from '@angular/core';
import {CustomElementService} from './custom-element.service';
import {CommonService} from '../../common/services/common.service';
import {HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS, DEFAULT_DATE_FORMAT, AWARD_LABEL} from '../../app-constants';
import {Observable, Subject, Subscription} from 'rxjs';
import {subscriptionHandler} from '../../common/utilities/subscription-handler';
import {deepCloneObject, setFocusToElement, showAutoSaveToast} from '../../common/utilities/custom-utilities';
import {ElasticConfigService} from '../../common/services/elastic-config.service';
import {getCurrentTime, parseDateWithoutTimestamp} from '../../common/utilities/date-utilities';
import {AutoSaveService} from '../../common/services/auto-save.service';
import {debounceTime} from 'rxjs/operators';
import {Answer, AutoSaveRequestObject, AutoSaveResponse, CustomElement} from './custom-element.interface';
import {
    getEndPointOptionsForCostCentre,
    getEndPointOptionsForDepartment,
    getEndPointOptionsForFundCentre,
    getEndPointOptionsForGrandCode,
    getEndPointOptionsForLeadUnit,
    getEndPointOptionsForMappedClaimTemplate,
    getEndPointOptionsForOrganization,
    getEndPointOptionsForProfitCentre,
    getEndPointOptionsForSponsor
} from '../../../../../fibi/src/app/common/services/end-point.config';
import {
    getEndPointOptionsForCountry
} from '../../configuration/form-builder-create/shared/form-builder-view/search-configurations';

class CustomAnswer {
    customDataElementsId = null;
    customDataId = null;
    description = null;
    moduleItemCode = null;
    moduleItemKey = null;
    moduleSubItemCode = null;
    moduleSubItemKey = null;
    updateTimestamp = null;
    updateUser = null;
    value = null;
}

/**
 * Author - Sreejith T
 * @Input() - isAutoSaveEnabled - Whether autosave feature is enabled
 */

@Component({
    selector: 'app-custom-element',
    templateUrl: './custom-element.component.html',
    styleUrls: ['./custom-element.component.scss']
})
export class CustomElementComponent implements OnInit, OnChanges, OnDestroy {

    @Input() moduleItemKey = null;
    @Input() moduleCode;
    @Input() viewMode;
    @Input() externalSaveEvent: Observable<any>;
    @Input() isShowSave = true;
    @Input() isShowCollapse = false;
    @Input() tabName = 'OI';
    @Input() subSectionCode: number = null;
    @Input() isShowToast = true;
    @Input() isAutoSaveEnabled = false;
    @Input() canLoadCustomDataOnModuleCode = false;
    @Input() customCardClass = 'my-3';
    @Input() customBodyClass = '';
    @Output() dataChangeEvent = new EventEmitter<boolean>();
    @Output() isAllMandatoryFilled = new EventEmitter<boolean>();
    @Output() saveResponseEvent = new EventEmitter<boolean>();
    @Output() availableConfiguredElements = new EventEmitter<CustomElement[]>();

    customElements: any = [];
    result: any = {};
    isLength = false;
    isType = false;
    isEmpty = false;
    isCheckBoxEmpty = false;
    isRadioEmpty = false;
    radioEmptyFlag;
    checkEmptyFlag;
    isValueEmpty: any = [];
    checkEmpty: any = [];
    radioEmpty: any = [];
    validationId: any = [];
    lengthValidationId: number;
    numberValidationId: number;
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    $subscriptions: Subscription[] = [];
    elasticSearchOptions: any = {};
    endPointSearchOptions: any = {};
    setFocusToElement = setFocusToElement;
    parseDateWithoutTimestamp = parseDateWithoutTimestamp;
    isSaving = false;
    isDataChange = false;
    isShowOtherInfo = true;
    collapseViewMore = {};
    selectedCheckBoxValues = [];
    lookUpValues: any = {};
    searchObjectMapping = {
        'fibiperson': 'prncpl_id',
        'awardfibi': 'award_number',
        'fibiproposal': 'proposal_id',
        'instituteproposal': 'proposal_id',
        'grantcall_elastic': 'grant_header_id',
        'sponsorName': 'sponsorCode',
        'unitName': 'unitNumber',
        'fibiOrganization': 'organizationId',
        'fibiCountry': 'countryCode',
        'fibiDepartment': 'unitNumber',
        'grantCodeName': 'grantCode',
        'costCenterName': 'costCenterCode',
        'fundCenterName': 'fundCenterCode',
        'profitCenterName': 'profitCenterCode',
        'claimTemplateName': 'claimTemplateCode'
    };
    public DEBOUNCE_REQUIRED = true;
    private autoSaveQueue: CustomElement[] = [];
    private isProcessingAutoSaveQueue = false;
    private $textInputDebounceSubject = new Subject<CustomElement>();
    private isDataChanged = false;
    private whetherCustomFieldInAPIQueue: Record<number, boolean> = {};

    constructor(private _customService: CustomElementService, public _commonService: CommonService,
                private _elasticConfig: ElasticConfigService, private _autoSaveService: AutoSaveService) {
    }

    ngOnInit() {
        this.setupCustomFieldDebounce();
        this.autoSaveEvent();
    }

    private getCustomData() {
        this.$subscriptions.push(this._customService.getCustomData(this.moduleCode, this.moduleItemKey, this.tabName, this.subSectionCode)
            .subscribe(data => {
                this.result = data || [];
                if (this.result) {
                    this.customElements = this.result.customElements;
                    this.availableConfiguredElements.next(this.customElements);
                    this.setDefaultValues(this.customElements);
                    this.getLookupDataTypeValues();
                    this.emitMandatoryCheck();
                }
            }));
    }

    private getCustomDataOnModuleCode() {
        this.$subscriptions.push(this._customService.getCustomDataOnModuleCode(this.moduleCode)
            .subscribe(data => {
                this.result = data || [];
                if (this.result) {
                    this.customElements = this.result.data;
                    this.customElements.map(ele => ele.answers = [new CustomAnswer()]);
                    this.customElements = this.customElements.filter(ele => ele.isActive);
                    this.availableConfiguredElements.next(this.customElements);
                    this.setDefaultValues(this.customElements);
                    this.getLookupDataTypeValues();
                    this.emitMandatoryCheck();
                }
            }));
    }

    ngOnChanges(): void {
        if(this.canLoadCustomDataOnModuleCode && !this.moduleItemKey) {
            this.getCustomDataOnModuleCode();
        } else {
            this.getCustomData();
        }
    }

    getLookupDataTypeValues() {
        this.customElements.forEach((ele) => {
            this.setDataForLookUpTypes(ele);
        });
    }

    collapseViewMoreOption(id: number, flag: boolean): void {
        this.collapseViewMore[id] = !flag;
    }

    /**
     * @param  {} customElementList
     * sets the default value if any based on fieldType.
     */
    setDefaultValues(customElementList) {
        customElementList.forEach(element => {
            switch (element.filterType) {
                case 'Elastic Search':
                    this.setElasticOptions(element);
                    break;
                case 'Autosuggest':
                    this.setEndpointOptions(element);
                    break;
                default:
                    element.answers.findIndex(item => item.value = item.value ? item.value : element.defaultValue);
            }
        });
    }

    /**
     * this Event subscribes to the auto save trigger generated on save click on top basically
     * what happens is when a save click happen this will let this component know when
     * user click the general save button.
     */
    autoSaveEvent() {
        if (this.externalSaveEvent) {
            this.$subscriptions.push(this.externalSaveEvent.subscribe(_event => this.isDataChange && this.saveCustomData(_event)));
        }
    }

    emitMandatoryCheck() {
        this.setIsEmptyFlags();
        this.isAllMandatoryFilled.emit((!this.isEmpty && !this.checkEmptyFlag && !this.radioEmptyFlag) ? true : false);
    }

    setElasticOptions(object) {
        switch (object.lookupArgument) {
            case 'fibiproposal':
                this.elasticSearchOptions[object.columnName] = this._elasticConfig.getElasticForProposal();
                this.elasticSearchOptions[object.columnName].defaultValue = object.answers[0].description ? object.answers[0].description : '';
                this.elasticSearchOptions[object.columnName].contextField =
                    object.defaultValue || this.elasticSearchOptions[object.columnName].contextField;
                break;
            case 'fibiperson':
                this.elasticSearchOptions[object.columnName] = this._elasticConfig.getElasticForPerson();
                this.elasticSearchOptions[object.columnName].defaultValue = object.answers[0].description ? object.answers[0].description : '';
                this.elasticSearchOptions[object.columnName].contextField =
                    object.defaultValue || this.elasticSearchOptions[object.columnName].contextField;
                break;
            case 'awardfibi':
                this.elasticSearchOptions[object.columnName] = this._elasticConfig.getElasticForAward();
                this.elasticSearchOptions[object.columnName].defaultValue = object.answers[0].description ? object.answers[0].description : '';
                this.elasticSearchOptions[object.columnName].contextField =
                    object.defaultValue || this.elasticSearchOptions[object.columnName].contextField;
                break;
            case 'instituteproposal':
                this.elasticSearchOptions[object.columnName] = this._elasticConfig.getElasticForProposal();
                this.elasticSearchOptions[object.columnName].defaultValue = object.answers[0].description ? object.answers[0].description : '';
                this.elasticSearchOptions[object.columnName].contextField =
                    object.defaultValue || this.elasticSearchOptions[object.columnName].contextField;
                break;
            case 'grantcall_elastic':
                this.elasticSearchOptions[object.columnName] = this._elasticConfig.getElasticForGrantCall();
                this.elasticSearchOptions[object.columnName].contextField =
                    object.defaultValue || this.elasticSearchOptions[object.columnName].contextField;
                this.elasticSearchOptions[object.columnName].defaultValue = object.answers[0].description ?
                    object.answers[0].description : null;
                break;
            default:
                break;
        }
    }

    setEndpointOptions(object) {
        switch (object.lookupArgument) {
            case 'sponsorName':
                this.endPointSearchOptions[object.columnName] = getEndPointOptionsForSponsor();
                this.endPointSearchOptions[object.columnName].defaultValue = object.answers[0].description ?
                    object.answers[0].description : null;
                this.endPointSearchOptions[object.columnName].contextField =
                    object.defaultValue || this.endPointSearchOptions[object.columnName].contextField;
                break;
            case 'unitName':
                this.endPointSearchOptions[object.columnName] = getEndPointOptionsForLeadUnit();
                this.endPointSearchOptions[object.columnName].defaultValue = object.answers[0].description ?
                    object.answers[0].description : null;
                this.endPointSearchOptions[object.columnName].contextField =
                    object.defaultValue || this.endPointSearchOptions[object.columnName].contextField;
                break;
            case 'fibiDepartment':
                this.endPointSearchOptions[object.columnName] = getEndPointOptionsForDepartment();
                this.endPointSearchOptions[object.columnName].defaultValue = object.answers[0].description ?
                    object.answers[0].description : null;
                this.endPointSearchOptions[object.columnName].contextField =
                    object.defaultValue || this.endPointSearchOptions[object.columnName].contextField;
                break;
            case 'fibiOrganization':
                this.endPointSearchOptions[object.columnName] = getEndPointOptionsForOrganization();
                this.endPointSearchOptions[object.columnName].defaultValue = object.answers[0].description ?
                    object.answers[0].description : null;
                this.endPointSearchOptions[object.columnName].contextField =
                    object.defaultValue || this.endPointSearchOptions[object.columnName].contextField;
                break;
            case 'fibiCountry':
                this.endPointSearchOptions[object.columnName] = getEndPointOptionsForCountry(this._commonService.fibiUrl);
                this.endPointSearchOptions[object.columnName].defaultValue = object.answers[0].description ?
                    object.answers[0].description : null;
                this.endPointSearchOptions[object.columnName].contextField =
                    object.defaultValue || this.endPointSearchOptions[object.columnName].contextField;
                break;
            case 'profitCenterName':
                this.endPointSearchOptions[object.columnName] = getEndPointOptionsForProfitCentre();
                this.endPointSearchOptions[object.columnName].defaultValue = object.answers[0].description ?
                    object.answers[0].description : null;
                this.endPointSearchOptions[object.columnName].contextField =
                    object.defaultValue || this.endPointSearchOptions[object.columnName].contextField;
                break;
            case 'grantCodeName':
                this.endPointSearchOptions[object.columnName] = getEndPointOptionsForGrandCode();
                this.endPointSearchOptions[object.columnName].defaultValue = object.answers[0].description ?
                    object.answers[0].description : null;
                this.endPointSearchOptions[object.columnName].contextField =
                    object.defaultValue || this.endPointSearchOptions[object.columnName].contextField;
                break;
            case 'costCenterName':
                this.endPointSearchOptions[object.columnName] = getEndPointOptionsForCostCentre();
                this.endPointSearchOptions[object.columnName].defaultValue = object.answers[0].description ?
                    object.answers[0].description : null;
                this.endPointSearchOptions[object.columnName].contextField =
                    object.defaultValue || this.endPointSearchOptions[object.columnName].contextField;
                break;
            case 'fundCenterName':
                this.endPointSearchOptions[object.columnName] = getEndPointOptionsForFundCentre();
                this.endPointSearchOptions[object.columnName].defaultValue = object.answers[0].description ?
                    object.answers[0].description : null;
                this.endPointSearchOptions[object.columnName].contextField =
                    object.defaultValue || this.endPointSearchOptions[object.columnName].contextField;
                break;
            case 'claimTemplateName':
                this.endPointSearchOptions[object.columnName] = getEndPointOptionsForMappedClaimTemplate();
                this.endPointSearchOptions[object.columnName].defaultValue = object.answers[0].description ?
                    object.answers[0].description : null;
                this.endPointSearchOptions[object.columnName].contextField =
                    object.defaultValue || this.endPointSearchOptions[object.columnName].contextField;
                break;
            default:
                break;
        }
    }

    setSearchFilterValue(data, answer, list) {
        const IS_CHANGE_IN_DATA = (!data && !answer.value) || (answer.value === data?.[this.searchObjectMapping[list.lookupArgument]]) ?
            false : true;
        if (data) {
            switch (list.filterType) {
                case 'Autosuggest':
                    answer.value = data[this.searchObjectMapping[list.lookupArgument]] ?
                        data[this.searchObjectMapping[list.lookupArgument]] : null;
                    answer.description = data[list.defaultValue];
                    break;
                case 'Elastic Search':
                    answer.description = data[list.defaultValue];
                    answer.value = data[this.searchObjectMapping[list.lookupArgument]] ?
                        data[this.searchObjectMapping[list.lookupArgument]] : null;
                    break;
            }
        } else {
            answer.value = '';
            answer.description = '';
        }
        this.emitDataChange();
        if (this.isAutoSaveEnabled && IS_CHANGE_IN_DATA) {
            this.autoSave(list);
        }
    }

    onLookupSelect(data, list) {
        if (this.isAutoSaveEnabled && this.checkBlankSelectionInDropdown(data, list)) {
            return;
        }
        if (data.length) {
            if (this.isAutoSaveEnabled && ['System Dropdown', 'User Dropdown'].includes(list.filterType) &&
                list.isMultiSelectLookup === 'N') {
                this.updateSelectedValues(data, list);
            } else {
                this.addOrRemoveSelectedValues(data, list);
            }
        } else {
            list.answers.map((ele) => {
                ele.value = null;
                ele.description = null;
            });
        }
        this.emitDataChange();
        if (this.isAutoSaveEnabled) {
            this.autoSave(list);
        }
    }

    /**
     * Function to check if there is a blank selection in dropdown
     * - blank selection - when there is no selected value in the dropdown and the user try to clear selection
     */
    private checkBlankSelectionInDropdown(data: { code: string; description: string }[], list: CustomElement): boolean {
        return !data.length
            && list?.answers?.length === 1 && !list?.answers?.[0]?.customDataId && !list?.answers?.[0]?.value;
    }

    /**
     * Function to modify the existing id instead of adding a new entry
     * - for 'System Dropdown', 'User Dropdown' type of custom field
     */
    private updateSelectedValues(data: { code: string; description: string }[], list: CustomElement): void {
        list.answers[0].value = data[0].code;
        list.answers[0].description = data[0].description;
    }

    /**
     * @param data  - selected values array.
     * @param list - custom element.
     * When length of data is greater than answer length , we are adding new answer to the list.
     * When length of answer is greater than data length , we are removing existing answer.
     * So during insert we are setting value and description values, while delete we are setting those to null.
     * We are looping both array, since the length will differ in all cases.
     */
    addOrRemoveSelectedValues(data, list) {
        data.forEach((ele: any) => {
            if (!(list.answers.some(answer => answer.value == ele.code))) {
                const CUSTOM_ANSWER = new CustomAnswer();
                CUSTOM_ANSWER.value = ele.code;
                CUSTOM_ANSWER.description = ele.description;
                list.answers.push(CUSTOM_ANSWER);
            }
        });
        list.answers.forEach(ele => {
            if (!(data.some(lookup => lookup.code == ele.value))) {
                ele.value = null;
                ele.description = null;
            }
        });
    }

    ngOnDestroy() {
        this._commonService.isPreventDefaultLoader = false;
        const TOAST_ELEMENT = document.getElementById('retry-autosave-toast');
        TOAST_ELEMENT?.classList?.add('invisible');
        subscriptionHandler(this.$subscriptions);
    }

    /**
     * @param  {} customField
     * @param  {} event
     * @param  {} list
     * @param  {} id
     * check null,length and type validations on ngmodel chanage
     */
    checkValidation(customField, event, list, id) {
        if (event.target.value.length < list.dataLength) {
            this.isLength = false;
        } else {
            this.lengthValidationId = id;
            this.isLength = true;
            customField.value = event.target.value = event.target.value.slice(0, list.dataLength);
        }
        if (list.filterType === 'Number' && event.keyCode >= 65 && event.keyCode <= 90) {
            this.isType = true;
            this.numberValidationId = id;
            customField.value = event.target.value.slice(0, 0);
        } else {
            this.isType = false;
        }
    }

    /**
     * check mandatory validation.
     *  datatypecription and corresponding type codes are listed below.
     * 1-String, 2-Number, 3-Date, 4-Check Box, 5-Radio Button, 6-Elastic Search, 7-End Point Search, 8-System Lookup, 9-User Lookup
     */
    checkMandatory() {
        this.checkEmptyFlag = false;
        this.radioEmptyFlag = false;
        this.customElements.forEach((field, index) => {
            if (!['Radio Button', 'Check Box', 'System Dropdown', 'User Dropdown'].includes(field.filterType)) {
                const INDEX = field.answers.findIndex(item => (item.value === null || item.value === ''));
                if (INDEX >= 0 && field.isRequired === 'Y') {
                    this.isValueEmpty[index] = false;
                    this.validationId[index] = index;
                } else {
                    this.isValueEmpty[index] = true;
                }
            }
            this.checkEmptyFlag = false;
            this.radioEmptyFlag = false;
            if (field.filterType === 'Check Box' && field.isRequired === 'Y') {
                this.checkEmptyFlag = field.answers.find(item => item.description) ? false : true;
            }
            if (this.checkEmptyFlag === true) {
                this.checkEmpty[index] = false;
                this.validationId[index] = index;
            } else {
                this.checkEmpty[index] = true;
            }
            if (field.filterType === 'Radio Button' && field.isRequired === 'Y') {
                this.radioEmptyFlag = field.answers.find(item => item.value !== null && item.value !== '') ? false : true;
            }
            if (this.radioEmptyFlag === true) {
                this.radioEmpty[index] = false;
                this.validationId[index] = index;
            } else {
                this.radioEmpty[index] = true;
            }
            if (['System Dropdown', 'User Dropdown'].includes(field.filterType)) {
                const SELECTED_ELEMENT = field.answers.find(ele => ele.value);
                if (SELECTED_ELEMENT) {
                    this.isValueEmpty[index] = true;
                } else if (field.isRequired === 'Y') {
                    this.isValueEmpty[index] = false;
                    this.validationId[index] = index;
                }
            }
        });
    }

    setIsEmptyFlags() {
        if (this.tabName == 'GI') {
            this.checkMandatory();
        }
        if ((this.isValueEmpty.filter(item => item === false).length !== 0) ||
            (this.checkEmpty.filter(check => check === false).length !== 0) ||
            (this.radioEmpty.filter(radio => radio === false).length !== 0)) {
            this.isEmpty = true;
        } else {
            this.isEmpty = false;
        }
    }

    saveCustomData(moduleItemKey = null) {
        if(!this.moduleItemKey && moduleItemKey) {
            this.moduleItemKey = moduleItemKey;
        }
        if (this.tabName != 'GI') {
            this.checkMandatory();
        }
        this.setIsEmptyFlags();
        if (this.isEmpty === false && this.checkEmptyFlag === false && this.radioEmptyFlag === false) {
            this.isLength = false;
            const CUSTOMDATA: any = {};
            CUSTOMDATA.updateTimestamp = new Date().getTime();
            CUSTOMDATA.moduleItemKey = this.moduleItemKey;
            CUSTOMDATA.moduleCode = this.moduleCode;
            CUSTOMDATA.customElements = this.customElements;
            if (!this.isSaving) {
                this.isSaving = true;
                this.$subscriptions.push(this._customService.saveCustomData(CUSTOMDATA)
                    .subscribe(data => {
                        this.result = data || [];
                        if (this.result !== null) {
                            if (this.isShowToast) {
                                this.showToast(true);
                            }
                            this.customElements = this.result.customElements;
                            this.isRadioEmpty = true;
                            this.isDataChange = false;
                            this.changeCheckBoxValues();
                            this.getLookupDataTypeValues();
                            this.dataChangeEvent.emit(false);
                            this.saveResponseEvent.emit(true);
                        }
                        this.isSaving = false;
                    }, err => {
                        if (this.isShowToast) {
                            this.showToast(false, true);
                        }
                        this.isSaving = false;
                        this.saveResponseEvent.emit(false);
                    }));
            }
        } else {
            if (this.externalSaveEvent) {
                this._autoSaveService.errorEvent(
                    {
                        name: this.tabName != 'GI' ? 'Other Information' : 'General Information',
                        documentId: 'custom-element-body',
                        type: 'VALIDATION'
                    });
            }
        }
    }

    showToast(isSuccessToast, showGeneralToast = false) {
        if (this.tabName != 'GI') {
            isSuccessToast ? this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Other Information(s) saved successfully.')
                : this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving Other Information(s) failed. Please try again.');
        }
        if (showGeneralToast && this.tabName == 'GI') {
            this._commonService.showToast(HTTP_ERROR_STATUS, `Saving ${AWARD_LABEL} failed as another transaction is being processed in current ${AWARD_LABEL.toLowerCase()}. Please click save again.`);
        }
    }

    emitDataChange() {
        this.emitMandatoryCheck();
        if (!this.isDataChange) {
            this.isDataChange = true;
            this.dataChangeEvent.emit(this.isDataChange);
        }
    }

    /**
     * here checked answers are pushed into answers array
     * and unchecked answers value and description are set to null
     * if a checked value is unchecked and checked without saving in between
     * save request will have 2 objects one with customDataId and value & desc removed(for delete),
     * other with value in description & value with customDataId null for insert.
     * We are not using same id in this case to avoid complex code logic.
     */
    setAnswerForCheckBox(list: any, event: boolean, option: any) {
        if (event) {
            const CUSTOM_ANSWER = new CustomAnswer();
            CUSTOM_ANSWER.value = option.customDataOptionId;
            CUSTOM_ANSWER.description = option.optionName;
            list.answers.push(CUSTOM_ANSWER);
        } else {
            this.removeAnswer(list, option);
        }
    }

    private removeAnswer(list: any, option: any) {
        const ANSWER = list.answers.find(ele => ele.value === option.customDataOptionId);
        ANSWER.description = null;
        ANSWER.value = null;
    }

    private changeCheckBoxValues() {
        this.customElements.forEach(customElement => {
            if (customElement.filterType === 'Check Box') {
                customElement.answers = customElement.answers.filter(ele => ele.customDataId != null);
            }
        });
    }

    checkIsSelected(answers: Array<any>, optionId: string) {
        return answers.find(ele => ele.value === optionId) ? true : false;
    }

    getLookupValues(answer): any {
        const LOOKUP_VALUES = [];
        answer.forEach((ele) => {
            const LOOKUP_ELEMENT = {};
            if (ele.value) {
                LOOKUP_ELEMENT['code'] = ele.value;
                LOOKUP_ELEMENT['description'] = ele.description;
                LOOKUP_VALUES.push(LOOKUP_ELEMENT);
            }
        });
        return LOOKUP_VALUES;
    }

    getLookUpArgument(arg) {
        return arg + '#true#true';
    }

    setDataForLookUpTypes(customElement: any): void {
        if (['System Dropdown', 'User Dropdown'].includes(customElement.filterType)) {
            this.lookUpValues[customElement.customDataElementId] = this.getLookupValues(customElement.answers);
        }
    }

    /**
     * Function for setting subscription to a subject variable that emits observable on data change in text fields
     * - custom field will be added to the queue
     * - has a debounce time of 500ms before pushing into the queue
     */
    private setupCustomFieldDebounce(): void {
        this.$subscriptions.push(
            this.$textInputDebounceSubject.pipe(
                debounceTime(500)
            ).subscribe((customField) => {
                this.addToAutoSaveQueue(customField);
            })
        );
    }

    /**
     * Function for initiating autosave
     * - only works if isAutoSaveEnabled is true
     * - debounce: For text fields if there is a change from previous value
     * then the API call will be triggered only after 500ms
     * - custom fields to be saved will be added to the queue
     */
    public autoSave(customField: CustomElement, debounce = false): void {
        if (!this.isAutoSaveEnabled) {
            return;
        }

        if (debounce && this.isDataChanged) {
            this.$textInputDebounceSubject.next(customField);
        } else if (!debounce) {
            this.addToAutoSaveQueue(customField);
        }
    }

    /**
     * Function for adding custom fields to the queue
     * - add the custom field to the queue only if it's not already present
     * - The queue will be processed only if there is no current queue being processed
     */
    private addToAutoSaveQueue(customField: CustomElement): void {
        const CUSTOM_FIELD_EXISTS = this.autoSaveQueue.some((q: CustomElement) =>
            q.customDataElementId === customField.customDataElementId);

        if (!CUSTOM_FIELD_EXISTS) {
            this.autoSaveQueue.push(customField);
        }

        const CAN_PROCESS_QUEUE = !this.isProcessingAutoSaveQueue;

        if (CAN_PROCESS_QUEUE) {
            this.processAutoSaveQueue();
        }
    }

    /**
     * Function for processing the queue of custom fields
     * - if the same custom field is repeatedly entered
     * then it will be in queue to wait for the API response for the first entry
     */
    public processAutoSaveQueue(): void {
        if (!this.autoSaveQueue.length) {
            this.isProcessingAutoSaveQueue = false;
            this._customService.updateAutoSaveQueueFlag(this.isProcessingAutoSaveQueue);
            return;
        }

        const TOAST_ELEMENT = document.getElementById('retry-autosave-toast');
        TOAST_ELEMENT.classList.add('invisible');

        this.isProcessingAutoSaveQueue = true;
        this._customService.updateAutoSaveQueueFlag(this.isProcessingAutoSaveQueue);

        const CUSTOM_FIELDS_TO_SAVE = [];

        while (this.autoSaveQueue.length > 0) {
            const CUSTOM_FIELD = this.autoSaveQueue.shift();
            if (!this.whetherCustomFieldInAPIQueue[CUSTOM_FIELD.customDataElementId]) {
                this.whetherCustomFieldInAPIQueue[CUSTOM_FIELD.customDataElementId] = true;
                CUSTOM_FIELDS_TO_SAVE.push(CUSTOM_FIELD);
            } else {
                this.autoSaveQueue.unshift(CUSTOM_FIELD);
            }
        }

        if (CUSTOM_FIELDS_TO_SAVE.length > 0) {
            this.autoSaveCustomFields(CUSTOM_FIELDS_TO_SAVE);
        }
    }

    /**
     * Function for autosaving custom fields in the queue. Contains the API call
     */
    private autoSaveCustomFields(customFieldsToSave: CustomElement[]): void {
        if (this.tabName !== 'GI') {
            this.checkMandatory();
        }
        this.setIsEmptyFlags();
        const CUSTOM_DATA = {
            customElements: [],
            moduleCode: null,
            moduleItemKey: null,
            updateTimestamp: null
        };
        CUSTOM_DATA.updateTimestamp = new Date().getTime();
        CUSTOM_DATA.moduleItemKey = this.moduleItemKey;
        CUSTOM_DATA.moduleCode = this.moduleCode;
        this.clearNullData(customFieldsToSave);
        CUSTOM_DATA.customElements = deepCloneObject(customFieldsToSave);
        this.trimEmptySpaces(CUSTOM_DATA.customElements);
        this._commonService.isPreventDefaultLoader = true;
        this.$subscriptions.push(this._customService.autoSaveCustomData(CUSTOM_DATA, this.isShowToast)
            .subscribe((data: AutoSaveResponse) => {
                this.handleResponse(data);
                this.processAutoSaveQueue();
            }, err => {
                this.handleError(CUSTOM_DATA);
            }));
    }

    /**
     * Function to clear any null data entries in a custom field before sending it to API call
     */
    private clearNullData(customFieldsToSave: CustomElement[]): void {
        customFieldsToSave.forEach((element: CustomElement) => {
            element.answers = element.answers.filter((item: Answer) => item.value !== null || item.customDataId !== null);
        });
    }

    /**
     * Function to clear any empty spaces in strings before sending it to API call
     */
    private trimEmptySpaces(customFieldsToSave: CustomElement[]): void {
        customFieldsToSave.forEach((element: CustomElement) => {
            if (['String', 'Number', 'Text'].includes(element.filterType)) {
                element.answers[0].value = element.answers[0].value.trim();
            }
        });
    }

    /**
     * Function to handle the API response when it is successfully completed
     */
    private handleResponse(data: AutoSaveResponse): void {
        this._commonService.isPreventDefaultLoader = false;
        if (data !== null) {
            if (this.isShowToast) {
                this.showToast(true);
            }
            this.updateDataWithResponse(data);
            this.getLookupDataTypeValues();
            this.saveResponseEvent.emit(true);
            if (!this.autoSaveQueue.length) {
                this.isDataChange = false;
                this.dataChangeEvent.emit(false);
            }
        }
    }

    /**
     * Function to update data based on the API response
     * - remove answer that are deleted
     * - update the id of each answer that are saved
     */
    private updateDataWithResponse(data: AutoSaveResponse): void {
        this.result.updateUser = data.updateUser;
        data.customElements.forEach((element: CustomElement) => {
            const INDEX = this.customElements.findIndex((item: CustomElement) => item.customDataElementId === element.customDataElementId);
            this.whetherCustomFieldInAPIQueue[element.customDataElementId] = false;
            if (INDEX !== -1) {
                if (this.result.customElements[INDEX].filterType === 'Check Box' ||
                    (['System Dropdown', 'User Dropdown'].includes(this.result.customElements[INDEX].filterType)
                        && this.result.customElements[INDEX].isMultiSelectLookup === 'Y')) {
                    this.filterRemovedAnswers(this.result.customElements[INDEX].answers, element.answers, INDEX);
                    this.updateAnswerIdsFromResponse(element.answers, INDEX);
                    if (this.result.customElements[INDEX].answers.length === 0) {
                        this.result.customElements[INDEX].answers.push(new CustomAnswer());
                    }
                } else {
                    this.result.customElements[INDEX].answers[0].customDataId = element.answers[0].customDataId;
                }
            }
        });
        this.customElements = this.result.customElements;
    }

    /**
     * Function to remove answer that are deleted based on the API response
     */
    private filterRemovedAnswers(mainArray: Answer[], responseAnswers: Answer[], index: number): void {
        const SECOND_ARRAY_IDS = responseAnswers
            .map((item: Answer) => item.customDataId)
            .filter((id: number) => id !== null);

        this.result.customElements[index].answers = mainArray.filter((item: Answer) => {
            return item.customDataId === null || SECOND_ARRAY_IDS.includes(item.customDataId);
        });
    }

    /**
     * Function to update the id of each answer that are saved from the API response
     */
    private updateAnswerIdsFromResponse(responseAnswers: Answer[], index: number): void {
        responseAnswers.forEach((answer: Answer) => {
            const DATA_TO_UPDATE = this.result.customElements[index].answers.find((answerInMainData: Answer) =>
                answerInMainData.value === answer.value || (!answerInMainData.value && !answerInMainData.customDataId)
            );

            if (DATA_TO_UPDATE && answer.customDataId) {
                if (!this.result.customElements[index].answers.some((answerInMainData: Answer) =>
                    answerInMainData.customDataId === answer.customDataId)) {
                    DATA_TO_UPDATE.customDataId = answer.customDataId;
                }
            }

        });
    }

    /**
     * Function to handle error condition if autosave API fail
     * - The autosave queue will be updated with fields that failed to save
     * - A retry toast will be shown to the user
     */
    private handleError(data: AutoSaveRequestObject): void {
        data.customElements.forEach((element: CustomElement) => {
            if (!this.autoSaveQueue.some((q: CustomElement) => q.customDataElementId === element.customDataElementId)) {
                this.autoSaveQueue.push(element);
            }
        });
        this._commonService.isPreventDefaultLoader = false;
        this.isProcessingAutoSaveQueue = false;
        this._customService.updateAutoSaveQueueFlag(this.isProcessingAutoSaveQueue);
        this.whetherCustomFieldInAPIQueue = {};
        const TOAST_ELEMENT = document.getElementById('retry-autosave-toast');
        TOAST_ELEMENT.classList.remove('invisible');
        this.saveResponseEvent.emit(false);
    }

    /**
     * Function to check if there is a change in previous value and the new value
     */
    public checkPreviousAndNewValue(oldValue: string, newValue: string, list: CustomElement): void {
        if (list.filterType === 'Number') {
            if (newValue.length >= list.dataLength) {
                newValue = newValue.slice(0, list.dataLength);
            }
            if (/[^0-9]/.test(newValue.trim())) {
                newValue = '';
            }
            this.isDataChanged = oldValue?.trim() !== newValue.trim();
        } else if (['String', 'Text'].includes(list.filterType)) {
            this.isDataChanged = oldValue?.trim() !== newValue.trim();
        }
        if (this.isDataChanged) {
            this.emitDataChange();
        }
    }

}
