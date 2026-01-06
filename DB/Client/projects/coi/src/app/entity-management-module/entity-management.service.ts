import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../common/services/common.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { isEmptyObject, jumpToSection } from '../common/utilities/custom-utilities';
import { CancelModificationReq, DunsMailingAddress, DuplicateCheckObj, DuplicateMarkingAPIReq, EntityReviewCommentsSliderConfig, FetchEntityReviewCommentRO, SubawardOrgFields } from './shared/entity-interface';
import { NotesSectionValue } from '../app-constants';
import { ADDITIONAL_ADDRESS_FIELDS, ENTITY_ADDRESS_FIELDS, ENTITY_VALIDATE_DUPLICATE_API, GENERAL_COMMENTS, ORGANIZATION_FIELDS, SPONSOR_FIELDS } from './shared/entity-constants';
import { COIReviewCommentsConfig } from '../shared-components/coi-review-comments/coi-review-comments.interface';
import { COILeavePageModalConfig } from '../common/services/coi-common.interface';

@Injectable()
export class EntityManagementService {

    isExpandRightNav = true;
    hasChangesAvailable: boolean;
    $subscriptions: Subscription[] = [];
    selectedSectionId: string | number = '';
    selectedSubSectionId: string | number = '';
    $canShowAdditionalInformation = new Subject<boolean>();
    reviewCommentsSliderConfig = new EntityReviewCommentsSliderConfig();

    constructor(private _commonService: CommonService, private _http: HttpClient) { }

    scrollToSelectedSection(sectionId: string| number, subSectionId: string | number = ''): void {
        this.selectedSectionId = sectionId;
        this.selectedSubSectionId = subSectionId;
        const offset = (document.getElementById('COI-DISCLOSURE-HEADER')?.getBoundingClientRect().height + 100);
        setTimeout(() => {
            jumpToSection(this.selectedSubSectionId || this.selectedSectionId, offset);
        });
    }

    checkCommentsRights(sectionDetails: any): boolean {
        const RIGHTS = sectionDetails?.commentRights;
        return this._commonService.getAvailableRight([
            ...(RIGHTS?.view || []),
            ...(RIGHTS?.manage || []),
            ...(RIGHTS?.managePrivate || [])
        ]);
    }

    openReviewCommentsSlider(data: FetchEntityReviewCommentRO, reviewCommentsCardConfig?: Partial<COIReviewCommentsConfig>): void {
        const DEFAULT_CHECK_BOX_CONFIG = [];
        this.reviewCommentsSliderConfig = {
            // for card config
            ...reviewCommentsCardConfig,
            checkboxConfig: reviewCommentsCardConfig?.hasOwnProperty('checkboxConfig') ? reviewCommentsCardConfig.checkboxConfig : DEFAULT_CHECK_BOX_CONFIG,
            isEditMode: reviewCommentsCardConfig?.hasOwnProperty('isEditMode') ? reviewCommentsCardConfig.isEditMode : true,
            // for payload
            sectionTypeCode: data?.sectionTypeCode,
            commentTypeCode: data?.commentTypeCode,
            isShowAllComments: data?.sectionTypeCode === GENERAL_COMMENTS.sectionTypeCode,
            isOpenCommentSlider: true
        };
    }

    clearReviewCommentsSlider(): void {
        this.reviewCommentsSliderConfig = new EntityReviewCommentsSliderConfig();
    }

    scrollToSavedSection(): void {
        this.scrollToSelectedSection(this.selectedSectionId, this.selectedSubSectionId);
    }

    triggerEntityMandatoryValidation(): void {
        this._commonService.$globalEventNotifier.next({ uniqueId: 'TRIGGER_ENTITY_MANDATORY_VALIDATION' });
    }

