import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {CommonService} from '../../../../common/services/common.service';
import {Observable, Subject, Subscription} from 'rxjs';
import {deepCloneObject, fileDownloader, hideModal, setFocusToElement} from '../../../../common/utilities/custom-utilities';
import {parseDateWithoutTimestamp} from '../../../../common/utilities/date-utilities';
import {subscriptionHandler} from '../../../../common/utilities/subscription-handler';
import {DATE_PLACEHOLDER, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS} from '../../../../app-constants';
import {ElasticConfigService} from '../../../../common/services/elastic-config.service';
import {FormElementViewService} from './form-element-view.service';
import {FormBuilderCreateService} from '../../form-builder-create.service';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { CustomDataElementAnswer } from './form-element-view.interface';
import { CustomAnswerAttachment } from '../../form-builder-create-interface';
import { getEndPointOptionsForSponsor, getEndPointOptionsForLeadUnit, getEndPointOptionsForDepartment, 
    getEndPointOptionsForOrganization, getEndPointOptionsForProfitCentre, getEndPointOptionsForGrandCode, 
    getEndPointOptionsForCostCentre, getEndPointOptionsForFundCentre, getEndPointOptionsForMappedClaimTemplate } from '../../../../../../../fibi/src/app/common/services/end-point.config';
import { getEndPointOptionsForCountry } from '../form-builder-view/search-configurations';
import { EDITOR_CONFIURATION } from '../../../../../../../fibi/src/app/app-constants';
import { debounceTime } from 'rxjs/operators';
declare var $: any;

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

  type LookupElement = {
    code: string;
    description: string;
    dataType: string | null;
};

@Component({
  selector: 'app-form-element-view',
  templateUrl: './form-element-view.component.html',
  styleUrls: ['./form-element-view.component.scss']
})
export class FormElementViewComponent implements OnInit, OnChanges {

  @Input() moduleItemKey;
  @Input() moduleCode;
  @Input() isViewMode;
  @Input() customElementVO;
  @Output() dataChangeEvent = new EventEmitter<boolean>();
  @Output() emitChanges = new EventEmitter<any>();
  @Output() answerChangeEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() saveEvent = new EventEmitter<any>();
  @Output() elementAction = new EventEmitter<any>();
  @Input() externalEvent: Observable<any>;
  @Input() isShowSave = false;
  @Input() isShowCollapse = false;
  @Input() component;
  customElement;
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
  datePlaceHolder = DATE_PLACEHOLDER;
  $subscriptions: Subscription[] = [];
  ESOptions: any = {};
  EPOptions: any = {};
  setFocusToElement = setFocusToElement;
  parseDateWithoutTimestamp = parseDateWithoutTimestamp;
  isSaving = false;
  isDataChange = false;
  isShowOtherInfo = true;
  collapseViewMore = {};
  lookUpOptions = '';
  isLoadComponent = false;
  currencySymbol: string = '';
  defaultcurrencySymbol: any = '';
  subscription: Subscription;
  isAttachmentSaving = false;

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
  selectedLookUpList = [];
    editor = DecoupledEditor;
    editorConfig = EDITOR_CONFIURATION;

    uploadedFile = [];
    selectedAttachmentDescription = [];
    editAttachmentDetails: CustomAnswerAttachment = new CustomAnswerAttachment();
    deleteAttachmentDetails: CustomAnswerAttachment = new CustomAnswerAttachment();
    attachmentDetails: CustomAnswerAttachment[];
    tempAttachDetail: any;
    $debounceTimer = new Subject<any>();
    customElementAttachments: CustomAnswerAttachment[];

  constructor(private _formElementService: FormElementViewService, public _commonService: CommonService,
      private _elasticConfig: ElasticConfigService, public formBuilderCreateService: FormBuilderCreateService) { }


  ngOnChanges(changes: SimpleChanges): void {
      if (this.customElementVO && this.customElementVO.customElements) {
          this.customElement = this.customElementVO.customElements[0];
          this.setDefaultValues(this.customElement);
          this.customElement.placeHolderText = this.customElementVO.customDataElement.placeHolderText;
          this.isLoadComponent = this.customElement && Object.keys(this.customElement).length > 0;
      }
  }

  ngOnInit() {
      this.autoSaveEvent();
      this.defaultcurrencySymbol = this._commonService.currencyFormat;
      this.setDeleteAttachmentEmpty();
      this.listenDebounceTimer();
      if(this.customElement.dataType === 'AT') {
        this.customElementAttachments = deepCloneObject(this.customElement.attachments);
      }
  }

