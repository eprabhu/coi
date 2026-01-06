import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { EntityCardActionEvent, MigratedEntityCardConfig } from '../migrated-engagements-interface';

@Component({
    selector: 'app-migrated-entity-details-card',
    templateUrl: './migrated-entity-details-card.component.html',
    styleUrls: ['./migrated-entity-details-card.component.scss']
})
export class MigratedEntityDetailsCardComponent implements OnInit, OnChanges {

    @Input() entityCardConfig = new MigratedEntityCardConfig();
    @Input() selectedEntityId: string | number = 0;
    @Input() isDunsEntity: boolean = false;
    @Output() cardActions = new EventEmitter<EntityCardActionEvent>();
    primaryAddress = '';

    constructor() { }

    ngOnInit() {
        this.setPrimaryAddress();
    }

    ngOnChanges() {
        this.setPrimaryAddress();
    }
    // Emits the selected entity card action along with entity details to the parent
    emitEntityAction(action: 'SELECT' | 'PROCEED'): void {
        this.cardActions.emit({
            action: action,
            entityDetails: this.entityCardConfig
        });
    }
    // Combines addressLine1 and addressLine2 into a formatted primary address string
    setPrimaryAddress() {
        const { addressLine1, addressLine2 } = this.entityCardConfig;
        this.primaryAddress = [addressLine1, addressLine2].filter(Boolean).join(', ');
    }

}
