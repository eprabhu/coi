import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SubAwardOrganization } from '../../../entity-management-module/shared/entity-interface';
import { ORGANIZATION_DETAILS_FIELDS_CONFIG } from '../coi-entity-comparison.constants';
import { SubawardOrganizationTab } from '../../shared/entity-constants';

@Component({
    selector: 'app-coi-entity-comparison-organization',
    templateUrl: './coi-entity-comparison-organization.component.html',
    styleUrls: ['./coi-entity-comparison-organization.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoiEntityComparisonOrganizationComponent {

    @Input() leftSideOrganizationDetails = new SubAwardOrganization();
    @Input() rightSideOrganizationDetails = new SubAwardOrganization();

    subawardOrganizationTab = [
        SubawardOrganizationTab.get('SUB_AWARD_ORGANIZATION'),
        SubawardOrganizationTab.get('SUB_AWARD_RISK')
    ];
    organizationDetailsFieldsConfig = ORGANIZATION_DETAILS_FIELDS_CONFIG;

}
