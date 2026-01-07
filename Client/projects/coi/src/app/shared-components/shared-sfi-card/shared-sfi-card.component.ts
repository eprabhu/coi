import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { SharedSfiService } from './shared-sfi.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { SfiCardCommentDetails, SfiObject } from '../shared-interface';
import { CoiService } from '../../disclosure/services/coi.service';
import { ADMIN_DASHBOARD_RIGHTS, COI_DISCLOSURE_SUPER_ADMIN_RIGHTS, CREATE_TRAVEL_DISCLOSURE_ROUTE_URL, ENGAGEMENT_REL_TYPE_ICONS,
  ENGAGEMENT_VERSION_STATUS,
  ENTITY_DOCUMENT_STATUS_TYPE, ENTITY_RIGHTS, OPA_DISCLOSURE_ADMIN_RIGHTS, OPA_DISCLOSURE_RIGHTS, RELATIONS_TYPE_SUMMARY, RISK_ICON_COLOR_MAPPING } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { environment } from '../../../environments/environment';
import { ENGAGEMENT_LOCALIZE } from '../../app-locales';

@Component({
  selector: 'app-shared-sfi-card',
  templateUrl: './shared-sfi-card.component.html',
  styleUrls: ['./shared-sfi-card.component.scss'],
  providers: [SharedSfiService, CoiService]
})

export class SharedSfiCardComponent implements OnInit, OnDestroy {

  @Input() uniqueId = '';
  @Input() reqObject: any;
  @Input() isShowActivateButton = true;
  @Input() isShowRiskLevel = false;
  @Input() isTriggeredFromSlider: any;
  @Input() canEditEngagement = false;
  @Input() referredFrom: 'SFI_SUMMARY' | 'SFI_EDIT_AND_DASHBOARD' | 'TRAVEL_DISCLOSURE' | 'DISCLOSURE_APPLY_TO_ALL';
  @Input() isShowSelectButton = true;
  @Input() selectedEngagementId: number;
  @Output() viewSlider = new EventEmitter<any>();
  @Output() deleteEvent =  new EventEmitter<any>();
  @Output() activateDeactivateEvent =  new EventEmitter<any>();
  @Output() reviewSlider = new EventEmitter<any>();
  @Output() selectTravelEngagement = new EventEmitter<any>();
  @Input() commentDetails: SfiCardCommentDetails;

  SFIObject = new SfiObject();
  travelDisclosureRO : any = {};
  $subscriptions: Subscription[] = [];
  isTravelDisclosure = false;
  riskIconColor = RISK_ICON_COLOR_MAPPING;
  entityDocumentStatusType = ENTITY_DOCUMENT_STATUS_TYPE;
  commentCount: number;
  isAdmin = false;
  deployMap = environment.deployUrl;  
  RELATIONS_TYPE_SUMMARY = RELATIONS_TYPE_SUMMARY;
  engagementRelTypeIcons = ENGAGEMENT_REL_TYPE_ICONS;
  ENGAGEMENT_LOCALIZE = ENGAGEMENT_LOCALIZE;
  engagementVersionStatus = ENGAGEMENT_VERSION_STATUS;

  constructor(private _router: Router,
    private _sharedSFIService: SharedSfiService,
    public commonService: CommonService
  ) { }

    ngOnInit() {
      this.updateSFIObject();
      this.canViewRiskLevel();
      this.isCreateTravelDisclosure();
    }

    ngOnDestroy() {
      subscriptionHandler(this.$subscriptions);
    }

  private updateSFIObject(): void {
    if (this.reqObject) {
      this.SFIObject.isActive = this.reqObject.versionStatus === 'ACTIVE' || this.reqObject.versionStatus === 'ARCHIVE';
      this.SFIObject.entityId =  this.reqObject.personEntityId;
      this.SFIObject.entityNumber = this.reqObject.personEntityNumber;
      this.SFIObject.entityType = this.getEntityDescription();
      this.SFIObject.countryName = this.getCountryName();
      this.SFIObject.involvementEndDate = this.reqObject.involvementEndDate;
      this.SFIObject.involvementStartDate = this.reqObject.involvementStartDate;
      this.SFIObject.entityName = this.getValuesFormCOIEntityObj('entityName');
      this.SFIObject.canDelete = this.reqObject.canDelete;
      this.SFIObject.isFormCompleted = this.reqObject.isFormCompleted;
      this.SFIObject.coiEntity = this.reqObject.coiEntity;
      this.SFIObject.updateTimestamp = this.reqObject.updateTimestamp;
      this.SFIObject.updateUser = this.reqObject.updateUser;
      this.SFIObject.isSignificantFinInterest = this.reqObject.isSignificantFinInterest;
      this.SFIObject.versionStatus = this.reqObject.versionStatus;
      this.setRelationshipDetails();
    }
  }

  private setRelationshipDetails(): void {
    this.SFIObject.validPersonEntityRelTypes = this.referredFrom !== 'TRAVEL_DISCLOSURE' ? this.reqObject.validPersonEntityRelTypes : this.getValidatePersonEntityRelTypes();
    this.getUnifiedPersonEntityRelationships();
    this.SFIObject.relationshipDetails = this.groupBy(this.SFIObject.validPersonEntityRelTypes, 'coiDisclosureType', 'disclosureTypeCode');
  }

  private getValidatePersonEntityRelTypes(): any[] {
    return this.reqObject.personEntityRelationships
      ?.filter(item => item.validPersonEntityRelType)?.map(item => item.validPersonEntityRelType);
  }