    private setDeleteAttachmentEmpty() {
        if (this.customElement) {
            this.customElement.deleteAttachmentList = [];
        }
    }

    collapseViewMoreOption(id: number, flag: boolean): void {
      this.collapseViewMore[id] = !flag;
  }

  /**
 * @param  {} customElementList
 * sets the default value if any based on fieldType.
 */
  setDefaultValues(customElement) {
      switch (customElement.dataType) {
          case 'ES': this.setElasticOptions(customElement); break;
          case 'AS': this.setEndpointOptions(customElement); break;
          case 'SD': this.setLookUpOptions(customElement); break;
          case 'UD': this.setLookUpOptions(customElement); break;
          case 'CR': this.setCurrencyOptions(customElement); break;
          default: customElement.answers.findIndex(item => item.value = item.value ? item.value : customElement.defaultValue);
      }
  }

    setLookUpOptions(customElement): void {
        this.lookUpOptions = customElement.lookupArgument + '#' + this.isMultiLookupEnabled(customElement) + '#true';
        this.selectedLookUpList = this.getLookupValues(customElement.answers);
    }

    isMultiLookupEnabled(customElement) {
        return customElement.isMultiSelectLookup === 'Y'? 'true':'false';
    }

  /**
 * this Event subscribes to the auto save trigger generated on save click on top basically
 * what happens is when a save click happen this will let this component know when
 * user click the general save button.
 */
  autoSaveEvent() {
      if (this.externalEvent) {
          this.$subscriptions.push(this.externalEvent.subscribe((event: any) => {
              if (event.eventType === 'EXTERNAL_SAVE' && this.isDataChange) {
                  this.isAttachmentSaving = false;
                  this.saveCustomDataExternal();
              } else if (event.eventType === 'SAVE' && this.isDataChange) {
                  this.saveCustomData();
              } else if (event.eventType === 'SAVE_COMPLETE') {
                  this.isDataChange = false;
                  this.closeOpenModals(event);
              } else if (event.eventType === 'AUTO_SAVE_ERROR' && this.customElement.dataType === 'AT') {
                  this.isAttachmentSaving = false;
                  this.customElement.attachments = this.customElement.attachments.filter(item => item.attachmentId !== null);
              }
          }));
      }
  }

    private closeOpenModals(event: any): void {
        this.isAttachmentSaving = false;
        const ATTACHMENT_ELEMENT = event?.data?.[0]?.customElement?.customElements?.[0];
        if (!ATTACHMENT_ELEMENT || ATTACHMENT_ELEMENT.dataType !== 'AT') return;
        this.clearAttachmentDetails();
        const ELEMENT_ID = this.customElement?.customDataElementId;
        if (this.editAttachmentDetails?.attachmentId) {
            this.editAttachmentDetails = new CustomAnswerAttachment();
            hideModal(`EditAttachmentModal${ELEMENT_ID}`);
        } else if (this.deleteAttachmentDetails?.attachmentId) {
            this.deleteAttachmentDetails = new CustomAnswerAttachment();
            hideModal(`deleteAttachmentModal${ELEMENT_ID}`);
        } else {
            this.attachmentDetails = [];
            hideModal(`AttachmentModal${ELEMENT_ID}`);
        }
        this.customElementAttachments = deepCloneObject(ATTACHMENT_ELEMENT.attachments);
        this.setDeleteAttachmentEmpty();
    }

  setElasticOptions(object) {
      switch (object.lookupArgument) {
          case 'fibiproposal': this.ESOptions[object.customDataElementId] = this._elasticConfig.getElasticForProposal(); break;
          case 'fibiperson': this.ESOptions[object.customDataElementId] = this._elasticConfig.getElasticForPerson(); break;
          case 'awardfibi': this.ESOptions[object.customDataElementId] = this._elasticConfig.getElasticForAward(); break;
          case 'instituteproposal': this.ESOptions[object.customDataElementId] = this._elasticConfig.getElasticForProposal(); break;
          case 'grantcall_elastic': this.ESOptions[object.customDataElementId] = this._elasticConfig.getElasticForGrantCall(); break;
          default: break;
      }
      this.ESOptions[object.customDataElementId].defaultValue = object.answers[0].description ? object.answers[0].description : '';
      this.ESOptions[object.customDataElementId].contextField = object.defaultValue || this.ESOptions[object.customDataElementId].contextField;
  }

