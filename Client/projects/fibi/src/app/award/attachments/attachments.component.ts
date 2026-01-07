import { Component, OnInit } from '@angular/core';
import { CommonDataService } from '../services/common-data.service';

@Component({
    selector: 'app-attachments',
    template: '<div id="award-attachment-section" *ngIf="_commonData?.awardSectionConfig[\'103\']?.isActive"><app-attachments-edit></app-attachments-edit></div>'
})
export class AttachmentsComponent implements OnInit {

    constructor(public _commonData: CommonDataService) {
    }

    ngOnInit() {
    }

}
