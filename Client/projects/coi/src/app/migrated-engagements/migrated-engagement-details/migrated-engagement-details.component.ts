import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject, Subscription } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { CommonService } from '../../common/services/common.service';
import { COMMON_ERROR_TOAST_MSG, ENTITY_SOURCE_TYPE_CODE, HTTP_ERROR_STATUS } from '../../app-constants';
import { MIG_ENG_ENTITY_HEADER_TEXT, MIG_ENG_ENTITY_HELP_TEXT, Step } from '../migrated-engagement-constants';
import { MigratedEngagementsService } from '../migrated-engagements.service';
import { CreateEntityRO, DnBRO, EngagementCardActionEvent, EngagementDetails, EntityCardActionEvent, EntityStepType, MigratedEntityCardConfig } from '../migrated-engagements-interface';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { EntityCreationConfig } from '../../common/services/coi-common.interface';
import { EntityOwnershipType, EntityUpdateClass } from '../../entity-management-module/shared/entity-interface';
import { combineAddress } from '../../common/utilities/custom-utilities';
import { ENTITY_MANDATORY_REPORTER_FIELDS } from '../../entity-management-module/shared/entity-constants';

@Component({
    selector: 'app-migrated-engagement-details',
    templateUrl: './migrated-engagement-details.component.html',
    styleUrls: ['./migrated-engagement-details.component.scss']
})
export class MigratedEngagementDetailsComponent implements OnInit, OnDestroy {

    engagementDetails = new EngagementDetails();
    $subscriptions: Subscription[] = [];
    engagementId: string = '';
    $fetchEntities = new Subject();
    isLoading = true;
    isShowFooter = false;
    selectedEntityId: string | number = 0;
    helpText: string = MIG_ENG_ENTITY_HELP_TEXT.INITIAL_TEXT;
    customHeader: string = MIG_ENG_ENTITY_HEADER_TEXT.INITIAL_TEXT;
    matchedEntities: any;
    cardDetails: MigratedEntityCardConfig[] = [];
    isCreateEntity = false;
    hasDbEntities = false;
    hasDunsMatches = false;
    currentStep: Step = Step.DB_ENTITIES;
    $performAction = new Subject<'SAVE_AND_VALIDATE' | 'VALIDATE_ONLY'>();
    entityCreationConfig = new EntityCreationConfig();
    newEntityDetails = new CreateEntityRO();
    entityListMap: Record<EntityStepType, MigratedEntityCardConfig[] | any[]> = {
        DB_ENTITIES: null,
        DNB_ENTITIES: null
    };

    constructor(private _migratedEngagementService: MigratedEngagementsService,
        private _commonService: CommonService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute
    ) { }

