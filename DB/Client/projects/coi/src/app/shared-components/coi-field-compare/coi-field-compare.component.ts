import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EntityComparisonFieldConfig } from '../../entity-management-module/coi-entity-comparison/coi-entity-comparison.interface';

@Component({
    selector: 'app-coi-field-compare',
    templateUrl: './coi-field-compare.component.html',
    styleUrls: ['./coi-field-compare.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoiFieldCompareComponent {

    @Input() valueLeft = '';
    @Input() valueRight = '';
    @Input() customClass = '';
    @Input() config: EntityComparisonFieldConfig | null = null;

}
