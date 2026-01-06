import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonDataService } from '../services/common-data.service';

@Component({
    selector: 'app-terms-approval',
    templateUrl: './terms-approval.component.html',
    styleUrls: ['./terms-approval.component.css']
})
export class TermsApprovalComponent implements OnInit {
    awardId: any;

    constructor(private route: ActivatedRoute, public _commonData: CommonDataService) {
    }

    ngOnInit() {
        this.awardId = this.route.snapshot.queryParams['awardId'];
    }
}
