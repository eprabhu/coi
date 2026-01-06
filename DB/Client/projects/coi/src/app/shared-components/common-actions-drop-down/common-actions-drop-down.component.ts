import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { SharedBootstrapDropdownDetails } from '../shared-interface';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AvailableDocumentActions } from '../../common/services/coi-common.interface';

@Component({
    selector: 'app-common-actions-drop-down',
    templateUrl: './common-actions-drop-down.component.html',
    styleUrls: ['./common-actions-drop-down.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, MatMenuModule, MatIconModule]
})
export class CommonActionsDropDownComponent {

    @Input() dropDownConfig: SharedBootstrapDropdownDetails | null = null;
    @Input() availableActions: AvailableDocumentActions[] = [];

    @Output() selectedAction = new EventEmitter<any>();

    emitSelectedItem(actionsDetails: AvailableDocumentActions): void {
        this.selectedAction.emit(actionsDetails);
    }

}
