import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-coi-section-card',
    templateUrl: './coi-section-card.component.html',
    styleUrls: ['./coi-section-card.component.scss']
})
export class CoiSectionCardComponent {

    @Input() customClass = 'overflow-hidden';
    @Input() uniqueId = '';

}
