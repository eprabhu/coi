import { Component, OnInit, Input } from '@angular/core';
import { CommonService } from '../../../../common/services/common.service';

@Component({
  selector: 'app-general-details-view',
  templateUrl: './general-details-view.component.html',
  styleUrls: ['./general-details-view.component.css']
})
export class GeneralDetailsViewComponent implements OnInit {

  @Input() result: any = {};
  currencyCode: any;
  constructor(public _commonService: CommonService) { }

  ngOnInit() {
    this.currencyCode = this.result.agreementHeader.currencyCode;
  }

}
