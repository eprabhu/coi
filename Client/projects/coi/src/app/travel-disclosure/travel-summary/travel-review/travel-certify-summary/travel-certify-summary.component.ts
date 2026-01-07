import { Component, OnInit } from '@angular/core';
import { TravelDisclosureService } from '../../../services/travel-disclosure.service';

@Component({
  selector: 'app-travel-certify-summary',
  templateUrl: './travel-certify-summary.component.html',
  styleUrls: ['./travel-certify-summary.component.scss']
})
export class TravelCertifySummaryComponent implements OnInit {

  constructor(public travelService: TravelDisclosureService) { }

  ngOnInit() {
  }

}
