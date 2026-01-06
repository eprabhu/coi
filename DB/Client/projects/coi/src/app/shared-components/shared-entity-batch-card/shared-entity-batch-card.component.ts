import { Component, Input, OnInit } from '@angular/core';
import { EntityBatchDetails } from '../../common/services/coi-common.interface';
import { BATCH_ENTITY_BATCH_STATUS_BADGE, BATCH_ENTITY_REVIEW_STATUS_BADGE, BATCH_STATUS_TYPE_CODE, ENTITY_BATCH_CARD_ORDER } from '../../app-constants';
import { Router } from '@angular/router';

@Component({
    selector: 'app-shared-entity-batch-card',
    templateUrl: './shared-entity-batch-card.component.html',
    styleUrls: ['./shared-entity-batch-card.component.scss']
})
export class SharedEntityBatchCardComponent {

    @Input() entityBatchDetails = new EntityBatchDetails();
    @Input() uniqueId: string | number = '';
    @Input() customClass = 'border-0';
    @Input() isShowViewBtn = false;
    @Input() isShowBackBtn = false;
    @Input() backNavigationLink = '/coi/entity-dashboard';
    @Input() columnClass = 'col-6 col-sm-6 col-md-4 col-lg col-xl col-xxl';

    BATCH_ENTITY_REVIEW_STATUS_BADGE = BATCH_ENTITY_REVIEW_STATUS_BADGE;
    BATCH_ENTITY_BATCH_STATUS_BADGE = BATCH_ENTITY_BATCH_STATUS_BADGE;
    ENTITY_BATCH_CARD_ORDER = ENTITY_BATCH_CARD_ORDER;
    BATCH_STATUS_TYPE_CODE = BATCH_STATUS_TYPE_CODE;

    constructor(private _router: Router) {}

    viewBatchDetails(): void {
        this._router.navigate(['/coi/entity-dashboard/batch'], { queryParams: { batchId: this.entityBatchDetails.batchId } });
    }

    navigateToBack() {
        this._router.navigate([this.backNavigationLink]);
    }

}
