import { interval, Subject } from 'rxjs';
import { debounce } from 'rxjs/operators';
import { leftSlideInOut } from '../../../common/utilities/animations';
import { EntityBatchService } from '../services/entity-batch.service';
import { FilterSearchAction } from '../services/entity-batch.interface';
import { ENTITY_BATCH_MATCH_LOOKUP } from '../../../app-constants';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-entity-batch-filter-search',
    templateUrl: './entity-batch-filter-search.component.html',
    styleUrls: ['./entity-batch-filter-search.component.scss'],
    animations: [leftSlideInOut]
})
export class EntityBatchFilterSearchComponent implements OnInit, OnDestroy {

    $subscriptions = [];
    uniqueId = 'entity-batch';
    $debounceEventForSearch = new Subject();
    ENTITY_BATCH_MATCH_LOOKUP = ENTITY_BATCH_MATCH_LOOKUP;
    REVIEW_STATUS_LOOKUP_OPTIONS = 'ENTITY_STAGE_ADMIN_REVIEW_TYPE#ADMIN_REVIEW_STATUS_CODE#true#true';
    ADMIN_ACTION_LOOKUP_OPTIONS = 'ENTITY_STAGE_ADMIN_ACTION_TYPE#ADMIN_ACTION_CODE#true#true';
    MATCH_LOOKUP_OPTIONS = 'EMPTY#EMPTY#true#true';

    @Input() filterSearchData = new FilterSearchAction();
    @Output() filterSearchDataChange = new EventEmitter<FilterSearchAction>();

    constructor(public entityBatchService: EntityBatchService) {}

    ngOnInit(): void {
        this.triggerSearchChanges();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private triggerSearchChanges(): void {
        this.$subscriptions.push(
            this.$debounceEventForSearch.pipe(debounce(() => interval(800)))
                .subscribe((data: any) => {
                    this.triggerChanges();
                }));
    }

    private triggerChanges(): void {
        this.filterSearchDataChange.emit(this.filterSearchData);
    }

    searchTextChanged(): void {
        this.filterSearchData.searchText = this.filterSearchData.searchText?.trim();
        this.$debounceEventForSearch.next();
    }

    clearSearch(): void {
        this.filterSearchData.searchText = '';
        this.triggerChanges();
    }

    setFilter(event: any, filterKey: string): void {
        if (event) {
            this.filterSearchData[filterKey] = event.length ? event.map((d: any) => d.code) : null;
        }
    }

    clearAdvancedSearch(): void {
        this.filterSearchData.currentMatchFilter = null;
        this.filterSearchData.currentReviewFilter = null;
        this.filterSearchData.currentAdminActionFilter = null;
        this.filterSearchData.selectedLookupList = {
            currentMatchFilter: [],
            currentReviewFilter: [],
            currentAdminActionFilter: []
        }
        this.triggerChanges();
    }

    performAdvancedSearch(): void {
        this.filterSearchData.searchText = this.filterSearchData.searchText?.trim();
        this.triggerChanges();
    }

}
