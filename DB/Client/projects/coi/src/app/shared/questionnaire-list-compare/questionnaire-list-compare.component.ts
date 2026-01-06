import { Component, Input, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subscription, forkJoin, of, BehaviorSubject } from 'rxjs';
import { QuestionnaireListCompareService } from './questionnaire-list-compare.service';
import { Configuration, ApplicableQuestionnaire, CompareType, QuestionnaireDetail } from './interface';
import { CommonService } from '../../common/services/common.service';
import {subscriptionHandler} from "../../../../../fibi/src/app/common/utilities/subscription-handler";
import {compareArray} from "../../../../../fibi/src/app/common/utilities/array-compare";


/**
 * Written By Mahesh Sreenath V M
 * This compares the data between two list of applicable questionnaire and combines the
 * two list. this can be even of different modules. The comparison of the list is done
 * using questionnaire Number.The other fields compared are questionnaireId this is to check
 * for versioning within questionnaire. And labels are also compared. No need provide the compare
 * fields as input its jus added as an extra feature if we need in future.
 * The modules that need to be compared has to be given as input. same as other comparison modules
 * the variable name prefixed with base and current are fro baseAward and currentAward respectively.
 * see the interface for the details of variable passed and it's type. we compare the questionnaire list
 * only if base and current details are given as input otherwise only base is loaded.
 * for just viewing a the details of a module you can pass the input config with values assigned to base variables
 * for now only applicable questionnaire list is cached. the details of questionnaire are not cached.
 * As of changing the way we code instead of passing values as input I have used observable as input
 * and events are triggered with next() instead of depending on angular ngOnChanges().This is much fun
 * isShowAccordion is used to configure expand/collapse accordion which is visible(true) by default
 */

