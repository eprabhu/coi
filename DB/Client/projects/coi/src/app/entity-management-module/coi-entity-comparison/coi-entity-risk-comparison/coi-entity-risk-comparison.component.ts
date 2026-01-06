import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { EntityRisk } from '../../../entity-management-module/shared/entity-interface';
import { compareGroupedData } from '../coi-entity-comparison.service';
import { EntitySectionType } from '../../shared/entity-constants';

@Component({
    selector: 'app-coi-entity-risk-comparison',
    templateUrl: './coi-entity-risk-comparison.component.html',
    styleUrls: ['./coi-entity-risk-comparison.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoiEntityRiskComparisonComponent implements OnInit {

    @Input() leftSideRiskDetails: EntityRisk[] = [];
    @Input() rightSideRiskDetails: EntityRisk[] = [];
    @Input() sectionDetails: EntitySectionType | null = null;

    riskComparison = { ADD: [], DELETE: [], UPDATE: [], NO_CHANGE: [] };

    ngOnInit() {
        this.compareRisk();
    }

    private compareRisk(): void {
        this.riskComparison = { ADD: [], DELETE: [], UPDATE: [], NO_CHANGE: [] };
        compareGroupedData(
            this.leftSideRiskDetails || [],
            this.rightSideRiskDetails || [],
            'riskTypeCode',
            ['description', 'riskLevelCode'],
            this.riskComparison
        );
    }

}
