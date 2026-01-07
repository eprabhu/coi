import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { POST_CREATE_DISCLOSURE_ROUTE_URL } from '../../app-constants';
import { heightAnimation } from '../../common/utilities/animations';
import { openInNewTab } from '../../common/utilities/custom-utilities';
import { ProjectKeyPerson } from '../project-hierarchy-slider/services/project-hierarchy-slider.interface';

@Component({
    selector: 'app-disclosure-project-key-person',
    templateUrl: './disclosure-project-key-person.component.html',
    styleUrls: ['./disclosure-project-key-person.component.scss'],
    animations: [heightAnimation('0', '*', 300, 'heightAnimation')]
})
export class DisclosureProjectKeyPersonComponent implements OnInit {

    @Input() isShowAllDisclosures = false;
    @Input() uniqueId: string | number = '';
    @Input() keyPersonData = new ProjectKeyPerson();

    leadUnit: string = null;
    
    constructor(private _commonService: CommonService) {}

    ngOnInit(): void {
        this.leadUnit = this._commonService.getPersonLeadUnitDetails(this.keyPersonData);
    }

    redirectToFCOIDisclosure(disclosureId: number | null): void {
        if (disclosureId) {
            openInNewTab(POST_CREATE_DISCLOSURE_ROUTE_URL + '?', ['disclosureId'], [disclosureId]);
        }
    }

    redirectToPersonDetails(keyPersonData: ProjectKeyPerson): void {
        const PERSON_TYPE = keyPersonData?.nonEmployeeFlag !== 'Y' ? 'PERSON' : 'ROLODEX';
        this._commonService.openPersonDetailsModal(keyPersonData?.keyPersonId, PERSON_TYPE);
    }
}
