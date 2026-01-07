import { Component, Input } from '@angular/core';
import { PERSON_DETAILS_CARD_ORDER } from '../../../app-constants';

@Component({
    selector: 'app-person-details',
    templateUrl: './person-details.component.html',
    styleUrls: ['./person-details.component.scss']
})
export class PersonDetailsComponent {

    @Input() personDetails: any;
    
    personDetailsCardOrder = PERSON_DETAILS_CARD_ORDER;

    constructor() { }

}
