import { Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { EntityManagementService } from '../../entity-management.service';
import { EntityDataStoreService } from '../../entity-data-store.service';
import { Subscription } from 'rxjs';
import { DataStoreEvent, EntityCardDetails } from '../entity-interface';
import { ActivatedRoute } from '@angular/router';
import { isEmptyObject, openInNewTab } from '../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { DUNS_ENTITY_DETAILS_CARD_ORDER } from '../../../app-constants';

export class DunsMatchDetails {
    matchedDunsNumber: string;
    isDunsMatched: boolean;
}
@Component({
    selector: 'app-entity-duns-card',
    templateUrl: './entity-duns-card.component.html',
    styleUrls: ['./entity-duns-card.component.scss']
})
export class EntityDunsCardComponent implements OnInit, OnDestroy {

    primaryAddress = '';
    isDunsMatchAlreadyDone = false;
    isAlreadyMarkedAsDuplicate = false;
    isDuplicateEntityAvailable = false;
    $subscriptions: Subscription[] = [];
    dunsMatchDetails = new DunsMatchDetails();
    cardOrder = DUNS_ENTITY_DETAILS_CARD_ORDER;

    @Input() customClass = '';
    @Input() uniqueId = '';
    @Input() entityDetailsObj = new EntityCardDetails();
    @Output() emitCardNextAction = new EventEmitter<'USE' | 'OPEN_MODAL'>();

    constructor(public entityManagementService: EntityManagementService,
        private _route: ActivatedRoute,
        private _dataStorService: EntityDataStoreService) { }

    ngOnInit(): void {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        this.isDuplicateEntityAvailable = this.entityDetailsObj.duplicateEntityDetails && !isEmptyObject(this.entityDetailsObj.duplicateEntityDetails) &&
        this.entityDetailsObj.duplicateEntityDetails.entityId != this._route.snapshot.queryParamMap.get('entityManageId');
    }

    sendEntityDetails(): void {
        this.emitCardNextAction.emit('USE');
    }

    openMarkAsDuplicateModal(): void {
        this.emitCardNextAction.emit('OPEN_MODAL');
    }

    private getDataFromStore(): void {
        const ENTITY_DATA = this._dataStorService.getData();
        if (ENTITY_DATA && !isEmptyObject(ENTITY_DATA)) {
            this.dunsMatchDetails.matchedDunsNumber = ENTITY_DATA?.entityDetails?.dunsNumber;
            this.dunsMatchDetails.isDunsMatched = ENTITY_DATA?.entityDetails?.isDunsMatched;
            this.isDunsMatchAlreadyDone = this.dunsMatchDetails.isDunsMatched && this.dunsMatchDetails.matchedDunsNumber == this.entityDetailsObj?.dunsNumber;
            this.isAlreadyMarkedAsDuplicate = ENTITY_DATA?.entityDetails?.originalEntityId == this.entityDetailsObj?.duplicateEntityDetails?.entityId;
        } else {
            return;
        }
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._dataStorService.dataEvent.subscribe((dependencies: DataStoreEvent) => {
                this.getDataFromStore();
            })
        );
    }

    openEntity(entityId: any): void {
        openInNewTab('manage-entity/entity-overview?', ['entityManageId'], [entityId]);
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

}
