import { Component, OnInit, OnDestroy } from '@angular/core';
import { FaqService } from './faq.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { fileDownloader } from '../../common/utilities/custom-utilities';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})

export class FaqComponent implements OnInit, OnDestroy {
  isCollapse: any = [];
  categoryList: any;
  questionsList = [];
  faqRequestObject: any = {};
  categoryName: any;
  showAddFaq = false;
  selectedCategory = 0;
  selectedQuestion = 0;
  faqDetails: any;
  attachmentList: any = [];
  tempQuestionList: any;
  triggerFaq = false;
  searchText;
  $subscriptions: Subscription[] = [];

  constructor(private _faqService: FaqService,
    private _router: Router) { }

  ngOnInit() {
    this.displayFAQ(1, '', true, 0);
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**
   * @param  {} categoryName
   * returns the current category name
   */
  displayFAQ(categoryCode, subCategoryCode, isSelected = false, index) {
    this.selectedCategory = index;
    this.faqRequestObject.categoryCode = categoryCode;
    this.faqRequestObject.subCategoryCode = subCategoryCode;
    this.$subscriptions.push(this._faqService.getFaq(this.faqRequestObject).subscribe((data: any) => {
      if (isSelected) this.categoryList = data.faqCategory;
      this.questionsList = data.faq;
      this.tempQuestionList = this.questionsList;
      this.categoryName = this.categoryList.find(type => type.categoryCode === categoryCode).description;
    }));
  }

  highlightQuestion(index) {
    this.selectedQuestion = index;
  }
  /**
   * @param  {} elementId
   * stores index of question selected from  question list
   * specific faq content is displayed for each question selected
   */
  pageScroll(elementId) {
    const questionIndex = document.getElementById(elementId);
    if (questionIndex) {
      questionIndex.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * @param  {} searchText
   * loads faq according to quesion or answer searched
   */
  loadQuestions(searchText) {
    this.$subscriptions.push(this._faqService.getFaq(searchText).subscribe((data: any) => {
      this.faqDetails = data;
    }));
  }

  /**
   * @param  {} details
   * @param  {} attachmentId
   * to download attachments displayed with faq
   */
  saveAttachment(details, attachmentId) {
    this.$subscriptions.push(this._faqService.getAttachment(attachmentId)
      .subscribe((data: any) => {
        fileDownloader(data, details.fileName);
      },
        error => console.log('Error downloading the file.', error),
        () => { }));
  }

  /**
   * @param  {} searchText
   * question or answer searched is converted to lowercase and compared with faq list
   */
  searchQuestions(searchText) {
    this.tempQuestionList = this.questionsList;
    if (searchText !== '') {
      this.tempQuestionList = this.tempQuestionList.filter(v => {
        return v.question.toLowerCase().includes(searchText.toLowerCase())
          || v.answer.toLowerCase().includes(searchText.toLowerCase());
      });
    } else {
      this.tempQuestionList = this.questionsList;
    }
  }

  /**
   * to reset value of add faq trigger flag
   */
  resetFaqTrigger(event) {
    this.triggerFaq = event;
  }

  redirectUrl(url) {
    url.includes('http') ? window.open(url, '_blank') : window.open('//' + url, '_blank');
  }

}
