import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { SharedEntityCardActions, EntityDetailsCardConfig, SharedEntityCardEvents } from '../../common/services/coi-common.interface';
import { BATCH_ENTITY_REVIEW_STATUS_BADGE, BATCH_MATCH_TYPE } from '../../app-constants';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-shared-entity-details-card',
    templateUrl: './shared-entity-details-card.component.html',
    styleUrls: ['./shared-entity-details-card.component.scss']
})
export class SharedEntityDetailsCardComponent implements OnChanges {

    @Input() entityCardConfig = new EntityDetailsCardConfig();
    @Output() isSelectedChange = new EventEmitter<boolean>();
    @Output() actions = new EventEmitter<SharedEntityCardEvents>();

    matchTypeList = [];
    primaryAddress = '';
    isExpandForeignName = false;
    deployMap = environment.deployUrl;
    BATCH_ENTITY_REVIEW_STATUS_BADGE = BATCH_ENTITY_REVIEW_STATUS_BADGE;

    constructor() {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['entityCardConfig'] && this.entityCardConfig?.sharedEntityDetails) {
            this.matchTypeList = this.getBatchMatchType();
            // Filters out any null, undefined, or empty string values and Joins the address lines with a comma and space
            const { primaryAddressLine1, primaryAddressLine2 } = this.entityCardConfig.sharedEntityDetails;
            this.primaryAddress = [primaryAddressLine1, primaryAddressLine2].filter(Boolean).join(', ');
            this.entityCardConfig.individualColumnClass['ADDRESS'] = 'col-12';
        }
    }

    emitActions(action: SharedEntityCardActions, value: boolean = null): void {
        const INPUT_OPTIONS = this.entityCardConfig.inputOptions[action];
        if (action === 'CHECK_BOX' || ((action === 'SET_AS_ORIGINAL' || action === 'USE_THIS') && INPUT_OPTIONS.inputType === 'TOGGLE')) {
            INPUT_OPTIONS.defaultValue = value;
        }
        this.actions.emit({
            action: action,
            content: {
                currentValue: value,
                entityCardConfig: this.entityCardConfig,
                sharedEntityDetails: this.entityCardConfig?.sharedEntityDetails
            }
        });
    }

    getBatchMatchType(): string[] {
        const STATUS_ARRAY: string[] = [];
        if (this.entityCardConfig?.sharedEntityDetails?.isExactDunsMatch) {
            STATUS_ARRAY.push(BATCH_MATCH_TYPE.IS_EXACT_DUNS_MATCH);
        }
        if (this.entityCardConfig?.sharedEntityDetails?.isMultipleDunsMatch) {
            STATUS_ARRAY.push(BATCH_MATCH_TYPE.IS_MULTIPLE_DUNS_MATCH);
        }
        if (this.entityCardConfig?.sharedEntityDetails?.isNoDunsMatch) {
            STATUS_ARRAY.push(BATCH_MATCH_TYPE.IS_NO_DUNS_MATCH);
        }
        if (this.entityCardConfig?.sharedEntityDetails?.isDuplicateInBatch) {
            STATUS_ARRAY.push(BATCH_MATCH_TYPE.IS_DUPLICATE_IN_BATCH);
        }
        if (this.entityCardConfig?.sharedEntityDetails?.isDuplicateInEntitySys) {
            STATUS_ARRAY.push(BATCH_MATCH_TYPE.IS_DUPLICATE_IN_ENTITY_DB);
        }
        return STATUS_ARRAY;
    }

}
