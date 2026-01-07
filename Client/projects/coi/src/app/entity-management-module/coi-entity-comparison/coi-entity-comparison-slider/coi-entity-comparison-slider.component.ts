import { Component, OnInit, Input, OnDestroy, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { closeCoiSlider, getCodeDescriptionFormat, openCoiSlider } from '../../../common/utilities/custom-utilities';
import { CurrentTabType, EntireEntityDetails, EntityCompliance, EntitySponsor, EntityVersion, SubAwardOrganization } from '../../../entity-management-module/shared/entity-interface';
import { Subscription } from 'rxjs';
import { HTTP_ERROR_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { EntityComparisonService } from '../coi-entity-comparison.service';
import { ComplianceTab, ENTITY_VERSION_STATUS, INDUSTRY_CATEGORY_DESCRIPTION_FORMAT, INDUSTRY_CATEGORY_TYPE_FORMAT, OverviewTabSection, SponsorTabSection, SubawardOrganizationTab } from '../../../entity-management-module/shared/entity-constants';
import { EntityComparison } from '../coi-entity-comparison.interface';
import { getDateObjectFromTimeStamp } from '../../../common/utilities/date-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';

@Component({
    selector: 'app-coi-entity-comparison-slider',
    templateUrl: './coi-entity-comparison-slider.component.html',
    styleUrls: ['./coi-entity-comparison-slider.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoiEntityComparisonSliderComponent implements OnInit, OnDestroy {

    @Input() currentEntityId: string | number | null = null;
    @Input() currentEntityNumber: string | number | null = null;

    @Output() comparisonSliderAction = new EventEmitter();

    private TAB_SECTION_MAP = {
        'OVERVIEW': [
            OverviewTabSection.get('BASIC_DETAILS'),
            OverviewTabSection.get('COMPANY_DETAILS'),
            OverviewTabSection.get('ENTITY_RISK'),
            OverviewTabSection.get('OTHER_REFERENCE_IDS')
        ],
        'SPONSOR': [
            SponsorTabSection.get('SPONSOR_DETAILS'),
            SponsorTabSection.get('SPONSOR_RISK')
        ],
        'SUBAWARD': [
            SubawardOrganizationTab.get('SUB_AWARD_ORGANIZATION'),
            SubawardOrganizationTab.get('SUB_AWARD_RISK')
        ],
        'COMPLIANCE': [
            ComplianceTab.get('COMPLIANCE_DETAILS'),
            ComplianceTab.get('COMPLIANCE_RISK')
        ],
    };
    private $subscriptions: Subscription[] = [];

    isLoading = false;
    isOpenSlider = false;
    entityVersionList: EntityVersion[] = [];
    rightComparisonVersion: EntityVersion | null = null;
    leftComparisonVersion: EntityVersion | null = null;
    ENTITY_VERSION_STATUS = ENTITY_VERSION_STATUS;
    leftSideEntityDetails = new EntityComparison();
    rightSideEntityDetails = new EntityComparison();
    activeTab: CurrentTabType = 'OVERVIEW';

    constructor(private _cdr: ChangeDetectorRef, private _commonService: CommonService, public comparisonService: EntityComparisonService) {}

    ngOnInit(): void {
        this.isLoading = true;
        this.setSectionDetails();
        this.getAllEntityVersion(this.currentEntityNumber);
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private getAllEntityVersion(entityNumber: number | string): void {
        this.$subscriptions.push(this.comparisonService.getAllEntityVersion(entityNumber).subscribe((entityVersionList: any[]) => {
            this.entityVersionList = entityVersionList;
            this.rightComparisonVersion = this.entityVersionList?.find((version: EntityVersion) => version?.versionStatus?.toString() === ENTITY_VERSION_STATUS.ACTIVE.toString()) || null;
            this.leftComparisonVersion = this.entityVersionList?.find((version: EntityVersion) => version.entityId?.toString() === this.currentEntityId?.toString()) || null;
            // Simple swap if left version number is greater
            if (this.leftComparisonVersion && this.rightComparisonVersion && this.leftComparisonVersion.versionNumber > this.rightComparisonVersion.versionNumber) {
                [this.leftComparisonVersion, this.rightComparisonVersion] = [this.rightComparisonVersion, this.leftComparisonVersion];
            }
            this.fetchComparisonDetails();
        }, (error) => {
            this.comparisonSliderAction.emit({ action: 'SLIDER_CLOSE', content: { closeType: 'API_FAIL', isOpenSlider: this.isOpenSlider } });
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching entity version');
        }));
    }

    private fetchEntityDetails(entityId: string | number, type: 'LEFT' | 'RIGHT'): void {
        this._commonService.setLoaderRestriction();
        this.$subscriptions.push(
            this.comparisonService.getEntityDetails(entityId).subscribe(
                (entireEntityDetails: EntireEntityDetails) => {
                    const transformedDetails = this.transformEntityDetails(entireEntityDetails);
                    this.assignEntityDetails(type, transformedDetails);
                },
                (error) => {
                    this.isLoading = false;
                    this.comparisonSliderAction.emit({ action: 'SLIDER_CLOSE', content: { closeType: 'API_FAIL', isOpenSlider: this.isOpenSlider } });
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching entity overview details.');
                }
            )
        );
        this._commonService.removeLoaderRestriction();
    }
    
    private transformEntityDetails(entireEntityDetails: EntireEntityDetails): EntireEntityDetails {
        entireEntityDetails.entityIndustryClassifications = entireEntityDetails.entityIndustryClassifications.map(item => ({
            ...item,
            industryCategoryCode: {
                ...item?.industryCategoryCode,
                formattedIndustryCategoryDescription: getCodeDescriptionFormat(
                    item?.industryCategoryCode?.industryCategoryCode,
                    item?.industryCategoryCode?.description,
                    INDUSTRY_CATEGORY_DESCRIPTION_FORMAT
                ),
                industryCategoryType: {
                    ...item?.industryCategoryCode?.industryCategoryType,
                    formattedIndustryCategoryType: getCodeDescriptionFormat(
                        item?.industryCategoryCode?.industryCategoryType?.industryCategoryTypeCode,
                        item?.industryCategoryCode?.industryCategoryType?.description,
                        INDUSTRY_CATEGORY_TYPE_FORMAT
                    )
                }
            }
        }));
    
        return entireEntityDetails;
    }
    
    private assignEntityDetails(type: 'LEFT' | 'RIGHT', details: EntireEntityDetails): void {
        if (type === 'RIGHT') {
            this.rightSideEntityDetails.entireEntityDetails = details;
        } else {
            this.leftSideEntityDetails.entireEntityDetails = details;
        }
        if (this.rightSideEntityDetails?.entireEntityDetails?.entityDetails?.entityId && this.leftSideEntityDetails?.entireEntityDetails?.entityDetails?.entityId) {
            this.markChangeDetection();
        }
    }

    private fetchEntitySponsorDetails(entityId: string | number, type: 'LEFT' | 'RIGHT'): void {
        this._commonService.setLoaderRestriction();
        this.$subscriptions.push(
            this.comparisonService.fetchEntitySponsorDetails(entityId).subscribe(
                (entitySponsorDetails: EntitySponsor) => {
                    if (type === 'RIGHT') {
                        this.rightSideEntityDetails.entitySponsorDetails = entitySponsorDetails;
                    } else {
                        this.leftSideEntityDetails.entitySponsorDetails = entitySponsorDetails;
                    }
                    if (this.rightSideEntityDetails?.entitySponsorDetails && this.leftSideEntityDetails?.entitySponsorDetails) {
                        this.markChangeDetection();
                    }
                },
                (error) => {
                    this.isLoading = false;
                    this.comparisonSliderAction.emit({ action: 'SLIDER_CLOSE', content: { closeType: 'API_FAIL', isOpenSlider: this.isOpenSlider } });
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching entity sponsor details.');
                }
            )
        );
        this._commonService.removeLoaderRestriction();
    }

    private fetchEntitySubawardOrgDetails(entityId: string | number, type: 'LEFT' | 'RIGHT'): void {
        this._commonService.setLoaderRestriction();
        this.$subscriptions.push(
            this.comparisonService.fetchEntitySubawardOrgDetails(entityId).subscribe(
                (entityOrganizationDetails: SubAwardOrganization) => {
                    if (entityOrganizationDetails?.subAwdOrgDetailsResponseDTO?.samExpirationDate) {
                        entityOrganizationDetails.subAwdOrgDetailsResponseDTO.samExpirationDate = getDateObjectFromTimeStamp(entityOrganizationDetails.subAwdOrgDetailsResponseDTO.samExpirationDate);
                    }
                    if (entityOrganizationDetails?.subAwdOrgDetailsResponseDTO?.subAwdRiskAssmtDate) {
                        entityOrganizationDetails.subAwdOrgDetailsResponseDTO.subAwdRiskAssmtDate = getDateObjectFromTimeStamp(entityOrganizationDetails.subAwdOrgDetailsResponseDTO.subAwdRiskAssmtDate);
                    }
                    if (type === 'RIGHT') {
                        this.rightSideEntityDetails.entityOrganizationDetails = entityOrganizationDetails;
                    } else {
                        this.leftSideEntityDetails.entityOrganizationDetails = entityOrganizationDetails;
                    }
                    if (this.rightSideEntityDetails?.entityOrganizationDetails && this.leftSideEntityDetails?.entityOrganizationDetails) {
                        this.markChangeDetection();
                    }
                },
                (error) => {
                    this.isLoading = false;
                    this.comparisonSliderAction.emit({ action: 'SLIDER_CLOSE', content: { closeType: 'API_FAIL', isOpenSlider: this.isOpenSlider } });
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching entity sub-award organization details.');
                }
            )
        );
        this._commonService.removeLoaderRestriction();
    }

    private markChangeDetection(): void {
        this.isLoading = false;
        this.openSliderIfNot();
        this._cdr.markForCheck();
    }

    private fetchEntityComplianceDetails(entityId: string | number, type: 'LEFT' | 'RIGHT'): void {
        this._commonService.setLoaderRestriction();
        this.$subscriptions.push(
            this.comparisonService.fetchEntityComplianceDetails(entityId).subscribe(
                (entityComplianceDetails: EntityCompliance) => {
                    if (type === 'RIGHT') {
                        this.rightSideEntityDetails.entityComplianceDetails = entityComplianceDetails;
                    } else {
                        this.leftSideEntityDetails.entityComplianceDetails = entityComplianceDetails;
                    }
                    if (this.rightSideEntityDetails?.entityComplianceDetails && this.leftSideEntityDetails?.entityComplianceDetails) {
                        this.markChangeDetection();
                    }
                },
                (error) => {
                    this.isLoading = false;
                    this.comparisonSliderAction.emit({ action: 'SLIDER_CLOSE', content: { closeType: 'API_FAIL', isOpenSlider: this.isOpenSlider } });
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching entity compliance details.');
                }
            )
        );
        this._commonService.removeLoaderRestriction();
    }
    
    private openSliderIfNot(): void {
        if (!this.isOpenSlider) {
            this.isOpenSlider = true;
            setTimeout(() => {
                openCoiSlider(this.comparisonService.sliderId);
            }, 50);
        }
    }

    private fetchComparisonDetails(): void {
        this.isLoading = true;
        this.rightSideEntityDetails = new EntityComparison();
        this.leftSideEntityDetails = new EntityComparison();
        if (Number(this.rightComparisonVersion?.versionNumber) > Number(this.leftComparisonVersion?.versionNumber)) {
            this.getActiveTabApi(this.rightComparisonVersion?.entityId, 'RIGHT');
            this.getActiveTabApi(this.leftComparisonVersion?.entityId, 'LEFT');
        } else {
            this.getActiveTabApi(this.rightComparisonVersion?.entityId, 'LEFT');
            this.getActiveTabApi(this.leftComparisonVersion?.entityId, 'RIGHT');
        }
    }

    private getActiveTabApi(entityId: string | number, type: 'LEFT' | 'RIGHT'): void {
        switch (this.activeTab) {
            case 'OVERVIEW': return this.fetchEntityDetails(entityId, type);
            case 'SPONSOR': return this.fetchEntitySponsorDetails(entityId, type);
            case 'SUBAWARD': return this.fetchEntitySubawardOrgDetails(entityId, type);
            case 'COMPLIANCE': return this.fetchEntityComplianceDetails(entityId, type);
        }
    }
    
    private setSectionDetails(): void {
        const SECTION_MAP = this.TAB_SECTION_MAP[this.activeTab];
        this.comparisonService.selectedSectionId = SECTION_MAP?.[0]?.sectionId || null;
        this.comparisonService.selectedSectionDetails = SECTION_MAP?.values() ? Array.from(SECTION_MAP.values()) : [];
    }

    closeComparisonSlider(): void {
        closeCoiSlider(this.comparisonService.sliderId);
        setTimeout(() => {
            this.isOpenSlider = false;
            this.comparisonSliderAction.emit({ action: 'SLIDER_CLOSE', content: { closeType: 'MANUAL', isOpenSlider: this.isOpenSlider } });
        }, 500);
    }

    onClickMenuBar(activeTab: CurrentTabType): void {
        this.activeTab = activeTab;
        this.setSectionDetails();
        this.fetchComparisonDetails();
    }

    versionChange(version: any, versionType: 'LEFT' | 'RIGHT'): void {
        if (versionType === 'LEFT') {
            this.leftComparisonVersion = version;
        } else {
            this.rightComparisonVersion = version;
        }
        this.fetchComparisonDetails();
    }

    triggerClickForId(elementId: string): void {
        if (elementId) {
            document.getElementById(elementId).click();
        }
    }

}
