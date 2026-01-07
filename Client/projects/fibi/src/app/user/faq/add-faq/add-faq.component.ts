import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { AddFaqService } from './add-faq.service';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { WafAttachmentService } from '../../../common/services/waf-attachment.service';

declare var $: any;

@Component({
  selector: 'app-add-faq',
  templateUrl: './add-faq.component.html',
  styleUrls: ['./add-faq.component.css'],
  providers: [ WafAttachmentService ]
})

export class AddFaqComponent implements OnInit, OnDestroy {

  faqList: any = {
    'categoryCode': null,
    'subCategoryCode': null,
    'question': null,
    'answer': null,
    'url': null,
    'updateTimestamp': null,
    'updateUser': this._commonService.getCurrentUserDetail('userName'),
    'faqAttachment': []
  };
  notificationObject: any;
  faqRequestObject: any = {};
  categoryList: any = [];
  subCategoryList: any = [];
  fileList: any = [];
  uploadedFile: any = [];
  map = new Map();
  $subscriptions: Subscription[] = [];

  @Output() selectedResult = new EventEmitter<boolean>();

  constructor(private _addFaqService: AddFaqService, private _commonService: CommonService,
    private _wafAttachmentService: WafAttachmentService) { }

  ngOnInit() {
    this.getCategoryList(1);
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**
   * @param  {} categoryCode
   * To fetch category list.
   */
  getCategoryList(categoryCode) {
    this.$subscriptions.push(this._addFaqService.getCategory({ 'categoryCode': categoryCode }).subscribe((data: any) => {
      this.categoryList = data;
      document.getElementById('addfaqbtn').click();
    }));
  }

  /**
   * @param  {} index
   * index of currenly selected category
   */
  categorySelect(index) {
    this.subCategoryList = this.categoryList[index - 1].faqSubCategory;
  }

  /**
   * @param  {} files
   * list of attachments added
   */
  addAttachmentFile(files) {
    for (let index = 0; index < files.length; index++) {
      this.uploadedFile.push(files[index]);
    } if (this.fileList == null) {
      this.fileList = [];
      this.prepareFileDetails(files)
    } else {
      this.prepareFileDetails(files)
    }
  }

  deleteAttachmentFile(index) {
    this.fileList.splice(index, 1);
  }

  validationFaq() {
    this.map.clear();
    if (this.faqList.categoryCode === null) {
      this.map.set('checkCategory', 'please select a category');
    }
    // else if (this.subCategoryList.length > 0 && (this.faqList.subCategoryCode === undefined || this.faqList.subCategoryCode === null || this.faqList.subCategoryCode === '')) {
    //   this.map.set('checkSubcategory', 'please select a subcategory');
    // }
    if (this.faqList.question === undefined || this.faqList.question === null || this.faqList.question === '') {
      this.map.set('checkQuestion', 'please provide a question');
    }
    if (this.faqList.answer === undefined || this.faqList.answer === null || this.faqList.answer === '') {
      this.map.set('checkAnswer', 'please provide an answer');
    }
    this.submitFaq();
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
        formData.append('formDataJson', JSON.stringify({ 'faqdtls': this.faqList, 'newFaqAttachment': this.fileList }));
        this.$subscriptions.push(this._addFaqService.saveFaq(formData).subscribe((data: any) => {
          this.submitActions();
        }, err => { },
          () => { $('#add-new-faq').modal('hide'); this.emitFaqFlag();
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
      newFaqAttachment:  this.fileList
    };
    $('#add-new-faq').modal('hide');
    if (this.uploadedFile.length > 0) {
      const data = await this._wafAttachmentService.saveAttachment(requestForWaf, requestSetAtRemaining, this.uploadedFile,
        '/addFaqAttachmentForWaf', 'faq', null );
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
  /**actions to perform in common for both waf enabled or disabled services*/
  submitActions() {
    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'FAQ saved successfully.');
    this.faqList.categoryCode = null;
    this.faqList.subCategoryCode = null;
    this.faqList.question = '';
    this.faqList.answer = '';
    this.faqList.url = '';
    this.fileList.splice(0, this.fileList.length);
  }

  prepareFileDetails(files) {
    this.fileList.push({
      'fileName': files[0].name,
      'mimeType': files[0].type,
      'updateUser': this._commonService.getCurrentUserDetail('userName')
    });
  }

  /**
   * @param  {} selectedResult
   * to reset value of add faq modal trigger flag
   */
  emitFaqFlag() {
    this.selectedResult.emit(false);
  }
}
