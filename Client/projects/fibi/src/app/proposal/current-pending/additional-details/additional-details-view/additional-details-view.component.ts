/**
 * Author: Aravind P S
 * Component for displaying additional details
 */
import { Component, Input } from '@angular/core';
import { CommonService } from '../../../../common/services/common.service';

@Component({
  selector: 'app-additional-details-view',
  templateUrl: './additional-details-view.component.html',
  styleUrls: ['./additional-details-view.component.css']
})
export class AdditionalDetailsViewComponent {
  @Input() moduleDetails: any = {};

  constructor(public _commonService: CommonService) { }
}
