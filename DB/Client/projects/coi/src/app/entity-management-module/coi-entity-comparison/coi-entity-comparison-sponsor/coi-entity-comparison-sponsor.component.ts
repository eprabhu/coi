import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EntitySponsor } from '../../../entity-management-module/shared/entity-interface';
import { SPONSOR_DETAILS_FIELDS_CONFIG } from '../coi-entity-comparison.constants';
import { SponsorTabSection } from '../../shared/entity-constants';

@Component({
    selector: 'app-coi-entity-comparison-sponsor',
    templateUrl: './coi-entity-comparison-sponsor.component.html',
    styleUrls: ['./coi-entity-comparison-sponsor.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoiEntityComparisonSponsorComponent {

    @Input() leftSideSponsorDetails = new EntitySponsor();
    @Input() rightSideSponsorDetails = new EntitySponsor();

    sponsorTabSection = [
        SponsorTabSection.get('SPONSOR_DETAILS'),
        SponsorTabSection.get('SPONSOR_RISK')
    ];
    sponsorDetailsFieldsConfig = SPONSOR_DETAILS_FIELDS_CONFIG;

}
