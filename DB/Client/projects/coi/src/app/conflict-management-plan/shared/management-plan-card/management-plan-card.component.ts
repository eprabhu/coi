import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CMP_LOCALIZE } from '../../../app-locales';
import { HTTP_ERROR_STATUS } from '../../../app-constants';
import { SharedModule } from '../../../shared/shared.module';
import { HeaderService } from '../../../common/header/header.service';
import { CommonService } from '../../../common/services/common.service';
import { DateFormatPipe } from '../../../shared/pipes/custom-date.pipe';
import { COIAttachment } from '../../../attachments/attachment-interface';
import { CmpCard, CmpCardActionEvent } from '../management-plan.interface';
import { CoiProjectType } from '../../../common/services/coi-common.interface';
import { getCodeDescriptionFormat } from '../../../common/utilities/custom-utilities';
import { DASHBOARD_CMP_CARD_FIELD_ORDER, CMP_INITIAL_VERSION_NUMBER, CMP_TYPE_PILLS,
    CMP_VERSION_STATUS_BADGE, COI_CMP_MODULE_CODE } from '../management-plan-constants';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FetchReviewCommentRO } from '../../../shared-components/coi-review-comments-slider/coi-review-comments-slider.interface';
import { MANAGE_CMP_COMMENT, MANAGE_PRIVATE_CMP_COMMENT, MANAGE_CMP_RESOLVE_COMMENTS, CMP_REVIEW_COMMENTS_COMPONENT_GROUP,
    CMP_GENERAL_COMMENTS, CMP_REVIEW_COMMENTS_COMPONENT_SORT } from '../../../shared-components/coi-review-comments/coi-review-comments-constants';

