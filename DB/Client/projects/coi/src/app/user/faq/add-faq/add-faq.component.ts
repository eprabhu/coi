import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';
import { Subscription } from 'rxjs';
import { WafAttachmentService } from '../../../common/services/waf-attachment.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { AddFaqService } from './add-faq.service';
import { faqService } from '../faq.service';

declare var $: any;

@Component({
  selector: 'app-add-faq',
  templateUrl: './add-faq.component.html',
  styleUrls: ['./add-faq.component.scss']
})
export class AddFaqComponent implements OnInit, OnChanges {

  @Input() questiondata: any; //get all the info about the questions
  @Input() editIndex: any;
  @Input() buttonName: any;
  faqList: any = {
    'categoryCode': null,
    'subCategoryCode': null,
    'question': null,
    'answer': null,
    'url': null,
    'updateTimestamp': null,
    'updateUser': this._commonService.getCurrentUserDetail('userName'),
    'faqAttachment': [],
    'questionId': null
  };

  map = new Map();
  uploadedFile: any = [];
  $subscriptions: Subscription[] = [];
  fileList: any = [];
  categoryList: any = [];
  subCategoryList = [];
  questionindex: any;
  faqId: any;
  modal: any;
  @Output() selectedResult = new EventEmitter<boolean>();
  @Output() newdata = new EventEmitter();
  @Output() updatedData = new EventEmitter();
  // updatedData: any;

  constructor(
    private _commonService: CommonService,
    private _addFaqService: AddFaqService,
    private _wafAttachmentService: WafAttachmentService,
    private _faqservice: faqService
  ) { }

  ngOnInit() {
    this.getCategoryList(1);
  }

  setModalValues(): void {
    if (this.questiondata) {
      this.faqList.answer = this.questiondata.answer;
      this.faqList.question = this.questiondata.question;
      this.faqList.categoryCode = this.questiondata.categoryCode || null;
      this.faqList.url = this.questiondata.url,
      this.faqList.questionId = this.questiondata.questionId;
    }

  }

  ngOnChanges() {
    this.setModalValues();
  }

  /**
   * @param  {} categoryCode
   * To fetch category list.
   */
  getCategoryList(categoryCode) {
    this.$subscriptions.push(this._addFaqService.getCategory({ 'categoryCode': categoryCode }).subscribe((data: any) => {
      this.categoryList = data;
    }));
  }

  emitFaqFlag() {
    this.selectedResult.emit(false);

  }

  validationFaq() {
    this.map.clear();
    if (!this.faqList.categoryCode) {
      this.map.set('checkCategory', 'please select a category');
    }

    if (!this.faqList.question || this.faqList.question === '') {
      this.map.set('checkQuestion', 'please provide a question');
    }
    if (!this.faqList.answer || this.faqList.answer === '') {
      this.map.set('checkAnswer', 'please provide an answer');
    }
    this.functionSelection();
    this.editIndex = -1;

  }

  /**
  * @param faqList
  * object containing faq details to be submitted
  * @param fileList
  * array of attachment files
  */
  submitFaq() {
    if (this.map.size < 1) {
      this.faqList.categoryCode = parseInt(this.faqList.categoryCode, 10);
      if (!this._commonService.isWafEnabled) {
        const formData = new FormData();
        for (const file of this.uploadedFile) {
          formData.append('files', file, file.name);
        }
        formData.append('formDataJson', JSON.stringify({ 'faqdtls': this.faqList, 'newFaqAttachment': this.fileList, }));
        this.$subscriptions.push(this._addFaqService.saveFaq(formData).subscribe((data: any) => {
          this._faqservice.faqList.unshift(data.faqdtls);
          this.newdata.emit('Data Faqdtls:  ' + data.faqdtls);
          this.submitActions();
          this.modal = 'modal';
        }, err => { },
          () => {
            $('#add-new-faq').modal('hide'); this.emitFaqFlag();
          }));
      } else {
        this.submitFaqWaf();
      }
    }
  }

  /** If there are attachment, calls the 'saveAttachment' function with parameters in waf service for splitting attachment,returns data.
  * Otherwise calls saveWafRequest function in wafAttachmentService*/
  async submitFaqWaf() {
    const requestForWaf: any = {
      faqdtls: this.faqList,
      personId: this._commonService.getCurrentUserDetail('personID'),
    };
    const requestSetAtRemaining = {
      newFaqAttachment: this.fileList
    };
    $('#add-new-faq').modal('hide');
    if (this.uploadedFile.length > 0) {
      const data = await this._wafAttachmentService.saveAttachment(requestForWaf, requestSetAtRemaining, this.uploadedFile,
        '/addFaqAttachmentForWaf', 'faq', null);
      this.checkFaqSaved(data);
    } else {
      requestForWaf.newFaqAttachment = this.fileList;
      this._wafAttachmentService.saveWafRequest(requestForWaf, '/addFaqAttachmentForWaf').then((data: any) => {
        this.checkFaqSaved(data);
      }).catch(error => {
        this.checkFaqSaved(error);
      });
    }
  }

  /**
  * @param  {} data
  * if data doesn't contains error, saves faq details, otherwise shows error toast
  */
  checkFaqSaved(data) {
    if (data && !data.error) {
      this.submitActions();
      this.emitFaqFlag();
    } else {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Waf blocked request for saving faq');
    }
  }

  submitActions() {
    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'FAQ saved successfully.');
    this.faqList.categoryCode = null;
    this.faqList.subCategoryCode = null;
    this.faqList.question = '';
    this.faqList.answer = '';
    this.faqList.url = '';
    this.fileList.splice(0, this.fileList.length);
  }

  categorySelect(index) {
    this.subCategoryList = this.categoryList[index - 1].faqSubCategory;
  }

  addAttachmentFile(files) {
    for (let index = 0; index < files.length; index++) {
      this.uploadedFile.push(files[index]);
    } if (this.fileList == null) {
      this.fileList = [];
      this.prepareFileDetails(files);
    } else {
      this.prepareFileDetails(files);
    }
  }

  deleteAttachmentFile(index) {
    this.fileList.splice(index, 1);
  }

  prepareFileDetails(files) {
    this.fileList.push({
      'fileName': files[0].name,
      'mimeType': files[0].type,
      'updateUser': this._commonService.getCurrentUserDetail('userName')
    });
  }
  // clearing the input field
  clearinputfield() {
    this.faqList = {
      'categoryCode': null,
      'subCategoryCode': null,
      'question': null,
      'answer': null,
      'url': null,
      'updateTimestamp': null,
      'updateUser': null,
      'faqAttachment': null,
      'questionId': null
    };
  }

  functionSelection() {
    // Updating the question
    if (this.buttonName == 'Update') {
      this.updatequestions();
    } else {
      this.submitFaq();
    }
  }
  // Question Updation
  updatequestions() {
    const REQ_BODY = { 'faq': [this.faqList] }; // Payload
    this.$subscriptions.push(this._addFaqService.savequestion(REQ_BODY).subscribe((data: any) => {
      const UPDATED_QUESTION_AND_ANSWER = [{
        question: data.faqdtls.question,
        answer: data.faqdtls.answer,
        url: data.faqdtls.url,
      }];
      this.updatedData.emit(UPDATED_QUESTION_AND_ANSWER);
      this.clearinputfield();
      this.editSubmitAction();
      $('#add-new-faq').modal('hide');
    }));

  }

  editSubmitAction() {
    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'FAQ Edited successfully.');
  }


}
