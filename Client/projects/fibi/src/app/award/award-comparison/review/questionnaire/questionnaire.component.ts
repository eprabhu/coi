import { Component, OnInit, Input } from '@angular/core';
import { CompareDetails } from '../../interfaces';

@Component({
  selector: 'app-questionnaire',
  template: `<div id="Award124" class="col-12 card mt-3">
              <app-questionnaire-list-compare [configuration]="configuration"
              (updateAccordionStatus)= "updateAccordionStatus($event)"></app-questionnaire-list-compare>
              <div *ngIf="!isQuestionnaireOpen" class="pb-3">
                 <app-comment-box [sectionCode]="124" [awardId]="comparisonDetails.baseAwardId"
                 [awardNumber]="comparisonDetails.awardNumber" [sequenceNumber]="comparisonDetails.sequenceNumber"></app-comment-box>
              </div>
             </div>`,
  styleUrls: ['./questionnaire.component.css']
})
export class QuestionnaireComponent {
  @Input() configuration: any = {};
  @Input() comparisonDetails: CompareDetails;
  isQuestionnaireOpen = false;

  constructor() { }

  updateAccordionStatus(event) {
    this.isQuestionnaireOpen = event;
   }
}
