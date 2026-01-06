import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { COMMON_DISCL_LOCALIZE } from '../../app-locales';
import { Person, RolodexPerson } from '../../common/services/coi-common.interface';
import { getCodeDescriptionFormat } from '../../common/utilities/custom-utilities';

@Component({
    selector: 'app-common-person-card',
    templateUrl: './common-person-card.component.html',
    styleUrls: ['./common-person-card.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, SharedModule]
})
export class CommonPersonCardComponent implements OnInit {

    @Input() personDetails: Person | RolodexPerson | null = null;
    @Input() customClass = '';

    organization = ''
    cardOrder = ['PERSON_NAME', 'APPOINTMENT_TITLE', 'EMAIL_ADDRESS', 'DEPARTMENT'];
    COMMON_DISCL_LOCALIZE = COMMON_DISCL_LOCALIZE;

    constructor() {}

    ngOnInit(): void {
        const { organizations, rolodexId } = this.personDetails as RolodexPerson || {};
        this.organization = getCodeDescriptionFormat(organizations?.organizationId, organizations?.organizationName);
        if (rolodexId) {
            this.cardOrder = ['PERSON_NAME', 'EMAIL_ADDRESS', 'ORGANIZATION'];
        } else {
            this.cardOrder = ['PERSON_NAME', 'APPOINTMENT_TITLE', 'EMAIL_ADDRESS', 'DEPARTMENT'];
        }
    }

}