    ngOnInit() {
        this.fetchEntityList();
        this.listenQueryParamChange();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }
    // Checks query params and loads engagement and entity details if engagementId exists
    private listenQueryParamChange(): void {
        this.$subscriptions.push(
            this._activatedRoute.queryParams.subscribe(params => {
                const ENGAGEMENT_ID = Number(params['engagementId']);
                if (!ENGAGEMENT_ID) {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Invalid Engagement Id');
                    this.navigateToEngMigScreen();
                } else {
                    this.engagementId = String(ENGAGEMENT_ID);
                    this.fetchEngagementDetails();
                    this.$fetchEntities.next();
                }
            })
        );
    }
    // Fetches entities from DB, displays cards if available, otherwise shows entity creation form
    private fetchEntityList(): void {
        this.$subscriptions.push(
            this.$fetchEntities.pipe(
                switchMap(() => {
                    this.setDefaultEntityValues();
                    return this._migratedEngagementService.getEntitiesFromDB(this.engagementId).pipe(
                        catchError((error) => {
                            this.isLoading = false;
                            this.showCreateEntityForm();
                            this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching entity details.');
                            return of(null);
                        })
                    );
                })
            ).subscribe(
                (data: MigratedEntityCardConfig[]) => {
                    if (data?.length) {
                        this.updateEntityCardDetails(data);
                    } else {
                        this.showCreateEntityForm();
                    }
                }
            )
        );
    }
    // Sets card data, flags, help text, and header for displaying DB entities
    private updateEntityCardDetails(data: MigratedEntityCardConfig[]): void {
        this.cardDetails = data;
        this.entityListMap.DB_ENTITIES = data;
        this.hasDbEntities = true;
        this.hasDunsMatches = false;
        this.isLoading = false;
        this.helpText = MIG_ENG_ENTITY_HELP_TEXT.INITIAL_TEXT;
        this.customHeader = MIG_ENG_ENTITY_HEADER_TEXT.INITIAL_TEXT;
        this.isCreateEntity = false;
        this.currentStep = Step.DB_ENTITIES;
    }
    //Sets default data before fetching entity list
    private setDefaultEntityValues(): void {
        this.cardDetails = [];
        this.isLoading = true;
        this.hasDbEntities = false;
        this.hasDunsMatches = false;
        this.isCreateEntity = false;
    }
    // Fetches engagement details, updates engagement card and configures entity creation details
    private fetchEngagementDetails(): void {
        this.$subscriptions.push(this._migratedEngagementService.getLegacyEngagementDetails(this.engagementId)
            .subscribe((data: EngagementDetails) => {
                if (data) {
                    this.engagementDetails = data;
                    this.setEntityCreationConfig();
                }
            }, (error: any) => {
                this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            }));
    }
    // Creates entity from DUNS match and navigates to engagement creation screen (currently unused)
    private createEntityFromDUNS(entityDetails: any): void {
        entityDetails.entityId = null;
        const MODIFIED_PAYLOAD = this.getCreateEntityPayload(entityDetails);
        this.$subscriptions.push(this._commonService.createEntity(MODIFIED_PAYLOAD).subscribe((data: any) => {
            if (data) {
                this.selectedEntityId = data.entityId;
                this.navigateToEngagementCreation(this.selectedEntityId);
            }
        }, (error) => {
            this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }));
    }
    // Sets payload for entity creation from DUNS match (currently unused)
    private getCreateEntityPayload(entityRequestFields: any): EntityUpdateClass {
        const MODIFIED_PAYLOAD: EntityUpdateClass = { ...entityRequestFields };
        delete MODIFIED_PAYLOAD.entityRequestFields?.country;
        delete MODIFIED_PAYLOAD.entityRequestFields?.stateDetails;
        delete MODIFIED_PAYLOAD.entityRequestFields?.coiEntityType;
        delete MODIFIED_PAYLOAD.entityRequestFields?.entityOwnershipType;
        MODIFIED_PAYLOAD.entityRequestFields.entitySourceTypeCode = ENTITY_SOURCE_TYPE_CODE.DISCLOSURE_REPORTER;
        return MODIFIED_PAYLOAD;
    }
    // Formats and maps DUNS match response for card display (currently unused)
    private formatResponse(entity: any): MigratedEntityCardConfig {
        const entityDetails = new MigratedEntityCardConfig();
        entityDetails.entityName = entity.organization?.primaryName || '';
        entityDetails.state = entity.organization?.primaryAddress?.addressRegion?.name || '';
        entityDetails.dunsNumber = entity.organization?.duns;
        entityDetails.primaryAddress = combineAddress(
            entity.organization?.primaryAddress?.streetAddress?.line1,
            entity.organization?.primaryAddress?.streetAddress?.line2
        );
        entityDetails.city = entity.organization?.primaryAddress?.addressLocality?.name || '';
        entityDetails.country = entity.organization?.primaryAddress?.addressCountry?.name || '';
        entityDetails.postalCode = entity.organization?.primaryAddress?.postalCode || '';
        entityDetails.matchQualityInformation = entity?.matchQualityInformation?.confidenceCode;
        entityDetails.cageNumber = entity.organization?.cageNumber;
        entityDetails.ueiNumber = entity.organization?.uei;
        entityDetails.ownershipType = entity.organization?.ownershipTypeDescription;
        entityDetails.website = entity.organization?.websiteAddress?.[0]?.url;
        entityDetails.businessType = entity.organization?.businessEntityType?.description;
        return entityDetails;
    }
    //Constructs a DnB request payload using engagement entity name (currently unused)
    private getReqObj(): DnBRO {
        const REQUEST_OBJECT = new DnBRO();
        REQUEST_OBJECT.sourceDataName = this.engagementDetails?.entityName || '';
        REQUEST_OBJECT.sourceDunsNumber = '';
        REQUEST_OBJECT.addressLine1 = '';
        REQUEST_OBJECT.addressLine2 = '';
        REQUEST_OBJECT.countryCode = 'IN';
        REQUEST_OBJECT.state = '';
        REQUEST_OBJECT.postalCode = '';
        REQUEST_OBJECT.emailAddress = '';
        REQUEST_OBJECT.entityId = null;
        REQUEST_OBJECT.entityNumber = null;
        return REQUEST_OBJECT;
    }
    // Navigates to engagement creation screen and sets required query parameters
    private navigateToEngagementCreation(entityId: any): void {
        this._router.navigate(['/coi/create-sfi/create'], {
            queryParams: {
                type: 'SFI',
                entityId: entityId,
                engagementId: this.engagementId
            }
        });
    }
    // Checks for DUNS matches; if found, sets card data and flags, else shows entity creation form (currently unused)
    private checkDunsMatch(): void {
        this.isLoading = true;
        this.cardDetails = [];
        this.hasDunsMatches = false;
        this.$subscriptions.push(this._migratedEngagementService.getDunsMatch(this.getReqObj()).subscribe({
            next: (data: any) => {
                const matches = data?.matchCandidates || [];
                if (matches.length) {
                    this.hasDunsMatches = true;
                    this.cardDetails = matches.map(this.formatResponse);
                    this.isCreateEntity = false;
                    this.isLoading = false;
                    this.entityListMap.DNB_ENTITIES = this.cardDetails;
                    this.helpText = MIG_ENG_ENTITY_HELP_TEXT.DNB_TEXT;
                    this.customHeader = MIG_ENG_ENTITY_HEADER_TEXT.DNB_TEXT;
                    this.currentStep = Step.DUNS_MATCHES;
                } else {
                    this.isLoading = false;
                    this.showCreateEntityForm();
                }
            },
            error: () => {
                this.isLoading = false;
                this.hasDunsMatches = false;
            }
        }));
    }
    // Sets required flags, header, current step and displays the entity creation form
    showCreateEntityForm(): void {
        this.isCreateEntity = true;
        this.cardDetails = [];
        this.customHeader = MIG_ENG_ENTITY_HEADER_TEXT.CREATE_ENTITY_TEXT;
        this.currentStep = Step.CREATE_ENTITY;
        this.isLoading = false;
    }
    // Sets prepopulated values and configures required settings for entity creation
    private setEntityCreationConfig(): void {
        this.entityCreationConfig.entityDetails.entityName = this.engagementDetails?.entityName?.trim();
        const OWNERSHIP_DETAILS: EntityOwnershipType = {
            ownershipTypeCode: this.engagementDetails?.ownershipTypeCode
        };
        this.entityCreationConfig.entityDetails.entityOwnershipType = OWNERSHIP_DETAILS;
        this.entityCreationConfig.entityDetails.entityOwnershipTypeCode = OWNERSHIP_DETAILS.ownershipTypeCode;
        this.entityCreationConfig.mandatoryFieldsList = ENTITY_MANDATORY_REPORTER_FIELDS;
        this.entityCreationConfig.triggeredFrom = 'ENGAGEMENT_ADD';
        this.entityCreationConfig.isCreateView = true;
        this.entityCreationConfig.canNavigateToEntity = false;
    }
    //Navigate to engagement migration screen
    navigateToEngMigScreen(): void {
        this._router.navigate(['/coi/migrated-engagements']);
    }
    // Sets selected entity ID and navigates to engagement creation; creates entity first if it's a DUNS match (currently unused)
    entityCardActions(event: EntityCardActionEvent): void {
        this.selectedEntityId = this.hasDunsMatches ? event?.entityDetails?.dunsNumber : event?.entityDetails?.entityId;
        this.newEntityDetails.entityRequestFields = event?.entityDetails;
        if (event?.action === 'PROCEED') {
            if (this.hasDunsMatches) {
                this.createEntityFromDUNS(this.newEntityDetails);
            } else {
                this.navigateToEngagementCreation(this.selectedEntityId);
            }
        }
    }
    // Opens the slider to display migrated engagement details and matrix if the engagement is financial
    engagementCardActions(event: EngagementCardActionEvent): void {
        if (event?.action === 'VIEW' && event?.engagementDetails?.engagementId) {
            this._migratedEngagementService.openEngagementSlider(event.engagementDetails);
        }
    }
    //Shows the entity creation form when the user clicks create entity button
    handleCreateOrMatch(): void {
        if (this.currentStep === Step.DB_ENTITIES) {
            this.showCreateEntityForm();
        }
    }
    //Creates new entity
    createNewEntity(): void {
        this.$performAction.next('SAVE_AND_VALIDATE');
    }
    //Receives newly created entity details and navigates to the engagement creation screen
    getNewEntityDetails(event: EntityUpdateClass): void {
        this.navigateToEngagementCreation(event?.entityId);
    }
    // Handles back navigation based on the current step and availability of DB entities or DUNS matches
    navigateToBack(): void {
        if (this.currentStep === Step.CREATE_ENTITY) {
            if (this.hasDunsMatches) {
                this.checkDunsMatch();
            } else
                if (this.hasDbEntities) {
                    this.$fetchEntities.next();
                } else {
                    this.navigateToEngMigScreen();
                }
        } else if (this.currentStep === Step.DUNS_MATCHES) {
            if (this.hasDbEntities) {
                this.$fetchEntities.next();
            } else {
                this.navigateToEngMigScreen();
            }
        }
        else {
            this.navigateToEngMigScreen();
        }
    }

}
