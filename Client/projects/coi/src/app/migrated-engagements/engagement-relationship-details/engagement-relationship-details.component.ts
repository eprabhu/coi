import { Component, Input } from '@angular/core';
import { LegacyEngagement } from '../migrated-engagements-interface';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { MigratedEngagementMatrixComponent } from '../migrated-engagement-matrix/migrated-engagement-matrix.component';
import { ENGAGEMENT_LOCALIZE } from '../../app-locales';

@Component({
    selector: 'app-engagement-relationship-details',
    standalone: true,
    imports: [CommonModule, MigratedEngagementMatrixComponent, SharedModule],
    templateUrl: './engagement-relationship-details.component.html',
    styleUrls: ['./engagement-relationship-details.component.scss']
})
export class EngagementRelationshipDetailsComponent {

    ENGAGEMENT_LOCALIZE = ENGAGEMENT_LOCALIZE;
    @Input() engagementDetails = new LegacyEngagement();

}
