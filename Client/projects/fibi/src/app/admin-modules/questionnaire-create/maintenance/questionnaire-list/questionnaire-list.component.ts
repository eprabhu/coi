import { Component, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
/**
 * developer note: view mode and versioning is set on query params from here
 * since it was visible to user and user could change that easily It is combined into a
 * single query param and the prams definition is like this;
 * first Character - isViewMode F-false T -true
 * second Character - isVersioning F- false T-true
 * rest of the character is questionID
 */
@Component({
  selector: 'app-questionnaire-list',
  templateUrl: './questionnaire-list.component.html',
  styleUrls: ['./questionnaire-list.component.css'],
})
export class QuestionnaireListComponent implements OnDestroy {

  @Input() questionnaireList: Array<any> = [];
  @Output() updateStatusEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() openQuestionnaireEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() copyQuestionnaireEvent: EventEmitter<number> = new EventEmitter<number>();

  selectedQuestionId: number;
  copyQuestionnaireId: number;
  $subscriptions: Subscription[] = [];
  isReverse: any;
  column = '';
  direction = 1;

  constructor( ) { }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  copyQuestionnaire(questionnaireId) {
    this.copyQuestionnaireEvent.emit(questionnaireId);
  }

  updateQuestionnaireStatus(index: number, questionId: number, status: string , listType: string) {
    this.updateStatusEvent.emit({index, questionId, status, listType});
  }

  openQuestionnaire(questionnaireId: number, answerCount = 0, viewMode = 'T', version = 'F') {
    this.openQuestionnaireEvent.emit({questionnaireId, answerCount, viewMode, version});
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
}
