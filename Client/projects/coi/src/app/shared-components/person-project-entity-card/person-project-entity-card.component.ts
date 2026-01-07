import { Component, Input, OnChanges } from '@angular/core';
import { PersonProjectOrEntity } from '../shared-interface';
import { CommonService } from '../../common/services/common.service';

@Component({
    selector: 'app-person-project-entity-card',
    templateUrl: './person-project-entity-card.component.html',
    styleUrls: ['./person-project-entity-card.component.scss']
})

export class PersonProjectEntityCardComponent implements OnChanges {

    @Input() personProjectOrEntity = new PersonProjectOrEntity();

    personUnitDetail = '';

    constructor(public commonService: CommonService) { }

    ngOnChanges(): void {
        this.personUnitDetail = this.commonService.getPersonLeadUnitDetails(this.personProjectOrEntity);
    }

}
