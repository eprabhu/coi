import { Component } from '@angular/core';
import { CoiService } from '../../../services/coi.service';
import { ExtendedProjectRelationService } from '../../../extended-project-relation-summary/services/extended-project-relation.service';


@Component({
    selector: 'app-extended-project-relationship-summary',
    templateUrl: './extended-project-relationship-summary.component.html',
    styleUrls: ['./extended-project-relationship-summary.component.scss']
})
export class ExtendedProjectRelationshipSummaryComponent {

    constructor(public coiService: CoiService, public extendedProjRelService: ExtendedProjectRelationService) {}

}
