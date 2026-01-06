import { Component, OnInit, OnDestroy } from '@angular/core';
import { AgreementCommonDataService } from '../agreement-common-data.service';
import { Subscription } from 'rxjs';
import { AgreementService } from '../agreement.service';
import { CommonService } from '../../common/services/common.service';
import { HTTP_SUCCESS_STATUS } from '../../app-constants';
import { AutoSaveService } from '../../common/services/auto-save.service';
import { getDateObjectFromTimeStamp } from '../../common/utilities/date-utilities';
declare var $: any;

@Component({
  selector: 'app-agreement-form',
  templateUrl: './agreement-form.component.html',
  styleUrls: ['./agreement-form.component.css']
})
export class AgreementFormComponent implements OnInit, OnDestroy {

  result: any = {};
  agreementId: any;
  $subscriptions: Subscription[] = [];
  configuration: any = {
    moduleItemCode: 13,
    moduleSubitemCodes: [0],
    moduleItemKey: '',
    moduleSubItemKey: 0,
    actionUserId: this._commonService.getCurrentUserDetail('personID'),
    actionPersonName: this._commonService.getCurrentUserDetail('fullName'),
    enableViewMode: false,
    isEnableVersion: true,
  };
  latestVersion: any = {};
  uploadedFile: any[];
  isReplaceAttachment = false;
  isAttachmentListOpen = true;
  attachmentWarningMsg = null;
  replaceAttachment: any = {};
  selectedAttachmentStatus = [];
  selectedAttachmentDescription = '';
  selectedAttachmentType: any[] = [];
  templateAttachments: any[];
  isGenerateAgreement = false;
  isAgreementAdministrator = false;
  isGroupAdministrator = false;
  isAgreementCreatedOnce = true;

  constructor(public _commonAgreementData: AgreementCommonDataService, public _commonService: CommonService,
    private _agreementService: AgreementService, private _autoSaveService: AutoSaveService) { }

  ngOnInit() {
    this.getAgreementGeneralData();
    this._autoSaveService.initiateAutoSave();
    window.scroll(0, 0);
  }

  ngOnDestroy() {
    this._autoSaveService.stopAutoSaveEvent();
  }

  getAgreementGeneralData() {
    this.$subscriptions.push(this._commonAgreementData.$agreementData.subscribe((data: any) => {
      if (data) {
        this.result = JSON.parse(JSON.stringify(data));
        this.getTemplateLatestVersion();
        this.getPermissions();
      }
    }));
  }

  /** Fetches the latest version of template by providing a reducer function. */
  getTemplateLatestVersion() {
    if (this.result.agreementAttachments && this.result.agreementAttachments.length) {
      this.latestVersion = this.result.agreementAttachments.reduce((first, second) =>
        first.versionNumber > second.versionNumber ? first : second);
    }
  }

  /** Returns true if the given right contains in the list of all available rights otherwise false. */
  getPermissions() {
    this.isGenerateAgreement = this.result.availableRights.includes('GENERATE_DOCUMENT');
    this.isAgreementAdministrator = this.result.availableRights.includes('AGREEMENT_ADMINISTRATOR');
    this.isGroupAdministrator = this.result.availableRights.includes('VIEW_ADMIN_GROUP_AGREEMENT');
  }

  /**
   * @param  {} attachment
   * @param  {} type
   * Downloads the agreement template in all browsers.
   */
  downloadAgreementTemplate(attachment, type) {
    this._agreementService.downloadAgreementTemplate(attachment.agreementAttachmentId, type).subscribe(data => {
      if ((window.navigator as any).msSaveOrOpenBlob) {
        (window.navigator as any).msSaveBlob(new Blob([data], { type: attachment.mimeType }), attachment.fileName);
      } else {
        this.createDownloadElement(data, attachment.fileName, type);
      }
    });
  }

