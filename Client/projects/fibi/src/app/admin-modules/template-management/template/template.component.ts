import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TemplateService } from './template.service';
import { CommonService } from '../../../common/services/common.service';
import { HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { AgreementService } from '../../../agreement/agreement.service';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css']
})
export class TemplateComponent implements OnInit {
  uploadedFile = [];
  warningObj: any = {};
  templateList: any = [];
  completerSearchOptions: any = {};
  $subscriptions: Subscription[] = [];
  agreementTypeList: any;
  templateAttachments: any[];
  templateObject: any = {};
  map = new Map();
  attachmentWarningMsg: string;
  deleteIndex;
  latestVersion: any = {};
  temporaryAgreement: any = {};

  constructor(private _templateService: TemplateService, public _commonService: CommonService,
    private _agreementService: AgreementService
    ) { }

  ngOnInit() {
    this.temporaryAgreement = localStorage.getItem('agreementType') ?
      JSON.parse(localStorage.getItem('agreementType')) : null;
    this.loadAllTemplates(this.getTypeCode(), this.getAgreementDescription());
  }

  getTypeCode() {
    return this.temporaryAgreement ? this.temporaryAgreement.agreementTypeCode : null;
  }

  getAgreementDescription() {
    return this.temporaryAgreement ? this.temporaryAgreement.description : null;
  }

  fileDrop(files) {
    this.warningObj.attachment = null;
    let dupFile = null;
    this.uploadedFile = [];
    if (this.validateDocument(files[0])) {
      for (let index = 0; index < files.length; index++) {
        dupFile = this.uploadedFile.find(file => file.name === files[index].name);
        (dupFile != null) ? this.warningObj.attachment = '* ' + dupFile.name + ' already added' : this.uploadedFile.push(files[index]);
      }
    }
  }

  validateDocument(file) {
    if(file) {
      if (file.name) {
        return this.getExtensionFromFile(file.name, '.');
      }      
    }
 }

  /**
   * @param  {any} type
   * @param  {String} splitBy
   * returns true if the added file name has extension type docx.
   */
  getExtensionFromFile(file: any, splitBy: String) {
    return (file.split(splitBy).pop() === 'docx') ? true : false;
  }

  loadAllTemplates(typeCode, description) {
    this.$subscriptions.push(
      this._templateService.loadAllTemplates({ 'agreementTypeCode': typeCode }
      ).subscribe((data: any) => {
        this.templateList = data;
        this.completerSearchOptions = this.setCompleterSearchOptions('description', 'description',
          'description', description, this.templateList.agreementTypes);
        this.templateObject.typeCode = typeCode;
        this.getTemplateLatestVersion();
      }));
  }

  setCompleterSearchOptions(contextField, formatString, filterFields, defaultValue, arrayList) {
    this.completerSearchOptions.contextField = contextField;
    this.completerSearchOptions.formatString = formatString;
    this.completerSearchOptions.filterFields = filterFields;
    this.completerSearchOptions.defaultValue = defaultValue;
    this.completerSearchOptions.arrayList = arrayList;
    return JSON.parse(JSON.stringify(this.completerSearchOptions));
  }

  getAgreementTypeList(categoryCode) {
    this.agreementTypeList = this.templateList.agreementTypes.filter(type => (type.categoryCode === categoryCode));
  }

  getAgreementTypeData(event) {
    if (event) {
      this.templateObject.typeCode = event.agreementTypeCode;
      localStorage.setItem('agreementType', JSON.stringify(event));
      this.temporaryAgreement = event;
      this.loadAllTemplates(event.agreementTypeCode, event.description);
    } else {
      localStorage.removeItem('agreementType');
      this.templateObject.typeCode = null;
      this.loadAllTemplates(null, null);
    }
  }

  /**addAttachments -  checks whether all mandatory fields are filled, call service to add attachments */
  addAttachments() {
    if (this.checkMandatoryFilled()) {
      this.setRequestObject();
      this.$subscriptions.push(
        this._templateService.addAgreementTemplate(this.templateAttachments, this.templateObject.typeCode, this.uploadedFile)
          .subscribe((success: any) => {
            this.templateList.agreementTypeTemplates = success.agreementTypeTemplates;
            this.templateObject.description = null;
            this.uploadedFile = [];
            this.getTemplateLatestVersion();
          }));
    }
  }

  getTemplateLatestVersion() {
    if (this.templateList.agreementTypeTemplates && this.templateList.agreementTypeTemplates.length) {
      this.latestVersion = this.templateList.agreementTypeTemplates.reduce((first, second) =>
        first.versionNumber > second.versionNumber ? first : second);
    }
  }

  checkMandatoryFilled() {
    this.map.clear();
    if (!this.templateObject.typeCode) {
      this.map.set('type', 'type');
      this.completerSearchOptions.errorMessage = '* Please select Agreement Type';
    }
    // if (!this.templateObject.description) {
    //   this.map.set('description', '* Please provide a description');
    // }
    if (this.uploadedFile.length === 0) {
      this.map.set('attachment', '* Please choose a document');
    }
    return this.map.size > 0 ? false : true;
  }

  /**setRequestObject - sets request object for adding attachments
  */
  setRequestObject() {
    const tempArrayForAdd = [];
    for (let uploadIndex = 0; uploadIndex < this.uploadedFile.length; uploadIndex++) {
      const tempObjectForAdd: any = {};
      tempObjectForAdd.description = this.templateObject.description;
      tempObjectForAdd.agreementTypeCode = this.templateObject.typeCode;

      tempObjectForAdd.fileName = this.uploadedFile[uploadIndex].name;
      tempObjectForAdd.updateTimestamp = new Date().getTime();
      tempObjectForAdd.updateUser = this._commonService.getCurrentUserDetail('userName');
      tempArrayForAdd[uploadIndex] = tempObjectForAdd;
    }
    this.templateAttachments = tempArrayForAdd;
  }

  deleteFromUploadedFileList(index) {
    this.uploadedFile.splice(index, 1);
    this.warningObj.attachment = null;
  }

  deleteAgreementTemplate(deleteindex) {
    this.$subscriptions.push(this._templateService.deleteTemplate({
      'templateId': this.templateList.agreementTypeTemplates[deleteindex].templateId,
      'agreementTypeCode': this.templateObject.typeCode
    }).subscribe((data: any) => {
      this.templateList.agreementTypeTemplates = data.agreementTypeTemplates;
      this.getTemplateLatestVersion();
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Template deleted successfully.');
    }));
  }

  downloadAgreementTemplate(attachment) {
    this._templateService.downloadAgreementTemplate(attachment.templateId).subscribe(data => {
      if ((window.navigator as any).msSaveOrOpenBlob) {
        (window.navigator as any).msSaveBlob(new Blob([data], { type: attachment.mimeType }), attachment.fileName);
      } else {
        this.createDownloadElement(data, attachment.fileName);
      }
    });
  }

  createDownloadElement(data, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(data);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  documentPreview(item) {
    const previewObject = {
      'agreementRequestId': '1',
      'agreementTypeCode' : item.agreementTypeCode,
      'versionNumber': item.versionNumber
    };
    this._agreementService.previewAgreementDocument(previewObject).subscribe((data: any) => {
      const blob = new window.Blob([data], { type: 'application/pdf' });
      if (blob) {
        const a = document.createElement('a');
        a.target = '_blank';
        a.href = URL.createObjectURL(blob);
        a.click();
      }
    });
  }
}
