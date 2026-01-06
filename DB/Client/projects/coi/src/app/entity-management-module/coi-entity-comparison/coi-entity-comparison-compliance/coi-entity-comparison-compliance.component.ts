import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EntityCompliance } from '../../../entity-management-module/shared/entity-interface';
import { COMPLIANCE_DETAILS_FIELDS_CONFIG } from '../coi-entity-comparison.constants';
import { ComplianceTab } from '../../shared/entity-constants';

@Component({
    selector: 'app-coi-entity-comparison-compliance',
    templateUrl: './coi-entity-comparison-compliance.component.html',
    styleUrls: ['./coi-entity-comparison-compliance.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoiEntityComparisonComplianceComponent {

    @Input() leftSideComplianceDetails = new EntityCompliance();
    @Input() rightSideComplianceDetails = new EntityCompliance();

    complianceTab = [
        ComplianceTab.get('COMPLIANCE_DETAILS'),
        ComplianceTab.get('COMPLIANCE_RISK')
    ];
    complianceDetailsFieldsConfig = COMPLIANCE_DETAILS_FIELDS_CONFIG;

}
