import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-related-travel-disclosures',
    templateUrl: './related-travel-disclosures.component.html',
    styleUrls: ['./related-travel-disclosures.component.scss']
})
export class RelatedTravelDisclosuresComponent {

    @Input() relatedDislcosures: any[];
    @Input() isTriggeredFromSlider = false;

}
