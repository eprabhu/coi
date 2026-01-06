import { Component, OnInit, Input } from '@angular/core';
import { CompareDetails } from '../../interfaces';

@Component({
  selector: 'app-other-information',
  template: ` <div id="Award120" class="col-12 card">
                <app-custom-element-compare [customElementDetails] = 'customElementDetails'
                (updateAccordionStatus)= "updateAccordionStatus($event)">
                </app-custom-element-compare>
                <div *ngIf="!isOtherInfoOpen" class="pb-3">
                 <app-comment-box [sectionCode]="120" [awardId]="comparisonDetails.baseAwardId"
                 [awardNumber]="comparisonDetails.awardNumber" [sequenceNumber]="comparisonDetails.sequenceNumber"></app-comment-box>
                </div>
              </div>`,
  styleUrls: ['./other-information.component.css']
})
export class OtherInformationComponent {
  @Input() customElementDetails: any = {};
  @Input() comparisonDetails: CompareDetails;
  isOtherInfoOpen = false;

  constructor() { }

  updateAccordionStatus(event) {
    this.isOtherInfoOpen = event;
  }
}