  setEndpointOptions(object) {
      switch (object.lookupArgument) {
          case 'sponsorName': this.EPOptions[object.customDataElementId] = getEndPointOptionsForSponsor(); break;
          case 'unitName': this.EPOptions[object.customDataElementId] = getEndPointOptionsForLeadUnit(); break;
          case 'fibiDepartment': this.EPOptions[object.customDataElementId] = getEndPointOptionsForDepartment(); break;
          case 'fibiOrganization': this.EPOptions[object.customDataElementId] = getEndPointOptionsForOrganization(); break;
          case 'fibiCountry': this.EPOptions[object.customDataElementId] = getEndPointOptionsForCountry(); break;
          case 'profitCenterName': this.EPOptions[object.customDataElementId] = getEndPointOptionsForProfitCentre(); break;
          case 'grantCodeName': this.EPOptions[object.customDataElementId] = getEndPointOptionsForGrandCode(); break;
          case 'costCenterName': this.EPOptions[object.customDataElementId] = getEndPointOptionsForCostCentre(); break;
          case 'fundCenterName': this.EPOptions[object.customDataElementId] = getEndPointOptionsForFundCentre(); break;
          case 'claimTemplateName': this.EPOptions[object.customDataElementId] = getEndPointOptionsForMappedClaimTemplate(); break;
          default: break;
      }
      this.EPOptions[object.customDataElementId].defaultValue = object.answers[0].description ? object.answers[0].description : null;
      this.EPOptions[object.customDataElementId].contextField = object.defaultValue || this.EPOptions[object.customDataElementId].contextField;
  }
  setSearchFilterValue(data, answer, list) {
      if (data) {
          switch (list.dataType) {
              case 'AS':
                  answer.value = data[this.searchObjectMapping[list.lookupArgument]] || null;
                  answer.description = data[list.defaultValue];
                  break;
              case 'ES':
                  answer.description = data[list.defaultValue];
                  answer.value = data[this.searchObjectMapping[list.lookupArgument]] || null;
                  break;
          }
      } else {
          answer.value = '';
          answer.description = '';
      }
      this.emitDataChange();
  }

