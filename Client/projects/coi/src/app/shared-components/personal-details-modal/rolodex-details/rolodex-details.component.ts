import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ROLODEX_DETAILS_CARD_ORDER } from '../../../app-constants';

@Component({
    selector: 'app-rolodex-details',
    templateUrl: './rolodex-details.component.html',
    styleUrls: ['./rolodex-details.component.scss']
})
export class RolodexDetailsComponent implements OnChanges {

    @Input() rolodexDetails: any;

    organization = '';
    rolodexDetailsCardOrder = ROLODEX_DETAILS_CARD_ORDER;

    ngOnChanges(changes: SimpleChanges): void {
        if (this.rolodexDetails?.rolodex?.organizations) {
            const { organizationId, organizationName } = this.rolodexDetails?.rolodex?.organizations;
            this.organization = [organizationId, organizationName].filter(Boolean).join(' - ');
        }
    }

}