@Component({
  selector: 'app-questionnaire-list-compare',
  templateUrl: './questionnaire-list-compare.component.html',
  styleUrls: ['./questionnaire-list-compare.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [QuestionnaireListCompareService]
})
export class QuestionnaireListCompareComponent implements OnChanges, OnDestroy {

  @Input() configuration: Configuration = {
    baseModuleItemCode: 1,
    baseSubitemCodes: [],
    baseModuleItemKey: '',
    baseModuleSubItemKey: '',
    currentModuleItemCode: 1,
    currentModuleItemKey: '',
    currentSubItemCodes: [],
    currentModuleSubItemKey: '',
    currentQuestionnaireMode: null,
    baseQuestionnaireMode: null,
    actionUserId: this._commonService.getCurrentUserDetail('personID'),
    actionPersonName: this._commonService.getCurrentUserDetail('userName'),
  };
  @Input() compareDetails: CompareType = {
    reviewSectionSubFields: ['QUESTIONNAIRE_LABEL', 'QUESTIONNAIRE_ID',
      'QUESTIONNAIRE_ANS_HEADER_ID', 'QUESTIONNAIRE',
      'NEW_QUESTIONNAIRE_LABEL'],
    reviewSectionUniqueFields: ['QUESTIONNAIRE_NUMBER', 'MODULE_ITEM_CODE', 'MODULE_SUB_ITEM_CODE']
  };
  @Input() isShowAccordion: any = true;
  overViewDataCache = {};
  requestObject: ApplicableQuestionnaire = {
    moduleItemCode: null,
    moduleSubItemCode: null,
    questionnaireMode: null,
    moduleSubItemKey: '',
    moduleItemKey: '',
    actionUserId: '',
    actionPersonName: ''
  };
  isViewMode: boolean;
  questionnaireList: any = [];
  activeQuestionnaire: any = {};
  questionnaireDetails = new BehaviorSubject<QuestionnaireDetail>({
    baseQuestionnaire: {},
    currentQuestionnaire: {},
    configuration: {},
    moduleItemKeyList: {},
    baseQuestionnaireHeader: {},
    currentQuestionnaireHeader: {}
  });
  selectedIndex: number = null;
  tempSelectedIndex: number;
  questionnaireSubscriptionList: Array<any> = [];
  questionnaireListCache = {};
  $subscriptions: Subscription[] = [];
  isQuestionnaireOpen = false;
  @Output() updateAccordionStatus: EventEmitter<any> = new EventEmitter<any>();
  @Output() currentActiveQuestionnaire: EventEmitter<any> = new EventEmitter<any>();
  moduleItemKeyList: any = {};

  constructor(private _questionnaireListService: QuestionnaireListCompareService,
    private _CDRef: ChangeDetectorRef, public _commonService: CommonService) { }

  ngOnChanges() {
    if (this.configuration.baseModuleItemKey) {
      this.selectedIndex = null;
      (this.configuration.baseModuleItemKey && this.configuration.currentModuleItemKey) ?
        this.compareQuestionnaire() : this.viewQuestionnaires();
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**
   * @returns void
   * compare the data actually it fetches the data for comparison.
   * Since wee need two different award version data to compare. promise.all is used so that
   * we trigger the compare function once both version data has been loaded.
   * This also updates the data to the cache so that the next time we can
   * reuse the same data instead of making a DB call. improves performance
   * since the function can be triggered on ng model change the first questionnaire should be set as the active one
   * so there is a null checking for selected index to assign the 0'th element as the selected one.
   */
  compareQuestionnaire(): void {
    this.moduleItemKeyList = {};
    Promise.all([this.loadAllQuestionnaires('base'), this.loadAllQuestionnaires('current')])
      .then((values: Array<any>) => {
        this.compareQuestionnaireList(values[0], values[1]);
      });
  }
  /**
   * @returns void
   * fetches teh data for view questionnaire for the given base awardId
   * This also updates the data to the cache so that the next time we can
   * reuse the same data instead of making a DB call. improves performance
   * since the function can be triggered on ng model change the first questionnaire should be set as the active one
   * so there is a null checking for selected index to assign the 0'th element as the selected one.
   */
  viewQuestionnaires() {
    this.moduleItemKeyList = {};
    this.loadAllQuestionnaires('base').then((questionnaireList: Array<any>) => {
      this.questionnaireList = questionnaireList;
      if (this.selectedIndex === null) {
        this.setCurrentSelectedIndex(0);
        if (this.questionnaireList.length) {
          this.activeQuestionnaire = this.questionnaireList[0];
        }
      }
      this.loadQuestionnaireDetails('view');
      this._CDRef.markForCheck();
    });
  }

  compareQuestionnaireList(base: Array<any>, current: Array<any>) {
    const questionnaireList = compareArray(base, current,
      this.compareDetails.reviewSectionUniqueFields,
      this.compareDetails.reviewSectionSubFields);
    this.questionnaireList = this.setComparedValuesToList(questionnaireList);
    if (this.selectedIndex === null) {
      this.setCurrentSelectedIndex(0);
      if (this.questionnaireList.length) {
        this.activeQuestionnaire = this.questionnaireList[0];
      }
    }
    this.loadQuestionnaireDetails('compare');
    this._CDRef.markForCheck();
  }
  /**
   * this function works as the core one to split the values from the list comparison and
   * set correct questionnaireId and AnswerHeader ID from the compared out put and set them to respective variables
   * questionnaire.baseAnswerHeaderId = answerHeaderId[0];
   * questionnaire.baseQuestionnaireId = questionnaireId[0]
   * questionnaire.currentAnswerHeaderId = answerHeaderId[1];
   * questionnaire.currentQuestionnaireId = questionnaireId[1];
   * these values are used while fetching the the details of each questionnaire. we need to map the value to these
   * variables because while comparing answerHeaderID and QuestionnaireID they can be different for different award version
   * so the o=compared out put will be HTML tag enclosed values(if there is change). so we split and assign them to usable format and
   * meaningful variables.
   */
  setComparedValuesToList(questionnaireList: Array<any>) {
    questionnaireList.map(questionnaire => {
      const answerHeaderId = this.convertToValues(questionnaire.QUESTIONNAIRE_ANS_HEADER_ID);
      const questionnaireId = this.convertToValues(questionnaire.QUESTIONNAIRE_ID);
      questionnaire.baseAnswerHeaderId = answerHeaderId[0];
      questionnaire.baseQuestionnaireId = questionnaireId[0];
      questionnaire.currentAnswerHeaderId = answerHeaderId[1];
      questionnaire.currentQuestionnaireId = questionnaireId[1];
    });
    return questionnaireList;
  }
  /**
   * return a array list where the first element will the value of base and second will ve value of current
   * this work on the principle that while comparing the questionnaireId and answerHeaderId it will return
   * if current is changed - <ins>base</ins> <del>current</del>
   * if no changes then - base
   * if there is change base will be always enclose in a del tag so of the logic of string compare changes then
   * make sure we change here
   */
  convertToValues(value: number | string) {
      value = value.toString();
      return !value.includes('<') ? [value, value] : [this.extractValueFromTag(value, 'ins'), this.extractValueFromTag(value, 'del')];
  }
  /**
   * Extract the value between tag and returns the value otherwise null is returned
   */
  extractValueFromTag(value: string, tag: string) {
    return tag === 'ins' ? value.match(/<ins>(.*?)<\/ins>/i) ? value.match(/<ins>(.*?)<\/ins>/i)[1] : null
      : value.match(/<del>(.*?)<\/del>/i) ? value.match(/<del>(.*?)<\/del>/i)[1] : null;
  }

  /**
   * clears the current questionnaireList and fetches data for each sub module code. since there
   * is chance to combine multiple sub modules for a given module
   */
   loadAllQuestionnaires(type) {
    return new Promise((resolve, reject) => {
      this.questionnaireSubscriptionList = [];
      const subItemCodes: any = this.getSubItemCodes(type);
      subItemCodes.forEach((subItemCode) => this.setRequestObject(subItemCode, type));
      return this.$subscriptions.push(
        forkJoin(...this.questionnaireSubscriptionList).subscribe(data => {
          let applicableQuestionnaires = [];
          data.forEach((d: any) =>
            applicableQuestionnaires = this.combineQuestionnaireList(applicableQuestionnaires, d.applicableQuestionnaire));
          resolve(applicableQuestionnaires);
        }));
    });
  }

  getSubItemCodes(type: string) {
    return type === 'base' ? this.configuration.baseSubitemCodes : this.configuration.currentSubItemCodes;
  }

  getModuleItemCode(type: string) {
    return type === 'base' ? this.configuration.baseModuleItemCode : this.configuration.currentModuleItemCode;
  }

  getModuleItemKey(type: string) {
    return type === 'base' ? this.configuration.baseModuleItemKey : this.configuration.currentModuleItemKey;
  }

  getModuleSubItemKey(type: string) {
    return type === 'base' ? this.configuration.baseModuleSubItemKey : this.configuration.currentModuleSubItemKey;
  }

  setRequestObject(subItemCode: number, type: string) {
    this.requestObject.moduleItemCode = this.getModuleItemCode(type);
    this.requestObject.moduleSubItemCode = subItemCode;
    this.requestObject.moduleItemKey = this.getModuleItemKey(type);
    this.requestObject.moduleSubItemKey = this.getModuleSubItemKey(type);
    this.requestObject.questionnaireMode = this.getAnsweredOnlyMode();
    this.requestObject.actionPersonName = this.configuration.actionPersonName;
    this.requestObject.actionUserId = this.configuration.actionUserId;
    this.moduleItemKeyList[type] = this.requestObject.moduleItemKey;
    this.questionnaireSubscriptionList.push(this.getApplicableQuestionnaire(this.requestObject));
  }

  /**As of our discusiion all view mode will work on answered mode. Since the Compariosn is always on the view mode
   * 'ANSWERED mode is return by default.
   */
  getAnsweredOnlyMode(): string {
		return 'ANSWERED';
	}


  getApplicableQuestionnaire(requestObject: ApplicableQuestionnaire) {
    requestObject = JSON.parse(JSON.stringify(requestObject));
    return this._questionnaireListService.getApplicableQuestionnaire(requestObject);
  }

  combineQuestionnaireList(currentList: Array<any>, newList: Array<any>) {
    return [...currentList, ...newList];
  }

  /**
  * openQuestionnaire - updates the value of currently active questionnaire in activeQuestionnaire
  * @param index
  */
  openQuestionnaire(index: number) {
    this.setCurrentSelectedIndex(index);
    if (this.questionnaireList.length) {
      this.activeQuestionnaire = this.questionnaireList[index];
      this.currentActiveQuestionnaire.emit(this.activeQuestionnaire);
      (this.configuration.baseModuleItemKey && this.configuration.currentModuleItemKey) ?
        this.compareQuestionnaire() : this.viewQuestionnaires();
    }
  }

  setCurrentSelectedIndex(index) {
    this.selectedIndex = index;
  }

  getQuestionnaire(questionnaireId: number, questionnaireAnswerHeaderId: number) {
    return this._questionnaireListService.getQuestionnaire({ questionnaireId, questionnaireAnswerHeaderId });
  }

  /**
   * @param type loads the details of the questionnaire
   * only one questionnaire is needed if view mode. otherwise we need to compare two different questionnaires.
   * so the list here will be created based on that then simply we pass the details to the child component.
   */
  loadQuestionnaireDetails(type: string) {
    let list = [];
    const configuration: any = {
      'moduleCode' : this.activeQuestionnaire.MODULE_ITEM_CODE,
      'submoduleCode' : this.activeQuestionnaire.MODULE_SUB_ITEM_CODE,
      'moduleItemKey' : '',
      'subModuleItemKey' : this.activeQuestionnaire.MODULE_SUB_ITEM_KEY
    };
    if (type === 'view' || this.checkForChange()) {
      list = [this.getQuestionnaire(this.activeQuestionnaire.QUESTIONNAIRE_ID,
        this.activeQuestionnaire.QUESTIONNAIRE_ANS_HEADER_ID)];
    } else {
      list = [this.getQuestionnaire(this.activeQuestionnaire.baseQuestionnaireId,
        this.activeQuestionnaire.baseAnswerHeaderId),
      this.getQuestionnaire(this.activeQuestionnaire.currentQuestionnaireId,
        this.activeQuestionnaire.currentAnswerHeaderId)];
    }
    this.$subscriptions.push(forkJoin(list).subscribe((values: Array<any>) => {
      const questionnaireDetail: any = {};
      questionnaireDetail.baseQuestionnaire = values[0].questionnaire || {};
      questionnaireDetail.currentQuestionnaire = values[1] && values[1].questionnaire || {};
      questionnaireDetail.configuration = configuration;
      questionnaireDetail.moduleItemKeyList = this.moduleItemKeyList;
      questionnaireDetail.baseQuestionnaireHeader = values[0].header || {};
      questionnaireDetail.currentQuestionnaireHeader = values[1] && values[1].header || {};
      this.questionnaireDetails.next(questionnaireDetail);
      this._CDRef.markForCheck();
    }));
  }
  /**
   * developer note make a comparison function here even if the mode is compare if both questionnaireId and answerHeaderId
   * is same then no need to compare add the code here and use at loadQuestionnaireDetails(type: string)
   */
  checkForChange() {
    return (this.activeQuestionnaire.baseQuestionnaireId === this.activeQuestionnaire.currentQuestionnaireId &&
      this.activeQuestionnaire.baseAnswerHeaderId === this.activeQuestionnaire.currentAnswerHeaderId) ? true : false;
  }

  /**
   * updateThe accordion Flag and emit the result to the parent component
   */
  updateIsShowAccordion() {
    this.isQuestionnaireOpen = !this.isQuestionnaireOpen;
    this.updateAccordionStatus.emit(this.isQuestionnaireOpen);
  }
}