    private getUnifiedPersonEntityRelationships() : void{
        this.SFIObject.personRelType = [];
        const DISCLOSURE_TYPE_CODES = this.getDisclosureTypeCode();
        if (DISCLOSURE_TYPE_CODES.size) {
            this.SFIObject.personRelType = this.reqObject.perEntDisclTypeSelections?.filter(
                (type) => !DISCLOSURE_TYPE_CODES.has(type.disclosureTypeCode));
        } else {
            this.SFIObject.personRelType = this.reqObject.perEntDisclTypeSelections;
        }
        if (this.SFIObject.personRelType?.length) {
          this.SFIObject.validPersonEntityRelTypes.push(...this.SFIObject.personRelType)
        }
    }

    private getDisclosureTypeCode(): Set<string> {
        const RELATIONSHIPS = this.referredFrom !== 'TRAVEL_DISCLOSURE'
            ? this.reqObject.validPersonEntityRelTypes
            : this.reqObject.personEntityRelationships?.map(item => item?.validPersonEntityRelType);
        return new Set(RELATIONSHIPS?.map(item => item?.disclosureTypeCode)?.filter(Boolean));
    }

  private getEntityDescription(): string|null {
    return this.getValuesFormCOIEntityObj('entityType') ? this.getValuesFormCOIEntityObj('entityType').description : null;
  }

  private getCountryName(): string|null {
    return this.getValuesFormCOIEntityObj('country') ? this.getValuesFormCOIEntityObj('country').countryName : null;
  }

  private getValuesFormCOIEntityObj(value): any {
    return this.reqObject.coiEntity ? this.reqObject.coiEntity[value] : null;
  }

  private canViewRiskLevel(): void {
    const FCOI_ADMIN_RIGHTS = this.commonService.getAvailableRight(COI_DISCLOSURE_SUPER_ADMIN_RIGHTS) || this.commonService.getAvailableRight(ADMIN_DASHBOARD_RIGHTS);
    const OPA_ADMIN_RIGHTS = this.commonService.getAvailableRight(OPA_DISCLOSURE_ADMIN_RIGHTS) || this.commonService.getAvailableRight(OPA_DISCLOSURE_RIGHTS);
    const ENTITY_ADMIN_RIGHTS = this.commonService.getAvailableRight(ENTITY_RIGHTS);
    this.isAdmin = FCOI_ADMIN_RIGHTS || OPA_ADMIN_RIGHTS || ENTITY_ADMIN_RIGHTS;
  }

  openSfiDetails(entityId: number, mode: string): any {
    if(this.isTriggeredFromSlider) {
        document.body.removeAttribute("style");
        this._router.navigate(['/coi/entity-details/entity'], { queryParams: { personEntityId: entityId, personEntityNumber: this.SFIObject.entityNumber } })
    } else {
        this.viewSlider.emit({flag: true, entityId: entityId});
    }
  }

    modifySfiDetails(entityId: number, mode: string): void {
      this.$subscriptions.push(this._sharedSFIService.modifySfi({ personEntityId: entityId, personEntityNumber: this.SFIObject.entityNumber }).subscribe((res: any) => {
        if (this.isTriggeredFromSlider) {
          document.body.removeAttribute("style");
        }
        this._router.navigate(['/coi/entity-details/entity'], { queryParams: { personEntityId: res.personEntityId, personEntityNumber: res.personEntityNumber, mode: 'E'} });
      }));
    }

  deleteConfirmation() {
    this.deleteEvent.emit({eId: this.SFIObject.entityId});
  }

  activateDeactivate() {
    this.activateDeactivateEvent.emit(this.reqObject);
  }

  openReviewComment(relationshipDetails) {
    this.reviewSlider.emit({personEntityId: relationshipDetails.entityId, personEntityHeader :relationshipDetails.entityName, personEntityNumber: relationshipDetails.entityNumber});
  }

  getMessage() {
    if (this.getValuesFormCOIEntityObj('versionStatus') == 'ARCHIVE')
    return 'Entity modified';
    else if ((this.reqObject.isRelationshipActive && !this.getValuesFormCOIEntityObj('isActive')))
    return 'Entity inactivated';
  }

  checkForEntityWarning() {
    return this.SFIObject?.coiEntity?.documentStatusTypeCode != this.entityDocumentStatusType.INACTIVE && (this.getValuesFormCOIEntityObj('versionStatus') == 'ARCHIVE' || (this.reqObject.isRelationshipActive && !this.getValuesFormCOIEntityObj('isActive')));
  }

  getHelpText() {
    if (this.referredFrom != 'SFI_SUMMARY' && this.getValuesFormCOIEntityObj('versionStatus') == 'ARCHIVE')
    return 'Please click Modify button to revise Engagement';
    else if (this.referredFrom != 'SFI_SUMMARY' && (this.reqObject.isRelationshipActive && !this.getValuesFormCOIEntityObj('isActive')))
    return 'Please use Inactivate button to inactivate Engagement';
  }

  groupBy(jsonData, key, innerKey) {
    return jsonData.reduce((relationsTypeGroup, item) => {
        (relationsTypeGroup[item[key][innerKey]] = relationsTypeGroup[item[key][innerKey]] || []).push(item);
        return relationsTypeGroup;
    }, {});
  }

  isCreateTravelDisclosure() {
    this.isTravelDisclosure = [CREATE_TRAVEL_DISCLOSURE_ROUTE_URL].some(item => this._router.url.includes(item));
  }

  selectEngagement() {
    this.selectTravelEngagement.emit(this.reqObject);
  }

  viewEntityDetails() {
      this.commonService.openEntityDetailsModal(this.reqObject.entityId);
  }

}
