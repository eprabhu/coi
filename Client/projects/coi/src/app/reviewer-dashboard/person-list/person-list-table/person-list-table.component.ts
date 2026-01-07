import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormSharedModule } from '../../../configuration/form-builder-create/shared/shared.module';
import { SharedComponentModule } from '../../../shared-components/shared-component.module';
import { SharedModule } from '../../../shared/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { PersonDetails, PersonListTabTypes, PersonTableEventActionType, PersonTableTriggeredFrom } from '../../reviewer-dashboard.interface';
import { fadeInOutHeight, topSlideInOut } from '../../../common/utilities/animations';
import { CommonService } from '../../../common/services/common.service';
import { REVIEWER_DASHOARD_PERSON_LIST_LOCALIZE } from '../../../app-locales';

export type PersonTableActionEvent = { action: PersonTableEventActionType, disclosureDetails: any, content?: any; };


@Component({
    selector: 'app-person-list-table',
    templateUrl: './person-list-table.component.html',
    styleUrls: ['./person-list-table.component.scss'],
    standalone: true,
    animations: [fadeInOutHeight, topSlideInOut],
    imports: [CommonModule, SharedModule, SharedComponentModule, FormSharedModule, MatIconModule]
})
export class PersonListTableComponent {

    @Output('onSortClick') emitOnSortClick: EventEmitter<string> = new EventEmitter<string>();
    @Output() personTableActions = new EventEmitter<PersonTableActionEvent>();
    @Input() personDetails: PersonDetails[];
    @Input() sortObject: any = {};
    @Input() personListTabType: PersonListTabTypes;
    @Input() triggeredFrom: PersonTableTriggeredFrom = 'PERSON_LIST';
    @Input() isShowSortIcon = true;
    isLoading = false;
    isAllSelected = false;
    selectedPersons: boolean[] = [];
    selectedPersonCount = 0;
    personListLocalize = REVIEWER_DASHOARD_PERSON_LIST_LOCALIZE;

    constructor(private _commonService: CommonService) {
    }

    onSortClick(sortFieldBy) {
        this.emitOnSortClick.emit(sortFieldBy);
    }

    openPersonHistorySlider(personDetails, personIndex): void {
        this.personTableActions.emit({ action: 'PERSON_HISTORY', disclosureDetails: personDetails, content: { personIndex: personIndex } });
    }

    openPersonEditModal(personDetails): void {
        this.personTableActions.emit({ action: 'EDIT_ELIGIBILITY', disclosureDetails: personDetails });
    }

    toggleNotificationSlider(personDetails, personIndex): void {
        this.personTableActions.emit({ action: 'NOTIFICATION_SLIDER', disclosureDetails: personDetails, content: { personIndex: personIndex } });
    }

    toggleSelectAll(): void {
        this.isAllSelected = !this.isAllSelected;
        this.selectedPersons = new Array(this.personDetails.length).fill(this.isAllSelected);
        this.selectedPersonCount = this.isAllSelected ? this.personDetails.length : 0;
    }

    toggleSelectPerson(index: number): void {
        this.selectedPersons[index] = !this.selectedPersons[index];
        this.selectedPersonCount = this.selectedPersons.filter(Boolean).length;
        this.isAllSelected = this.selectedPersonCount === this.personDetails.length;
    }

    notifySelectedPersons(): void {
        const SELECTED_PERSON_DETAILS = this.personDetails.filter((_, index) => this.selectedPersons[index]);
        this.personTableActions.emit({ action: 'NOTIFICATION_SLIDER', disclosureDetails: null, content: { personDetailsList: SELECTED_PERSON_DETAILS } });
    }

    openPersonDetailsModal(personDetails: PersonDetails): void {
        this._commonService.openPersonDetailsModal(personDetails?.personId);
    }

}