  createDownloadElement(data, filename, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(data);
    a.download = filename + '.' + type;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  fileDrop(files) {
    this.attachmentWarningMsg = null;
    this.updateReplaceAttachmentDetails(files);
  }

  /** updateAddAttachmentDetails - clears attachment details for Adding attachments
  /** updateReplaceAttachmentDetails - sets attachment details for replacing attachment */
  updateReplaceAttachmentDetails(files) {
    if (files.length) {
      (this.validateDocument(files[0])) ? this.manageReplacementOption(files) :
      this.attachmentWarningMsg = '* Please select a docx file or pdf file for Replace Document option ';
    }
   }

  /**
   * @param  {} file
   * Validates the document from its extension.
   */
  validateDocument(file) {
    if (file.name) {
      return this.getTypeFromFile(file.name, '.');
    }
  }

  /**
  * @param  {any} type
  * @param  {String} splitBy
  * returns true if the added file name has extension type docx or pdf.
  */
  getTypeFromFile(file: any, splitBy: String) {
    return (file.split(splitBy).pop() === 'docx' || file.split(splitBy).pop() === 'pdf') ? true : false;
  }

  /**
   * @param  {any} files
   * Checks the file length for 1 if so, replaces the file with latest uploaded version.
   */
  manageReplacementOption(files: any) {
    if (files.length === 1) {
      this.uploadedFile = [];
      this.checkAttachmentSize(files[0]);
      this.selectedAttachmentDescription = this.latestVersion.description;
    } else {
      this.attachmentWarningMsg = '* Choose only one document to replace';
    }
    this.selectedAttachmentDescription = '';
  }

  /**
   * @param  {} file
   * Checks the size of a given file and shows a warning message if it doesn't matches the provided condition,
   * otherwise moves to the uploaded file array.
   */
  checkAttachmentSize(file) {
    file.size > 19591292 || (file.size <= 0) ? this.attachmentWarningMsg = '* Document size must be greater than 0 KB and less than 20 MB' :
      this.uploadedFile.push(file);
  }

  /**
   * @param  {any} typeCode
   * Finds the matching typeCodes from agreementAttachmentTypes w.r.t the gives type code
   * and returns the corresponding description.
   */
  getAttachmentType(typeCode: any) {
    if (this.result.agreementAttachmentTypes && typeCode) {
      return String(this.result.agreementAttachmentTypes.find(type => type.agreementAttachmentTypeCode === typeCode).description);
    }
  }

  /**
   * @param  {} index
   * Deletes the corresponding file from the index passed.
   */
  deleteFromUploadedFileList(index) {
    this.uploadedFile.splice(index, 1);
    this.attachmentWarningMsg = null;
  }

  /** Resets the uploaded file array and hides the replacement modal. */
  clearAttachmentDetails() {
    this.attachmentWarningMsg = null;
    this.uploadedFile = [];
    this.isReplaceAttachment = false;
    $('#replace-agreement-attachment').modal('hide');
  }

  /** setRequestObject - Prepares the object for adding attachments. */
  setRequestObject() {
    const tempArrayForAdd = [];
    for (let uploadIndex = 0; uploadIndex < this.uploadedFile.length; uploadIndex++) {
      const tempObjectForAdd: any = {};
      tempObjectForAdd.agreementAttachmentTypeCode = this.getAttachmentTypeCode();
      tempObjectForAdd.agreementAttachmentId = this.latestVersion.agreementAttachmentId;
      tempObjectForAdd.description = this.selectedAttachmentDescription;
      tempObjectForAdd.fileName = this.uploadedFile[uploadIndex].name;
      tempObjectForAdd.updateTimestamp = new Date().getTime();
      tempObjectForAdd.updateUser = this._commonService.getCurrentUserDetail('userName');
      tempArrayForAdd[uploadIndex] = tempObjectForAdd;
    }
    this.templateAttachments = tempArrayForAdd;
  }

  getAttachmentTypeCode() {
    return this.latestVersion.agreementAttachmentTypeCode ? this.latestVersion.agreementAttachmentTypeCode : '4';
  }

  replaceAttachments() {
    this.setRequestObject();
    if (!this.attachmentWarningMsg) {
      this.$subscriptions.push(
        this._agreementService.addAgreementAttachment({
          'agreementRequestId': this.result.agreementHeader.agreementRequestId,
          'newAttachments': this.templateAttachments,
          'agreementTypeCode': this.result.agreementHeader.agreementTypeCode,
          'agreementType': this.result.agreementHeader.agreementType.description,
          'updateUser': this._commonService.getCurrentUserDetail('userName'),
          'isAgreementCreatedOnce': this.isAgreementCreatedOnce,
          'isGeneratedAgreement': true
        }, this.uploadedFile)
          .subscribe((success: any) => {
            this.result.agreementAttachments = success.agreementAttachments;
            this.result.isAgreementCreatedOnce = success.isAgreementCreatedOnce;
            this.updateAgreementStoreData();
            this.clearAttachmentDetails();
            this.getTemplateLatestVersion();
          }, error => {
            this.isAgreementCreatedOnce = false;
          }
          ));
    }
  }

  /**
   * @param  {any} contentType
   * returns true if the content type is pdf.
   * if the content type is pdf, only 'Download as pdf' button will show.
   * if the content type is octet-stream, i.e., for docx format attachments, then
   * both 'Download as docx' and 'Download as pdf' buttons will show.
   */
  checkFileTypeForPdf(contentType: any) {
    return (contentType.split('/').pop() === 'pdf') ? true : false;
  }

  /** Updates all the agreement data. */
  updateAgreementStoreData() {
    this.result = JSON.parse(JSON.stringify(this.result));
    this._commonAgreementData.setAgreementData(this.result);
  }

  /**
   * @param  {} latestVersion
   * This will make the uploaded document as final document.
   */
  makeAsFinal(latestVersion) {
    this._agreementService.makeAsFinal({
      'agreementAttachmentId': latestVersion.agreementAttachmentId,
      'isFinal': latestVersion.agreementAttachStatusCode === 'C' ? false : true
    })
      .subscribe((success: any) => {
        this.result.agreementAttachments = success.agreementAttachments;
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Updated successfully.');
        this.updateAgreementStoreData();
      });
  }

  getPiLastName() {
    return this.latestVersion.updateUserFullName.split(' ').slice(-1).join(' ');
  }

  checkForReplaceButton() {
    return ['4', '8', '9', '10'].includes(this.result.agreementHeader.agreementStatusCode) ? false : true;
  }
}
