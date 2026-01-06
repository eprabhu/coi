import { Component } from '@angular/core';
import { EntityCorporateFamilyService } from '../entity-corporate-family.service';
import { EntityTreeStructure } from '../entity-corporate-family.interface';
import { openInNewTab } from '../../../common/utilities/custom-utilities';

@Component({
    selector: 'app-corporate-family-tree',
    templateUrl: './corporate-family-tree.component.html',
    styleUrls: ['./corporate-family-tree.component.scss']
})

export class CorporateFamilyTreeComponent {

    constructor(public entityCorporateFamilyService: EntityCorporateFamilyService) { }

    openEntity(entity: EntityTreeStructure): void {
        openInNewTab('manage-entity/entity-corporate-family?', ['entityManageId'], [entity.entityId]);
    }

}
