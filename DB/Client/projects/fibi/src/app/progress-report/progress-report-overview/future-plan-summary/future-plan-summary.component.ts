/**
   * sectionType = S (Summary of Progress)
   * sectionType = F (Future Plans)
   */
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CommonDataService } from './../../services/common-data.service';
import { ProgressReportService } from './../../services/progress-report.service';
import { CommonService } from './../../../common/services/common.service';
import { AutoSaveService } from '../../../common/services/auto-save.service';

@Component({
    selector: 'app-future-plan-summary',
    templateUrl: './future-plan-summary.component.html',
    styleUrls: ['./future-plan-summary.component.css']
})
export class FuturePlanSummaryComponent {

    @Input() futurePlansNSummaryData: any = [];
    @Input() isEditMode: boolean;
    @Input() sectionType: any;
    @Input() validationMap;
    @Input() reportClassCode;

    constructor(public _commonData: CommonDataService,
                public _ProgressReportService: ProgressReportService,
                public commonService: CommonService,
                private _autoSaveService: AutoSaveService) { }

    setUnsavedChanges(flag: boolean) {
        this._commonData.isDataChange = flag;
        this.sectionType === 'S' ? this._autoSaveService.setUnsavedChanges('Summary Of Progress', 'summary-of-progress', flag, true) :
            this._autoSaveService.setUnsavedChanges('Future Plans', 'future-plans', flag, true);
    }

}


