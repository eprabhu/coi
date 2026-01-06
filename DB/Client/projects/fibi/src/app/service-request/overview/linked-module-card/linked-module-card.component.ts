import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { openInNewTab } from '../../../common/utilities/custom-utilities';
import { concatUnitNumberAndUnitName } from '../../../common/utilities/custom-utilities';
import { ModuleDetails } from '../../service-request.interface';
import { CommonDataService } from '../../services/common-data.service';

@Component({
    selector: 'app-linked-module-card',
    templateUrl: './linked-module-card.component.html',
    styleUrls: ['./linked-module-card.component.css']
})
export class LinkedModuleCardComponent implements OnInit {

    $subscriptions: Subscription[] = [];

    @Input() moduleDetails: ModuleDetails;
    @Output() unlinkModule: EventEmitter<boolean> = new EventEmitter<boolean>();
    isEdit = false;
    concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;

    constructor(
        public _commonData: CommonDataService
    ) { }

    ngOnInit() {
        this.getServiceRequestDetails();
    }

    private getServiceRequestDetails(): void {
        this.$subscriptions.push(
            this._commonData.dataEvent.subscribe((data: any) => {
                if (data.includes('serviceRequest')) {
                    this.isEdit = this._commonData.canUserEdit();
                }
            })
        );
    }
    /**
   * get the basic url and appending the required url base on the module selected.
   */
    goToExternalLink(): void {
        switch (this.moduleDetails.moduleCode) {
            case 1: openInNewTab('award/overview?', ['awardId'], [this.moduleDetails.moduleItemId]); break;
            case 2: openInNewTab('instituteproposal/overview?', ['instituteProposalId'], [this.moduleDetails.moduleItemId]); break;
            case 3: openInNewTab('proposal?', ['proposalId'], [this.moduleDetails.moduleItemId]); break;
            case 13: openInNewTab('agreement/form?', ['agreementId'], [this.moduleDetails.moduleItemId]); break;
            default: break;
        }
    }

}
