import { Component, OnInit, Input  } from '@angular/core';

@Component({
  selector: 'app-other-information-proposal',
  template: ` <div id="Proposal306" class="col-12 card">
                <app-custom-element-compare [customElementDetails] = 'customElementDetails'
                (updateAccordionStatus)= "updateAccordionStatus($event)">
                </app-custom-element-compare>
              </div>`,
  styleUrls: ['./other-information.component.css']
})
export class OtherInformationComponent implements OnInit {
  @Input() customElementDetails: any = {};
  isOtherInfoOpen = false;

  constructor() { }

  ngOnInit() {}

  updateAccordionStatus(event) {
    this.isOtherInfoOpen = event;
  }

}
