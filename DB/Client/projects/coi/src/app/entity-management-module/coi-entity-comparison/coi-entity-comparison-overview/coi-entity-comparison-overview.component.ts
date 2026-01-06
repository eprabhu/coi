import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { AdditionalAddress, EntireEntityDetails } from '../../../entity-management-module/shared/entity-interface';
import { getEntityFullAddress } from '../../../entity-management-module/entity-management.service';
import { EntityComparisonData } from '../coi-entity-comparison.interface';
import { compareGroupedData, EntityComparisonService } from '../coi-entity-comparison.service';
import { ADDITIONAL_ADDRESS_FIELDS, COMPANY_DETAILS_SUB_SECTION, OverviewTabSection } from '../../../entity-management-module/shared/entity-constants';
import { ENTITY_FIELD_CONFIGS, ENTITY_OTHER_DETAILS_FIELD_CONFIGS } from '../coi-entity-comparison.constants';

@Component({
    selector: 'app-coi-entity-comparison-overview',
    templateUrl: './coi-entity-comparison-overview.component.html',
    styleUrls: ['./coi-entity-comparison-overview.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoiEntityComparisonOverviewComponent implements OnInit {

    @Input() leftSideEntityDetails = new EntireEntityDetails();
    @Input() rightSideEntityDetails = new EntireEntityDetails();

    groupedLeftSideIndustry = {};
    groupedRightSideIndustry = {};
    overviewTabSection = OverviewTabSection;
    entityFieldConfigs = ENTITY_FIELD_CONFIGS;
    overviewRisks = new EntityComparisonData();
    industryDetails = new EntityComparisonData();
    additionalAddress = new EntityComparisonData();
    externalReferences = new EntityComparisonData();
    registrationDetails = new EntityComparisonData();
    companyDetailsSubSection = COMPANY_DETAILS_SUB_SECTION;
    entityOtherDetailsFieldConfigs = ENTITY_OTHER_DETAILS_FIELD_CONFIGS;

    constructor(public comparisonService: EntityComparisonService) { }

    ngOnInit(): void {
        this.compareMailingAddress();
        this.compareRegistrationDetails();
        this.compareOtherReferenceId();
        this.compareIndustryDetails();
    }

    private compareOtherReferenceId(): void {
        this.externalReferences = new EntityComparisonData();
        compareGroupedData(
            this.leftSideEntityDetails?.entityExternalIdMappings || [],
            this.rightSideEntityDetails?.entityExternalIdMappings || [],
            'externalIdTypeCode',
            ['description', 'externalId'],
            this.externalReferences
        );
    }

    private compareRegistrationDetails(): void {
        this.registrationDetails = new EntityComparisonData();
        compareGroupedData(
            this.leftSideEntityDetails?.entityRegistrations || [],
            this.rightSideEntityDetails?.entityRegistrations || [],
            'regTypeCode',
            ['regNumber'],
            this.registrationDetails
        );
    }

    private compareMailingAddress(): void {
        this.additionalAddress = new EntityComparisonData();
        compareGroupedData(
            this.leftSideEntityDetails?.entityMailingAddresses || [],
            this.rightSideEntityDetails?.entityMailingAddresses || [],
            'addressTypeCode',
            ADDITIONAL_ADDRESS_FIELDS,
            this.additionalAddress
        );
    }

    private groupIndustryData(data: any[]): Record<string, { industryCategoryType: string; entries: Record<string, any> }> {
        return data.reduce((acc, item) => {
            const INDUSTRY_CATEGORY_TYPE_CODE = item?.industryCategoryCode?.industryCategoryTypeCode;
            const INDUSTRY_CATEGORY_TYPE = item?.industryCategoryCode?.industryCategoryType;
            const INDUSTRY_CATEGORY_CODE = item?.industryCategoryCode?.industryCategoryCode;
    
            if (!acc[INDUSTRY_CATEGORY_TYPE_CODE]) {
                acc[INDUSTRY_CATEGORY_TYPE_CODE] = {
                    industryCategoryType: INDUSTRY_CATEGORY_TYPE,
                    entries: {}
                };
            }
    
            acc[INDUSTRY_CATEGORY_TYPE_CODE].entries[INDUSTRY_CATEGORY_CODE] = item;
            return acc;
        }, {} as Record<string, { industryCategoryType: string; entries: Record<string, any> }>);
    }
    
    private compareIndustryDetails(): void {
        this.industryDetails = new EntityComparisonData();
        const LEFT_INDUSTRY_DETAILS = this.leftSideEntityDetails.entityIndustryClassifications;
        const RIGHT_INDUSTRY_DETAILS = this.rightSideEntityDetails.entityIndustryClassifications;
    
        this.groupedLeftSideIndustry = this.groupIndustryData(LEFT_INDUSTRY_DETAILS);
        this.groupedRightSideIndustry = this.groupIndustryData(RIGHT_INDUSTRY_DETAILS);
    
        const ALL_TYPE_CODES = new Set([
            ...Object.keys(this.groupedLeftSideIndustry || {}),
            ...Object.keys(this.groupedRightSideIndustry || {}),
        ]);
    
        ALL_TYPE_CODES.forEach((typeCode) => {
            const LEFT_GROUP = this.groupedLeftSideIndustry[typeCode];
            const RIGHT_GROUP = this.groupedRightSideIndustry[typeCode];
    
            const LEFT_KEYS = Object.keys(LEFT_GROUP?.entries || {});
            const RIGHT_KEYS = Object.keys(RIGHT_GROUP?.entries || {});
            const ALL_SUB_KEYS = Array.from(new Set([...LEFT_KEYS, ...RIGHT_KEYS]));
    
            const TYPE_NAME = LEFT_GROUP?.industryCategoryType || RIGHT_GROUP?.industryCategoryType || '';
    
            if (!LEFT_GROUP) {
                this.industryDetails.ADD.push({
                    industryCategoryTypeCode: typeCode,
                    industryCategoryType: TYPE_NAME,
                    industryCategoryCodes: ALL_SUB_KEYS,
                });
            } else if (!RIGHT_GROUP) {
                this.industryDetails.DELETE.push({
                    industryCategoryTypeCode: typeCode,
                    industryCategoryType: TYPE_NAME,
                    industryCategoryCodes: ALL_SUB_KEYS
                });
            } else {
                const IS_MATCH = LEFT_KEYS.length === RIGHT_KEYS.length && LEFT_KEYS.every(key => RIGHT_KEYS.includes(key));
                let shouldUpdate = !IS_MATCH;

                if (IS_MATCH) {
                    for (const code of ALL_SUB_KEYS) {
                        if (LEFT_GROUP.entries?.[code]?.isPrimary !== RIGHT_GROUP.entries?.[code]?.isPrimary) {
                            shouldUpdate = true;
                            break;
                        }
                    }
                }
                const TARGET_ARRAY = shouldUpdate ? this.industryDetails.UPDATE : this.industryDetails.NO_CHANGE;
                TARGET_ARRAY.push({
                    industryCategoryTypeCode: typeCode,
                    industryCategoryType: TYPE_NAME,
                    industryCategoryCodes: ALL_SUB_KEYS
                });

            }
        });
    }    

    getEntityFullAddress(entityOtherAddress: AdditionalAddress): string {
        return getEntityFullAddress(entityOtherAddress, ADDITIONAL_ADDRESS_FIELDS);
    }

}
