import { CommonModule } from '@angular/common';
import { CMP_LOCALIZE } from '../../../app-locales';
import { SharedModule } from '../../../shared/shared.module';
import { ManagementPlanStoreData } from '../management-plan.interface';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CoiProjectType } from '../../../common/services/coi-common.interface';
import { CommonService } from '../../../common/services/common.service';

@Component({
    selector: 'app-cmp-header-card',
    templateUrl: './management-plan-header-card.component.html',
    styleUrls: ['./management-plan-header-card.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, SharedModule]
})
export class ManagementPlanHeaderCardComponent {

    cmpLocalize = CMP_LOCALIZE;
    projectTypes: Record<string, CoiProjectType> = this._commonService.getCoiProjectTypesMap();

    @Input() managementPlan = new ManagementPlanStoreData();

    constructor(private _commonService: CommonService) {}

}
