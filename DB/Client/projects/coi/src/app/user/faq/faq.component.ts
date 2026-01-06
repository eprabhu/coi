import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { faqService } from './faq.service';
import { deepCloneObject, fileDownloader } from '../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { fadeInOutHeight } from '../../common/utilities/animations';
import { CommonService } from '../../common/services/common.service';
import { APPLICATION_ADMINISTRATOR_RIGHT, COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS } from '../../app-constants';

declare const $: any;

@Component({
    selector: 'app-faq',
    templateUrl: './faq.component.html',
    styleUrls: ['./faq.component.scss'],
    animations: [fadeInOutHeight]
})

export class FaqComponent implements OnInit, OnDestroy {

    buttonName: any;
    tempQuestionList: any = [];
    questionsList = [];
    triggerFaq = false;
    isCollapse: any = [];
    selectedQuestion = 0;
    searchText;
    faqDetails: any;
    categoryList: any;
    categoryName: any;
    selectedCategory = 0;
    faqRequestObject: any = {};
    $subscriptions: Subscription[] = [];
    question: any;
    answer: any;
    allQuestionData: any;
    editIndex: any;
    tempQuestion: any;
    questionIndex: any;
    isCollapsed: any;
    faqData: [];
    trigger = 0;
    canModifyFAQ = false;
    highlightTimeout: ReturnType<typeof setTimeout> | null = null;

    constructor(private _faqService: faqService, private _commonService: CommonService) { }

    ngOnInit() {
        this.displayFAQ(14, '');
        this.selectedQuestion = null;
        this.canModifyFAQ = this._commonService.getAvailableRight(APPLICATION_ADMINISTRATOR_RIGHT);
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }


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
     * @param  {} categoryName
     * returns the current category name
     */
    displayFAQ(categoryCode: string | number, subCategoryCode: string | number): void {
        this.toggleCollapse(categoryCode);
        if (this.faqRequestObject.categoryCode !== categoryCode) {
            this.questionsList = [];
            this.faqRequestObject.categoryCode = categoryCode;
            this.faqRequestObject.subCategoryCode = subCategoryCode;
            this.$subscriptions.push(this._faqService.getFaq(this.faqRequestObject).subscribe((data: any) => {
                this.faqData = data;
                this.categoryList = data.faqCategory;
                this.questionsList = data.faq;
                this.tempQuestionList = this.questionsList.reverse();
                this._faqService.faqList = this.tempQuestionList;
                this.categoryName = this.categoryList.find(type => type.categoryCode === categoryCode).description;
            }, (error: any) => {
                this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            }));
        }
    }

    redirectUrl(url) {
        url.includes('http') ? window.open(url, '_blank') : window.open('//' + url, '_blank');
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
     * @param  {} elementId
     * stores index of question selected from  question list
     * specific faq content is displayed for each question selected
     */
    pageScroll(elementId) {
        const questionIndex = document.getElementById(elementId);
        if (questionIndex) {
            questionIndex.scrollIntoView({ behavior: 'smooth' , block: 'center'});
        }
    }
    /**
     * to reset value of add faq trigger flag
     */
    resetFaqTrigger(event) {
        this.triggerFaq = event;
    }

    highlightQuestion(index: number) {
        this.selectedQuestion = index;
        // Clear any existing timeout before setting a new one
        if (this.highlightTimeout) {
            clearTimeout(this.highlightTimeout);
        }
        this.highlightTimeout = setTimeout(() => {
            this.selectedQuestion = null;
            this.highlightTimeout = null; // reset reference
        }, 2000);
    }

    /**
     * @param  {} searchText
     * loads faq according to quesion or answer searched
     */

    // Used for editing
    editdata(data, index) {
        this.buttonName = 'Update';
        this.editIndex = index;
        this.allQuestionData = deepCloneObject(data);
         this.questionIndex = index;
        $('#add-new-faq').modal('show');
    }
    // passing the data from the child(add-faq) to parent(faq)
    updatedata(event) {
        this.tempQuestionList.push(event);
    }

    addNewQuestion() {
        this.buttonName = 'Add Questions';
        this.allQuestionData = [];
        document.getElementById('addfaqbtn')?.click();
    }

    // function is to updating the current data with the updata
    updatedData(updatedFaq) {
        this.tempQuestionList[this.questionIndex].question = updatedFaq[0].question;
        this.tempQuestionList[this.questionIndex].answer = updatedFaq[0].answer;
        this.tempQuestionList[this.questionIndex].url = updatedFaq[0].url;
    }

    toggleCollapse(categoryCode: number | string): void {
        const isOldCollapseValue = this.isCollapse[categoryCode];
        this.isCollapse = [];
        this.isCollapse[categoryCode] = !isOldCollapseValue;
    }

}
