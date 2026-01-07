import { Component, Input, OnChanges } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { ENGAGEMENT_TYPE_ICONS } from '../../app-constants';

class CardDetails {
    entityName: string = '';
    entityType: string = '';
    countryName: string = '';
    entityStatus: string = '';
    relationship: any = [];
}
@Component({
    selector: 'app-entity-details-card',
    templateUrl: './entity-details-card.component.html',
    styleUrls: ['./entity-details-card.component.scss']
})
export class EntityDetailsCardComponent implements OnChanges {

    @Input() entityDetails: any;
    @Input() relationshipDetails: any = [];
    @Input() relationshipMainTypes: any[] =[];

    unifiedPersonEntityRelationships: any[] =[];
    engagementTypeIcons = ENGAGEMENT_TYPE_ICONS;

    constructor(public commonService: CommonService) {}

    cardDetails: CardDetails = new CardDetails();

    ngOnChanges() {
        this.setEntityCardDetails();
    }

    setEntityCardDetails() {
        this.cardDetails.entityName = this.entityDetails.entityName;
        this.cardDetails.entityType = (this.entityDetails && this.entityDetails.entityType) ? this.entityDetails.entityType.description : '';
        this.cardDetails.countryName = (this.entityDetails && this.entityDetails.country) ? this.entityDetails.country.countryName : '';
        this.cardDetails.entityStatus = this.entityDetails ? this.entityDetails.isActive ? 'Active' : 'Inactive' : '';
        if (this.relationshipDetails?.length) {
            this.cardDetails.relationship = (this.groupBy(this.relationshipDetails, "coiDisclosureType", "description"));
        }
        this.getUnifiedPersonEntityRelationships();
    }

    private getUnifiedPersonEntityRelationships(): void {
        if (this.commonService.isUnifiedQuestionnaireEnabled) {
            this.unifiedPersonEntityRelationships = [];
            const DISCLOSURE_TYPE_CODES = new Set(
                this.relationshipDetails?.map((item: any) => item?.disclosureTypeCode)?.filter((code: any) => code !== null && code !== undefined));
            if (DISCLOSURE_TYPE_CODES?.size) {
                this.unifiedPersonEntityRelationships = this.relationshipMainTypes?.filter(
                    (item: any) => !DISCLOSURE_TYPE_CODES?.has(item?.disclosureTypeCode)
                );
            } else {
                this.unifiedPersonEntityRelationships = this.relationshipMainTypes;
            }
        }
    }

    groupBy(jsonData: any, key: string, innerKey: string): any {
        return jsonData.reduce((relationsTypeGroup, item) => {
            (relationsTypeGroup[item[key][innerKey]] = relationsTypeGroup[item[key][innerKey]] || []).push(item);
            return relationsTypeGroup;
        }, {});
    }

}