    onLookupSelect(data:LookupElement[], list): void {
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
        })
        this.emitDataChange();
    }

  getLookupValues(answer:CustomAnswer[]): { code: string; description: string }[] {
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

  ngOnDestroy() {
      subscriptionHandler(this.$subscriptions);
  }
  /**
   * @param  {} customField
   * @param  {} event
   * @param  {} list
   * @param  {} id
   * check null,length and type validations on change
   */
  checkValidation(customField, event, list, id) {
      if (event.target.value.length < list.dataLength) {
          this.isLength = false;
      } else {
          this.lengthValidationId = id;
          this.isLength = true;
          customField.value = event.target.value = event.target.value.slice(0, list.dataLength);
      }
      if (['NE', 'CR'].includes(list.dataType) && event.keyCode >= 65 && event.keyCode <= 90) {
          this.isType = true;
          this.numberValidationId = id;
          customField.value = event.target.value.slice(0, 0);
      } else {
          this.isType = false;
      }
  }
  /**
   * check mandatory validation.
   *  data description and corresponding type codes are listed below.
   * 1-String, 2-Number, 3-Date, 4-Check Box, 5-Radio Button, 6-Elastic Search, 7-End Point Search, 8-System Lookup, 9-User Lookup
   */
  // checkMandatory() {
  //     this.checkEmptyFlag = false;
  //     this.radioEmptyFlag = false;
  //         if (this.customElement.dataType !== 'Radio Button' && this.customElement.dataType !== 'Check Box') {
  //             const INDEX = this.customElement.answers.findIndex(item => (item.value === null || item.value === ''));
  //             if (INDEX >= 0 && this.customElement.isRequired === 'Y') {
  //                 this.isValueEmpty[index] = false;
  //                 this.validationId[index] = index;
  //             } else {
  //                 this.isValueEmpty[index] = true;
  //             }
  //         }
  //         this.checkEmptyFlag = false;
  //         this.radioEmptyFlag = false;
  //         if (this.customElement.dataType === 'Check Box' && this.customElement.isRequired === 'Y') {
  //             this.checkEmptyFlag = !!this.customElement.answers.find(item => item.value === true || item.value === 'true');
  //         }
  //         if (this.checkEmptyFlag === true) {
  //             this.checkEmpty[index] = false;
  //             this.validationId[index] = index;
  //         } else {
  //             this.checkEmpty[index] = true;
  //         }
  //         if (this.customElement.dataType === 'Radio Button' && this.customElement.isRequired === 'Y') {
  //             this.radioEmptyFlag = !!this.customElement.answers.find(item => item.value !== null && item.value !== '');
  //         }
  //         if (this.radioEmptyFlag === true) {
  //             this.radioEmpty[index] = false;
  //             this.validationId[index] = index;
  //         } else {
  //             this.radioEmpty[index] = true;
  //         }
  // }

  saveCustomData() {
      // this.checkMandatory();
      if ((this.isValueEmpty.filter(item => item === false).length !== 0) ||
          (this.checkEmpty.filter(check => check === false).length !== 0) ||
          (this.radioEmpty.filter(radio => radio === false).length !== 0)) {
          this.isEmpty = true;
      } else {
          this.isEmpty = false;
      }
      if (this.isEmpty === false && this.checkEmptyFlag === false && this.radioEmptyFlag === false) {
          this.isLength = false;
          const CUSTOM_DATA: any = {};
          CUSTOM_DATA.updateTimestamp = new Date().getTime();
          CUSTOM_DATA.moduleItemKey = this.moduleItemKey;
          CUSTOM_DATA.moduleCode = this.moduleCode;
          CUSTOM_DATA.customElements = this.customElement;
          if (!this.isSaving) {
              this.isSaving = true;
              this.$subscriptions.push(this._formElementService.saveCustomData(CUSTOM_DATA)
                  .subscribe(data => {
                      this.result = data || [];
                      if (this.result !== null) {
                          if (this.isShowSave) {
                              this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Other Information(s) saved successfully.');
                          }
                          this.customElement = this.result.customElements;
                          this.isRadioEmpty = true;
                          this.isDataChange = false;
                          this.dataChangeEvent.emit(false);
                      }
                      this.isSaving = false;
                  }, err => {
                      this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving Other Information(s) failed. Please try again.');
                      this.isSaving = false;
                  }));
          }
      }
  }

  private saveCustomDataExternal() {
      if (this.isDataChange) {
          const CUSTOM_DATA: any = {};
          CUSTOM_DATA.updateTimestamp = new Date().getTime();
          CUSTOM_DATA.moduleItemKey = this.moduleItemKey;
          CUSTOM_DATA.moduleCode = this.moduleCode;
          CUSTOM_DATA.customElements = [this.customElement];
          delete this.customElement.placeHolderText;
          this.saveEvent.emit({ status: 'EXTERNAL_SAVE', data: CUSTOM_DATA});
      }
  }

 /**
   * Function to check if there is a change in previous value and the new value
   * - Updates the ng model data
  */
    public storePreviousValueAndUpdate(data: any, key: string | number, newValue: string): void {
        if (this.formBuilderCreateService.isAutoSaveEnabled) {
            this.isDataChange = data[key]?.toString().trim() !== newValue?.toString().trim();
        }
        data[key] = newValue?.toString().trim();
    }

    emitDataChange() {
        // if (!this.isDataChange && (!this.formBuilderCreateService.isAutoSaveEnabled || (!['CR', 'NE', 'PT', 'TE', 'SE'].includes(this.customElement.dataType) && this.formBuilderCreateService.isAutoSaveEnabled))) {
        //     this.isDataChange = true;
        //     this.dataChangeEvent.emit(this.isDataChange);
        // }
        if (!this.isDataChange) {
            this.isDataChange = true;
        }
        this.dataChangeEvent.emit(this.isDataChange);
        if (this.formBuilderCreateService.isAutoSaveEnabled) {
            if (['CR', 'NE', 'PT', 'TE', 'SE'].includes(this.customElement.dataType) && this.isDataChange) {
                this.$debounceTimer.next();
            } else if(!['CR', 'NE', 'PT', 'TE', 'SE'].includes(this.customElement.dataType)){
                this.emitDataChanges();
            }
        }
        if(this.customElement?.dataType !== 'CB') this.emitAnswerChangeEvent();
    }

    private listenDebounceTimer(): void {
        this.$subscriptions.push(
            this.$debounceTimer.pipe(debounceTime(500)).subscribe(() => {
                this.emitDataChanges();
            })
        );
    }

    emitDataChanges() {
        if(this.formBuilderCreateService.isAutoSaveEnabled) {
            const CUSTOM_DATA: any = {};
            CUSTOM_DATA.updateTimestamp = new Date().getTime();
            CUSTOM_DATA.moduleItemKey = this.moduleItemKey;
            CUSTOM_DATA.moduleCode = this.moduleCode;
            CUSTOM_DATA.customElements = [this.customElement];
            delete this.customElement.placeHolderText;
            this.emitChanges.emit(CUSTOM_DATA);
        }
    }

    emitAnswerChangeEvent() {
        setTimeout(() => this.answerChangeEvent.next(), 100);
    }

  checkIsSelected(answers: Array<any>, optionId: string) {
      return !!answers.find(ele => ele.value === optionId);
  }

  setAnswerForCheckBox(list: any, event: boolean, option: any) {
      if (event) {
          const CUSTOM_ANSWER = new CustomAnswer();
          CUSTOM_ANSWER.value = option.customDataOptionId;
          CUSTOM_ANSWER.description = option.optionName;
          list.answers.push(CUSTOM_ANSWER);
      } else {
       this.removeAnswer(list, option);
      }
      this.emitDataChange();
      this.emitAnswerChangeEvent();
    }

    private removeAnswer(list: any, option: any) {
      const ANSWER = list.answers.find(ele => ele.value === option.customDataOptionId);
      ANSWER.description = null;
      ANSWER.value = null;
    }

    onReady(editor) {
        editor.ui.getEditableElement().parentElement.insertBefore(
            editor.ui.view.toolbar.element,
            editor.ui.getEditableElement()
        );
    }

    getEditorConfig(placeholder: string) {
        return {
            ...this.editorConfig,
            placeholder: placeholder,
        };
    }

    /**
    * To restrict users from entering negative values in the "Contract Value" field.
    */
    filterNegativeValues(event: Event): void {
      const INPUT = event.target as HTMLInputElement;
      const CONTRACT_VALUE = INPUT.value;
      // Remove non-numeric characters except for the decimal point and hyphen
      INPUT.value = INPUT.value.replace(/[^0-9.-]/g, '');
      const IS_NEGATIVE_VALUE = INPUT.value.includes('-') || parseFloat(INPUT.value) < 0;
      if (IS_NEGATIVE_VALUE) {
          //keep positive values and decimal points
          INPUT.value = CONTRACT_VALUE.replace(/[-]/g, ''); 
      }
  }

  /** Sets currency symbol from selected currency format 
  * If no symbol is available, the currency selected should appear in the Contract value field.
  */
  setCurrencySymbol() {
    const ANSWER: CustomDataElementAnswer = this.customElement.answers[0];
    this.currencySymbol = this.customElement.defaultValue || this.defaultcurrencySymbol;
  }

  setCurrencyOptions(customElement) {
    customElement.answers[0].value = customElement?.answers[0]?.value || 0;
    this.setCurrencySymbol();
  }
    fileDrop(files) {
        this.attachmentDetails = [];
        for (let index = 0; index < files.length; index++) {
            this.updateAddAttachmentDetails(files, index);
        }
        if (this.component.captureDescription !== 'Y') {
            this.addAttachments();
            document.getElementById('form-attachment-popup-close-btn-' + this.customElement?.customDataElementId).click();
        }
    }

    updateAddAttachmentDetails(files, index) {
        this.uploadedFile.push(files[index]);
        const CUSTOM_ANSWER_ATT = new CustomAnswerAttachment();
        CUSTOM_ANSWER_ATT.moduleItemKey = this.moduleItemKey;
        CUSTOM_ANSWER_ATT.moduleItemCode = this.moduleCode;
        CUSTOM_ANSWER_ATT.moduleSubItemKey = this.component.componentId;
        CUSTOM_ANSWER_ATT.fileKey = this.component.componentId + '#' + index;
        CUSTOM_ANSWER_ATT.fileName = files[index]?.name;
        CUSTOM_ANSWER_ATT.attachment = files[index];
        this.attachmentDetails.push(CUSTOM_ANSWER_ATT);
    }

    deleteFromUploadedFileList(index) {
        this.selectedAttachmentDescription.splice(index, 1);
        this.uploadedFile.splice(index, 1);
    }

    openDeleteAttachmentModal(attachemnt: CustomAnswerAttachment, customElementId) {
        this.deleteAttachmentDetails = new CustomAnswerAttachment();
        if (this.formBuilderCreateService.isAutoSaveEnabled) {
            this.deleteAttachmentDetails = deepCloneObject(attachemnt);
            this.showAttachmentModal('deleteAttachmentModal', customElementId);
        } else {
            this.deleteAttachment(attachemnt);
        }
    }

    deleteAttachment(attachment: CustomAnswerAttachment) {
        const attachments = this.customElement.attachments;
        if (!attachment) { return; }
        if (attachment.attachmentId) {
            this.customElement.deleteAttachmentList.push(attachment.attachmentId);
            const indexToRemove = attachments.findIndex(att => att.attachmentId === attachment.attachmentId);
            if (indexToRemove !== -1) {
                attachments.splice(indexToRemove, 1);
            }
        } else {
            const indexToRemove = attachments.findIndex(att => att.fileKey === attachment.fileKey);
            if (indexToRemove !== -1) {
                attachments.splice(indexToRemove, 1);
            }
        }
        this.emitDataChange();
    }

    addAttachments() {
        if (this.uploadedFile.length && !this.isAttachmentSaving) {
            this.attachmentDetails.forEach((item: any, index: number) => {
                item.description = this.selectedAttachmentDescription[index];
                this.customElement.attachments.push(item);
            });
            this.component.formFiles = this.uploadedFile;
            this.isAttachmentSaving = true;
            this.emitDataChange();
        }
    }

    clearAttachmentDetails() {
        this.uploadedFile = [];
        this.selectedAttachmentDescription = [];
        this.attachmentDetails = [];
    }

    editAttachment(attachment: CustomAnswerAttachment, customElementId) {
        this.editAttachmentDetails = null;
        this.tempAttachDetail = attachment;
        this.editAttachmentDetails = deepCloneObject(attachment);
        this.showAttachmentModal('EditAttachmentModal', customElementId);
    }
    cancelAttachmentEdit() {
        this.editAttachmentDetails = new CustomAnswerAttachment();
    }

    cancelDeleteAttachment() {
        this.deleteAttachmentDetails = new CustomAnswerAttachment();
    }

    updateAttachmentDetails() {
        this.updateAttachment(this.editAttachmentDetails);
    }

    private updateAttachment(attachmentDetail: CustomAnswerAttachment) {
        const ATTACHMENT_INDEX = this.getAttachmentEditIndex();
        if (ATTACHMENT_INDEX === -1) return
        let updatedAttachment = deepCloneObject(attachmentDetail);
        updatedAttachment = this.updateEditAttachment(updatedAttachment);
        this.customElement.attachments[ATTACHMENT_INDEX] = updatedAttachment;
        this.emitDataChange();
    }

    updateEditAttachment(attachment: CustomAnswerAttachment) {
        return {
            ...attachment,
            moduleSubItemKey: null,
            fileKey: null
        };
    }

    private getAttachmentEditIndex(): number {
        const index = this.customElement.attachments.findIndex(att => att.attachmentId === this.editAttachmentDetails.attachmentId);
        if (index !== -1) {
            return index;
        } else {
            return this.customElement.attachments.findIndex(att => att.fileKey === this.editAttachmentDetails.fileKey);
        }
    }

    downloadFormAttachment(attachment: CustomAnswerAttachment) {
        this.elementAction.emit({action: 'DOWNLOAD_ATTACHMENT', data: attachment});
    }

    showAttachmentModal(modalType, elementId) {
        $(`#${modalType}` + elementId).modal('show');
    }

    getFileIcon(fileType: string): string {
        if (!fileType) return 'fa-file';
        const fileIconMap: { [key: string]: string } = {
            pdf: 'fa-file-pdf-o text-danger',
            doc: 'fa-file-word-o text-success',
            docx: 'fa-file-word-o text-success',
            xls: 'fa-file-excel-o text-success',
            xlsx: 'fa-file-excel-o text-success',
            ppt: 'fa-file-powerpoint-o text-danger',
            pptx: 'fa-file-powerpoint-o text-danger',
            jpg: 'fa-file-image-o text-primary',
            jpeg: 'fa-file-image-o text-primary',
            png: 'fa-file-image-o text-primary',
            gif: 'fa-file-image-o text-primary',
            mp3: 'fa-file-audio-o text-primary',
            wav: 'fa-file-audio-o text-primary',
            mp4: 'fa-file-video-o text-primary',
            avi: 'fa-file-video-o text-primary',
            mov: 'fa-file-video-o text-primary',
            txt: 'fa-file-text-o',
            zip: 'fa-file-archive-o text-primary',
        };
        return fileIconMap[fileType.toLowerCase()] || 'fa-file';
    }

}
