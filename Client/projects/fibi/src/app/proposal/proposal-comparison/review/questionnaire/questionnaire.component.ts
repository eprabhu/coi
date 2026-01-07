import { Component, OnInit, Input  } from '@angular/core';

@Component({
  selector: 'app-questionnaire',
  template: `<div id="Proposal312" class="col-12 card mt-3">
              <app-questionnaire-list-compare [configuration]="configuration"
              (updateAccordionStatus)= "updateAccordionStatus($event)"></app-questionnaire-list-compare>
              </div>`,
  styleUrls: ['./questionnaire.component.css']
})
export class QuestionnaireComponent implements OnInit {
  @Input() configuration: any = {};
  isQuestionnaireOpen = false;
  constructor() { }

  ngOnInit() {
  }

  updateAccordionStatus(event) {
    this.isQuestionnaireOpen = event;
   }
}
