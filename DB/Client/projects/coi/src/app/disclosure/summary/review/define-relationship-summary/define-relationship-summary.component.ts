import { Component, OnInit } from '@angular/core';
import { CoiService } from '../../../services/coi.service';

@Component({
    selector: 'app-define-relationship-summary',
    templateUrl: './define-relationship-summary.component.html',
    styleUrls: ['./define-relationship-summary.component.scss']
})
export class DefineRelationshipSummaryComponent implements OnInit {

    constructor(public coiService: CoiService) { }

    ngOnInit() {
    }

}
