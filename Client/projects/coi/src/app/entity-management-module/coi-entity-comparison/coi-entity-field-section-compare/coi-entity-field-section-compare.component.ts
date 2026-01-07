import { ChangeDetectionStrategy, Component, Input, } from '@angular/core';
import { EntityComparisonFieldConfig } from '../coi-entity-comparison.interface';

@Component({
    selector: 'app-coi-entity-field-section-compare',
    templateUrl: './coi-entity-field-section-compare.component.html',
    styleUrls: ['./coi-entity-field-section-compare.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoiEntityFieldSectionCompareComponent {

    @Input() fieldConfig: any[] = [];
    @Input() leftSideComparisonData: any;
    @Input() rightSideComparisonData: any;
    
    getValue(config: EntityComparisonFieldConfig, object: any): string {
        if (['priorNames', 'foreignNames'].includes(config?.objectName || '')) {
            return this.getForeignOrPriorNames(config.objectName, object);
        }
        const getValueByPath = (path?: string): string => path?.split('?.').reduce((obj, key) => obj?.[key], object)?.toString().trim() || '';
        return getValueByPath(config.objectName) || getValueByPath(config.alternativeObjectName);
    }

    getForeignOrPriorNames(objectName: string, object: any): string {
        const LIST = object?.[objectName];
        if (!Array.isArray(LIST)) return '';

        if (objectName === 'foreignNames') {
            return LIST
                .sort((a, b) => (a?.foreignName || '').localeCompare(b?.foreignName || ''))
                .map(item => item?.foreignName || '')
                .join(' | ');
        }

        if (objectName === 'priorNames') {
            const [LATEST, ...REST] = LIST;
            return [LATEST?.priorNames || '', ...REST.map(item => item?.priorNames || '')].join(' | ');
        }
        return '';
    }

}
