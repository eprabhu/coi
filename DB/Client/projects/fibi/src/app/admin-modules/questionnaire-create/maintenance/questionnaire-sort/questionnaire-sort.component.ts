import { Component, Input, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CreateQuestionnaireService, setCompleterOptions } from '../../services/create.service';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';

@Component({
  selector: 'app-questionnaire-sort',
  templateUrl: './questionnaire-sort.component.html',
  styleUrls: ['./questionnaire-sort.component.css']
})
export class QuestionnaireSortComponent implements OnInit, OnDestroy {
  @Input() questionnaireList: Array<any> = [];
  @Input() moduleList: Array<any> = [];
  @Output() updateStatusEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() getQuestionnaireListEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() openQuestionnaireEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() copyQuestionnaireEvent: EventEmitter<number> = new EventEmitter<number>();

  selectedQuestionId: number;
  copyQuestionnaireId: number;
  completerModuleOptions: any = {};
  completerSubModuleOptions: any = {};
  requestObject = {
    'moduleItemCode': 3,
    'moduleSubItemCode': 0
  };
  deBounceTimer: any;
  isReverse: any;
  column = '';
  direction = 1;
  $subscriptions: Subscription[] = [];

  constructor( private _createQuestionnaireService: CreateQuestionnaireService ) { }

  ngOnInit() {
    this.completerModuleOptions = setCompleterOptions(this.moduleList, 'DESCRIPTION', 'DESCRIPTION', 'DESCRIPTION');
    this.completerModuleOptions.defaultValue = this.moduleList.length ? this.moduleList[2].DESCRIPTION : '';
    this.completerSubModuleOptions = setCompleterOptions(this.moduleList.length ? this.moduleList[2].subModules : [], 'DESCRIPTION', 'DESCRIPTION', 'DESCRIPTION');
    this.getQuestionnaireList();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  copyQuestionnaire(questionnaireId) {
    this.copyQuestionnaireEvent.emit(questionnaireId);
  }

  updateQuestionnaireStatus(index: number, questionId: number, status: string, listType: string) {
    this.updateStatusEvent.emit({index, questionId, status, listType});
  }

  openQuestionnaire(questionnaireId: number, answerCount = 0, viewMode = 'T', version = 'F') {
    this.openQuestionnaireEvent.emit({questionnaireId, answerCount, viewMode, version});
  }

  selectModule(event) {
    this.requestObject.moduleItemCode = event && event.MODULE_CODE || null;
    this.requestObject.moduleSubItemCode = 0;
    const SUBMODULELIST = (event && event.subModules) ? event.subModules.filter(item => item.IS_ACTIVE === 'Y') : [];
    this.completerSubModuleOptions = setCompleterOptions(SUBMODULELIST, 'DESCRIPTION', 'DESCRIPTION', 'DESCRIPTION');
  }
  selectSubModule(event) {
    this.requestObject.moduleSubItemCode = event && event.SUB_MODULE_CODE || 0;
  }

  changeSortOrder(index, type) {
    const nextValue = type === 'positive' ? index - 1 : index + 1;
    const evaluationOrder = this.questionnaireList[index].SORT_ORDER;
    this.questionnaireList[index].SORT_ORDER = this.questionnaireList[nextValue].SORT_ORDER;
    this.questionnaireList[nextValue].SORT_ORDER = evaluationOrder;
    [this.questionnaireList[index], this.questionnaireList[nextValue]] = [this.questionnaireList[nextValue], this.questionnaireList[index]];
    this.updateQuestionnaireSortOrder();
  }

  updateQuestionnaireSortOrder() {
    clearTimeout(this.deBounceTimer);
    this.deBounceTimer = setTimeout(() => {
    this.$subscriptions.push(this._createQuestionnaireService.updateQuestionnaireSortOrder(this.getUpdateRequestObject()
      )
      .subscribe((data: any) => this.questionnaireList = data.questionnaireList));
    }, 1000);
  }
  getQuestionnaireList() {
    this.getQuestionnaireListEvent.emit(this.requestObject);
  }

   /**
   * @param  {} property table which has to be sorted
   * the function sorts the table elements using the orderBy pipe
   */
  sortBy(property) {
    this.isReverse = !this.isReverse;
    this.column = property;
    this.direction = this.isReverse ? 1 : -1;
  }

  getUpdateRequestObject() {
    const REQUEST_OBJECT = {
          moduleItemCode: this.requestObject.moduleItemCode,
          moduleSubItemCode: this.requestObject.moduleSubItemCode,
          questionnaireList: this.questionnaireList};
    return REQUEST_OBJECT;
  }
}
