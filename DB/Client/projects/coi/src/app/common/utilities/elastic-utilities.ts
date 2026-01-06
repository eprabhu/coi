import { ElasticEntityResult, ElasticEntitySource } from "../../entity-management-module/shared/entity-interface";
import { ElasticPersonSource, ElasticPersonResult, ElasticRolodexResult, ElasticRolodexSource } from "../services/coi-common.interface";
import { combineAddress } from "./custom-utilities";

export function setEntityObjectFromElasticResult(elasticSource: ElasticEntitySource): ElasticEntityResult {
    return {
        entityId: elasticSource?.entity_id,
        entityNumber: elasticSource?.entity_number,
        entityName: elasticSource?.entity_name,
        versionNumber: elasticSource?.version_number,
        versionStatus: elasticSource?.version_status,
        entityStatusCode: elasticSource?.entity_status_code,
        entityStatus: {
            entityStatusCode: elasticSource?.entity_status_code,
            description: elasticSource?.entity_status
        },
        entityOwnershipTypeCode: elasticSource?.entity_ownership_type_code,
        entityOwnershipType: {
            ownershipTypeCode: elasticSource?.entity_ownership_type_code,
            description: elasticSource?.entity_ownership
        },
        riskCategoryCode: elasticSource?.risk_category_code,
        entityRiskCategory: {
            riskCategoryCode: elasticSource?.risk_category_code,
            description: elasticSource?.risk_category
        },
        createUser: elasticSource?.create_user,
        updateUser: elasticSource?.update_user,
        revisionReason: elasticSource?.revision_reason,
        phone: elasticSource?.phone,
        countryCode: elasticSource?.country_code,
        country: {
            countryCode: elasticSource?.country_code,
            countryName: elasticSource?.country_name
        },
        city: elasticSource?.city,
        address: combineAddress(elasticSource?.primary_address_line_1, elasticSource?.primary_address_line_2),
        primaryAddressLine1: elasticSource?.primary_address_line_1,
        primaryAddressLine2: elasticSource?.primary_address_line_2,
        zipCode: elasticSource?.zip_code,
        emailAddress: elasticSource?.email_address,
        isActive: elasticSource?.is_active,
        webURL: elasticSource?.web_url,
        createTimestamp: elasticSource?.create_timestamp,
        updateTimestamp: elasticSource?.update_timestamp,
        approvedUser: elasticSource?.approved_user,
        approvedTimestamp: elasticSource?.approved_timestamp,
        updatedUserFullName: elasticSource?.update_user_full_name,
        createUserFullName: elasticSource?.create_user_full_name,
        dunsNumber: elasticSource?.duns_number,
        foreignName: elasticSource?.foreign_name,
        ueiNumber: elasticSource?.uei_number,
        priorName: elasticSource?.prior_name,
        cageNumber: elasticSource?.cage_number,
        organizationId: elasticSource?.organization_id,
        sponsorCode: elasticSource?.sponsor_code,
        state: elasticSource?.state,
        businessType: {
            businessTypeCode: elasticSource?.business_type_code,
            description: elasticSource?.entity_business
        },
        coiEntityType: {
            entityTypeCode: elasticSource?.entity_type_code,
            description: elasticSource?.entity_type
        },
        isForeign: elasticSource?.is_foreign === 'Y',
    }

}

export function setPersonObjectFromElasticResult(elasticSource: ElasticPersonSource): ElasticPersonResult {
    return {
        personId: elasticSource?.prncpl_id,
        fullName: elasticSource?.full_name,
        principalName: elasticSource?.prncpl_nm,
        primaryTitle: elasticSource?.primary_title,
        directoryTitle: elasticSource?.directory_title,
        emailAddress: elasticSource?.email_addr,
        mobileNumber: elasticSource?.phone_nbr,
        addressLine1: elasticSource?.addr_line_1,
        unit: {
            unitNumber: elasticSource?.unit_number,
            unitName: elasticSource?.unit_name,
            displayName: elasticSource?.unit_display_name
        },
        isExternalUser: elasticSource?.external === 'Y',
        timestamp: elasticSource?.["@timestamp"],
        version: elasticSource?.["@version"]
    };
}

export function setRolodexObjectFromElasticResult(elasticSource: ElasticRolodexSource): ElasticRolodexResult {
    return {
        rolodexId: elasticSource?.rolodex_id,
        fullName: elasticSource?.full_name,
        firstName: elasticSource?.first_name,
        middleName: elasticSource?.middle_name,
        lastName: elasticSource?.last_name,
        emailAddress: elasticSource?.email_address,
        phoneNumber: elasticSource?.phone_number,
        designation: elasticSource?.designation,
        addressLine1: elasticSource?.address,
        city: elasticSource?.city,
        state: elasticSource?.state,
        postalCode: elasticSource?.postal_code,
        country: {
            countryName: elasticSource?.country,
        },
        createUser: elasticSource?.create_user,
        organizations: {
            organizationId: elasticSource?.organization_id,
            organizationName: elasticSource?.organization_name,
            organizationDisplayName: elasticSource?.organization_display_name
        },
        organizationName: elasticSource?.organization_name,
        timestamp: elasticSource?.["@timestamp"],
        version: elasticSource?.["@version"]
    };

}