    getEntityDetails(entityId: string | number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/entity/fetch/${entityId}`);
    }

    getDunsMatch(cleanseRequest: any): Observable<any> {
        return this._http.post(this._commonService.fibiCOIConnectUrl + '/fibi-coi-connect/cleansematch/entity/runCleanseMatch', cleanseRequest);
    }

    verifyEntity(entityId: string | number): Observable<any> {
        return this._http.patch(`${this._commonService.baseUrl}/entity/verify/${entityId}`, {});
    }

    fetchEntitySponsorDetails(entityId: string | number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/entity/sponsor/fetch/${entityId}`);
    }

    fetchEntitySubawardOrgDetails(entityId: string | number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/entity/organization/fetch/${entityId}`);
    }

    updateIsDUNSMatchFlag(changedRO: any): Observable<any> {
        return this._http.patch(this._commonService.baseUrl + '/entity/update', changedRO);
    }

    logFeedHistory(tabDetails: any): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/entity/logAction', tabDetails);
    }

    triggerEnrichAPI(enrichRequest: any): Observable<any> {
        return this._http.post(this._commonService.fibiCOIConnectUrl + '/fibi-coi-connect/enrich/entity/runEnrich', enrichRequest);
    }

    activateEntity(reqObj: {entityId: number | string, comment: string}): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/entity/activate', reqObj);
    }

    inActivateEntity(reqObj: {entityId: number | string, comment: string}): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/entity/inactivate', reqObj);
    }

    entityHistory(entityId: number | string): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/entity/fetchHistory/${entityId}`);
    }

    checkForDuplicate(duplicateCheckObj: DuplicateCheckObj): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/${ENTITY_VALIDATE_DUPLICATE_API}`, duplicateCheckObj);
    }

    validateEntityDetails(entityId: number | string): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/entity/validateEntityDetails/${entityId}`);
    }

    markAsDuplicate(entityDetails: DuplicateMarkingAPIReq): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/entity/markDuplicate`, entityDetails);
    }

    fetchStatusList(): Observable<any> {
        return this._http.get(this._commonService.baseUrl + '/entity/fetchEntityDocumentStatuses');
    }

    fetchOverviewNotes(sectionCode: NotesSectionValue, entityId: number | string): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/entity/notes/fetchAllBySectionCode/${sectionCode}/${entityId}`);
    }

    modifyEntity(entityId: number | string, entityNumber: number | string): Observable<any> {
        return this._http.patch(`${this._commonService.baseUrl}/entity/modify/${entityId}/${entityNumber}`, {});
    }

    getAllEntityVersion(entityNumber: number | string): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/entity/version/${entityNumber}`);
    }

    getReviewCommentsCounts(entityNumber: number | string): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/entity/comments/count/${entityNumber}`);
    }

    cancelModification(entityDetails: CancelModificationReq): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/entity/cancelModification', entityDetails);
    }

    openEntityLeaveModal(): void {
        const CONFIG = new COILeavePageModalConfig();
        CONFIG.triggeredFrom = 'CREATE_ENTITY_LEAVE_PAGE';
        CONFIG.unsavedChangesPageName = 'Entity creation';
        this._commonService.openCOILeavePageModal(CONFIG);
    }

    unlinkDnbMatchDetails(entityId): Observable<any> {
        return this._http.patch(`${this._commonService.baseUrl}/entity/unlinkDnbMatchDetails/${entityId}`, {});
    }
}

export function getEntityFullAddress(entityDetails: any, valuesToAdd: string[] = ENTITY_ADDRESS_FIELDS): string {
    const COUNTRY_NAME = entityDetails?.country?.countryName?.trim() || null;
    const STATE_NAME = entityDetails?.stateDetails?.stateName?.trim() || entityDetails?.state?.trim() || null;
    const ADDRESS_PARTS = valuesToAdd
        .map(key => {
            if (key === 'state') return STATE_NAME
            if (key === 'countryCode') return COUNTRY_NAME;
            return entityDetails?.[key]?.trim();
        }).filter(Boolean); // Remove undefined or empty values
    return ADDRESS_PARTS.join(', ');
}

export function getMailingAddressString(mailingAddress: DunsMailingAddress): string {
    if (!mailingAddress) return '';
    const ADDRESS = {
        addressLine1: mailingAddress?.streetAddress?.line1,
        addressLine2: mailingAddress?.streetAddress?.line2,
        city: mailingAddress?.addressLocality?.name,
        postCode: mailingAddress?.postalCode,
        stateDetails: { stateName:  mailingAddress?.addressRegion?.name },
        country: { countryName: mailingAddress?.addressCountry?.name }
    }
    return getEntityFullAddress(ADDRESS, ADDITIONAL_ADDRESS_FIELDS);
}

export function canUpdateSponsorFeed(reqObj): boolean {
    if(reqObj && !isEmptyObject(reqObj)) {
        return Object.keys(reqObj).some(key => SPONSOR_FIELDS.includes(key));
    } else {
        return false;
    }
}

export function canUpdateOrgFeed(reqObj: SubawardOrgFields): boolean {
    if(reqObj && !isEmptyObject(reqObj)) {
    return Object.keys(reqObj).some(key => ORGANIZATION_FIELDS.includes(key));
    } else {
        return false;
    }
}