@Component({
    selector: 'app-management-plan-card',
    templateUrl: './management-plan-card.component.html',
    styleUrls: ['./management-plan-card.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, SharedModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagementPlanCardComponent implements OnInit {

    @Input() isShowViewBtn = false;
    @Input() isHistoryCard = false;
    @Input() isShowAssignAdmin = false;
    @Input() hasSameDocument = false;
    @Input() isTriggeredFromSlider = false;
    @Input() cmpDetails: CmpCard | null = null;
    @Input() cardOrder = DASHBOARD_CMP_CARD_FIELD_ORDER;

    @Output() cardActions = new EventEmitter<CmpCardActionEvent>();

    isSaving = false;
    isShowCommentBtn = true;
    cmpLocalize = CMP_LOCALIZE;
    reviewStatusBadgeClass = {};
    CMP_TYPE_PILLS = CMP_TYPE_PILLS;
    versionStatusBadgeClass = CMP_VERSION_STATUS_BADGE;
    initialVersionNumber = CMP_INITIAL_VERSION_NUMBER;
    projectTypes: Record<string, CoiProjectType> = this.commonService.getCoiProjectTypesMap();

    private hasUploadedAttachment: COIAttachment | null = null;
    private $subscriptions: Subscription[] = [];

    constructor(public commonService: CommonService,
        private _dataFormatPipe: DateFormatPipe,
        private _headerService: HeaderService,
        private _http: HttpClient) {}

    ngOnInit(): void {
        const PROJECT_END_DATE = this._dataFormatPipe.transform(this.cmpDetails?.projectEndDate);
        const PROJECT_START_DATE = this._dataFormatPipe.transform(this.cmpDetails?.projectStartDate);
        const FORMATTED_PROJECT_NUMBER = this.cmpDetails?.projectNumber ? `#${this.cmpDetails?.projectNumber}` : null;
        this.cmpDetails.projectHeader = getCodeDescriptionFormat(FORMATTED_PROJECT_NUMBER, this.cmpDetails?.projectTitle);
        this.cmpDetails.leadUnitDisplayName = getCodeDescriptionFormat(this.cmpDetails?.leadUnit, this.cmpDetails?.leadUnitName);
        this.cmpDetails.homeUnitDisplayName = getCodeDescriptionFormat(this.cmpDetails?.homeUnit, this.cmpDetails?.homeUnitName);
        this.cmpDetails.sponsorDisplayName = getCodeDescriptionFormat(this.cmpDetails?.sponsorCode, this.cmpDetails?.sponsorName);
        this.cmpDetails.primeSponsorDisplayName = getCodeDescriptionFormat(this.cmpDetails?.primeSponsorCode, this.cmpDetails?.primeSponsorName);
        this.cmpDetails.projectPeriod = getCodeDescriptionFormat(PROJECT_START_DATE, PROJECT_END_DATE);
    }

    redirectToCMP(): void {
        this._headerService.redirectToCMP(this.cmpDetails.cmpId);
    }

    private fetchAllAttachments(): Promise<void> {
        return new Promise((resolve) => {
            this.$subscriptions.push(
                this.fetchAllCmpAttachments(this.cmpDetails?.cmpId)
                    .subscribe({
                        next: (data: COIAttachment[]) => {
                            if (data?.length) {
                                this.filterLatestVersions(data);
                            } else {
                                this.hasUploadedAttachment = null;
                            }
                            resolve();
                        },
                        error: () => {
                            this.commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching attachment list');
                            this.hasUploadedAttachment = null;
                            resolve();
                        }
                    })
            );
        });
    }

    private filterLatestVersions(attachmentLists: COIAttachment[]): void {
        const ATTACHMENTS_MAP = new Map<number, COIAttachment[]>();
        attachmentLists.forEach(att => {
            const list = ATTACHMENTS_MAP.get(att.attachmentNumber) || [];
            list.push(att);
            ATTACHMENTS_MAP.set(att.attachmentNumber, list);
        });
        const CMP_ATTACHMENTS = Array.from(ATTACHMENTS_MAP.values()).map(list => {
            list.sort(
                (a, b) => (b.versionNumber ?? 0) - (a.versionNumber ?? 0)
            );
            const [LATEST, ...OLDERS] = list;
            LATEST.versionList = OLDERS.length ? OLDERS : undefined;
            return LATEST;
        });
        this.hasUploadedAttachment = CMP_ATTACHMENTS.find(att => att?.attaTypeCode === '1') || null;
    }

    fetchAllCmpAttachments(cmpId: string | number): Observable<any> {
        return this._http.get(`${this.commonService.baseUrl}/cmp/attachment/getAttachmentsByCmpId/${cmpId}`);
    }

    async downloadCmpAttachment(): Promise<void> {
        if (!this.isSaving) {
            this.isSaving = true;
            await this.fetchAllAttachments();
            if (this.hasUploadedAttachment) {
                await this._headerService.downloadCmpAttachment(this.hasUploadedAttachment);
            } else {
                this.commonService.showToast(HTTP_ERROR_STATUS, 'No uploaded attachment found.');
            }
            this.isSaving = false;
        }
    }

    openReviewComment(): void {
        const { cmpId, cmpNumber, personId } = this.cmpDetails || {};
        const IS_CMP_PERSON = personId === this.commonService.getCurrentUserDetail('personID');
        const DEFAULT_CHECK_BOX_CONFIG = [];
        const CAN_MAINTAIN_COMMENTS = this.commonService.getAvailableRight(MANAGE_CMP_COMMENT);
        const CAN_MAINTAIN_PRIVATE_COMMENTS = this.commonService.getAvailableRight(MANAGE_PRIVATE_CMP_COMMENT) || this.commonService.isCmpReviewer;
        const CAN_RESOLVE_CMP_COMMENTS = this.commonService.getAvailableRight(MANAGE_CMP_RESOLVE_COMMENTS);
        if (CAN_MAINTAIN_PRIVATE_COMMENTS) {
            DEFAULT_CHECK_BOX_CONFIG.push({
                label: 'Private',
                defaultValue: false,
                values: {
                    true: { isPrivate: true },
                    false: { isPrivate: false },
                },
            });
        }
        const REQ_BODY: FetchReviewCommentRO = {
            componentTypeCode: CMP_GENERAL_COMMENTS.componentTypeCode,
            moduleItemKey: cmpId,
            moduleItemNumber: cmpNumber,
            subModuleCode: null,
            subModuleItemKey: null,
            subModuleItemNumber: null,
            isSectionDetailsNeeded: true,
            documentOwnerPersonId: personId,
        };
        const SLIDER_CONFIG = {
            // for card config
            checkboxConfig: DEFAULT_CHECK_BOX_CONFIG,
            isEditMode: true,
            reviewCommentsSections: CMP_REVIEW_COMMENTS_COMPONENT_GROUP,
            // for payload
            ...REQ_BODY,
            moduleCode: COI_CMP_MODULE_CODE,
            isShowAllComments: true,
            isOpenCommentSlider: true,
            canMaintainComments: CAN_MAINTAIN_COMMENTS,
            canMaintainPrivateComments: CAN_MAINTAIN_PRIVATE_COMMENTS,
            isDocumentOwner: IS_CMP_PERSON,
            sortOrder: CMP_REVIEW_COMMENTS_COMPONENT_SORT,
            canResolveComments: CAN_RESOLVE_CMP_COMMENTS,
            isReviewer: this.commonService.isCmpReviewer,
            sliderHeader: `${CMP_LOCALIZE.TERM_CMP} Comments`,
        };
        this.commonService.openReviewCommentSlider(SLIDER_CONFIG);
    }

}
