import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { EntityComparisonService } from './coi-entity-comparison.service';
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { CoiEntityRiskComparisonComponent } from './coi-entity-risk-comparison/coi-entity-risk-comparison.component';
import { CoiEntityComparisonSliderComponent } from './coi-entity-comparison-slider/coi-entity-comparison-slider.component';
import { CoiEntityComparisonSponsorComponent } from './coi-entity-comparison-sponsor/coi-entity-comparison-sponsor.component';
import { CoiEntityComparisonOverviewComponent } from './coi-entity-comparison-overview/coi-entity-comparison-overview.component';
import { CoiEntityComparisonRightNavComponent } from './coi-entity-comparison-right-nav/coi-entity-comparison-right-nav.component';
import { CoiEntityFieldSectionCompareComponent } from './coi-entity-field-section-compare/coi-entity-field-section-compare.component';
import { CoiEntityComparisonComplianceComponent } from './coi-entity-comparison-compliance/coi-entity-comparison-compliance.component';
import { CoiEntityComparisonOrganizationComponent } from './coi-entity-comparison-organization/coi-entity-comparison-organization.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        SharedComponentModule
    ],
    declarations: [
        CoiEntityComparisonSliderComponent,
        CoiEntityComparisonOverviewComponent,
        CoiEntityComparisonSponsorComponent,
        CoiEntityComparisonOrganizationComponent,
        CoiEntityComparisonComplianceComponent,
        CoiEntityRiskComparisonComponent,
        CoiEntityFieldSectionCompareComponent,
        CoiEntityComparisonRightNavComponent
    ],
    exports: [
        CoiEntityComparisonSliderComponent,
    ],
    providers: [
        EntityComparisonService
    ]
})
export class CoiEntityComparisonModule {}
