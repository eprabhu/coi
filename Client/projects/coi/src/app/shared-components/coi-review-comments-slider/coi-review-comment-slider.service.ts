import { Injectable } from '@angular/core';
import { DISCLOSURE_TYPE, TRAVEL_MODULE_CODE, OPA_MODULE_CODE, COI_MODULE_CODE, COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS } from '../../app-constants';
import {
    OPA_GENERAL_COMMENTS,
    TRAVEL_GENERAL_COMMENTS,
    MANAGE_FCOI_DISCLOSURE_COMMENT,
    MANAGE_PRIVATE_FCOI_DISCLOSURE_COMMENT,
    MANAGE_TRAVEL_DISCLOSURE_COMMENT,
    MANAGE_PRIVATE_TRAVEL_DISCLOSURE_COMMENT,
    MANAGE_OPA_DISCLOSURE_COMMENT,
    MANAGE_PRIVATE_OPA_DISCLOSURE_COMMENT,
    TRAVEL_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_GROUP,
    OPA_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_GROUP,
    FCOI_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_GROUP,
    TRAVEL_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_SORT,
    OPA_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_SORT,
    FCOI_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_SORT,
    FCOI_ADMINISTRATOR_COMMENTS, CA_COMMENTS,
    FCOI_QUESTIONNAIRE_COMMENTS,
    FCOI_ENGAGEMENT_COMMENTS,
    FCOI_PROJECT_COMMENTS, FCOI_RELATIONSHIP_COMMENTS, FCOI_CERTIFICATION_COMMENTS,
    FCOI_REVIEW_COMMENTS, FCOI_GENERAL_COMMENTS,
    MAINTAIN_COI_RESOLVE_COMMENTS, MANAGE_TRAVEL_RESOLVE_COMMENTS,
    MANAGE_OPA_RESOLVE_COMMENTS
} from '../coi-review-comments/coi-review-comments-constants';
import { COIReviewCommentCheckbox, COIReviewCommentsConfig, ReviewCommentSection } from '../coi-review-comments/coi-review-comments.interface';
import { COIReviewCommentsSliderConfig, CommentCheckboxConfig, CommentRights, DisclosureDetails, FetchReviewCommentRO, Projects } from './coi-review-comments-slider.interface';
import { CommonService } from '../../common/services/common.service';
import { ProjectSfiRelationLoadRO, ProjectSfiRelations } from '../../disclosure/coi-interface';
import { CoiDashboardDisclosureType } from '../../common/services/coi-common.interface';

@Injectable()
export class CoiReviewCommentSliderService {

    reviewCommentsSliderConfig = new COIReviewCommentsSliderConfig();
    $subscriptions = [];
    disclosureProjectList: Projects[];

    private moduleCodeMap: Partial<Record<CoiDashboardDisclosureType, number>> = {
        TRAVEL: TRAVEL_MODULE_CODE,
        OPA: OPA_MODULE_CODE,
        FCOI: COI_MODULE_CODE
    };

    private reviewSectionsMap: Partial<Record<CoiDashboardDisclosureType, Record<string, ReviewCommentSection>>> = {
        TRAVEL: TRAVEL_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_GROUP,
        OPA: OPA_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_GROUP,
        FCOI: FCOI_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_GROUP
    };

    private sortOrderMap: Partial<Record<CoiDashboardDisclosureType, (string | number)[]>> = {
        TRAVEL: TRAVEL_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_SORT,
        OPA: OPA_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_SORT,
        FCOI: FCOI_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_SORT
    };

    constructor(private _commonService: CommonService) { }

    async initializeReviewCommentSlider(disclosureData?: DisclosureDetails): Promise<void> {
        const IS_FCOI = !!disclosureData?.coiDisclosureId;
        const IS_TRAVEL = !!disclosureData?.travelDisclosureId;
        const IS_OPA = !!disclosureData?.opaDisclosureId;
        const IS_CONSULTING = !!disclosureData?.disclosureId; //Consulting disclosure is currently not in use. It is initialized here for future implementation once the comment functionality for consulting disclosure is developed.
        const COMPONENT_TYPE_CODE = IS_TRAVEL ? TRAVEL_GENERAL_COMMENTS?.componentTypeCode : (IS_OPA ? OPA_GENERAL_COMMENTS.componentTypeCode : FCOI_GENERAL_COMMENTS?.componentTypeCode);
        const MODULE_ITEM_KEY = IS_TRAVEL ? disclosureData?.travelDisclosureId : (IS_OPA ? disclosureData?.opaDisclosureId : disclosureData?.coiDisclosureId);
        const MODULE_ITEM_NUMBER = IS_TRAVEL ? disclosureData?.travelNumber : (IS_OPA ? disclosureData?.opaDisclosureNumber : disclosureData?.coiDisclosureNumber);
        const REQ_BODY: FetchReviewCommentRO = {
            componentTypeCode: COMPONENT_TYPE_CODE,
            moduleItemKey: MODULE_ITEM_KEY,
            moduleItemNumber: MODULE_ITEM_NUMBER,
            subModuleCode: null,
            subModuleItemKey: null,
            subModuleItemNumber: null,
            isSectionDetailsNeeded: true,
            documentOwnerPersonId: disclosureData?.personId
        }
        if (IS_FCOI) {
            await this.loadProjectRelationsFromApi(disclosureData);
            REQ_BODY.projects = this.disclosureProjectList;
        }
        this.setReviewCommentSliderConfig(REQ_BODY, disclosureData);
    }

    private loadProjectRelationsFromApi(disclosureData: DisclosureDetails): Promise<void> {
        const PROJECT_SFI_RELATION: ProjectSfiRelationLoadRO = {
            personId: disclosureData?.personId,
            disclosureId: disclosureData?.coiDisclosureId,
            disclosureNumber: disclosureData?.coiDisclosureNumber,
            dispositionStatusCode: disclosureData?.dispositionStatusCode
        };
        return new Promise<void>((resolve, reject) => {
            this.$subscriptions.push(
                this._commonService.getProjectRelations(PROJECT_SFI_RELATION).subscribe({
                    next: (data: ProjectSfiRelations) => {
                        this.getDisclosureProjectList(data);
                        resolve();
                    },
                    error: () => {
                        this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                        reject();
                    }
                })
            );
        });
    }

    private getDisclosureProjectList(projectRelationshipData): void {
        const FCOI_PROJECT_DETAILS = Array.isArray(projectRelationshipData) ? projectRelationshipData : [];
        this.disclosureProjectList = FCOI_PROJECT_DETAILS
            .filter(project => project?.projectNumber || project?.documentNumber)
            .map(project => ({
                projectNumber: String(project.projectNumber || project.documentNumber),
                projectModuleCode: Number(project.moduleCode)
            }));
    }

    private getCommentRights(tabName: CoiDashboardDisclosureType, disclosureData?: DisclosureDetails): CommentRights {
        const RIGHTS_MAP: Partial<Record<CoiDashboardDisclosureType, CommentRights>> = {
            FCOI: {
                canComment: this._commonService.getAvailableRight(MANAGE_FCOI_DISCLOSURE_COMMENT),
                canPrivateComment: this._commonService.getAvailableRight(MANAGE_PRIVATE_FCOI_DISCLOSURE_COMMENT),
                canResolveComment: this._commonService.getAvailableRight(MAINTAIN_COI_RESOLVE_COMMENTS),
                isReviewer: this._commonService.isCoiReviewer
            },
            TRAVEL: {
                canComment: this._commonService.getAvailableRight(MANAGE_TRAVEL_DISCLOSURE_COMMENT),
                canPrivateComment: this._commonService.getAvailableRight(MANAGE_PRIVATE_TRAVEL_DISCLOSURE_COMMENT),
                canResolveComment: this._commonService.getAvailableRight(MANAGE_TRAVEL_RESOLVE_COMMENTS),
                isReviewer: false
            },
            OPA: {
                canComment: this._commonService.getAvailableRight(MANAGE_OPA_DISCLOSURE_COMMENT),
                canPrivateComment: this._commonService.getAvailableRight(MANAGE_PRIVATE_OPA_DISCLOSURE_COMMENT),
                canResolveComment: this._commonService.getAvailableRight(MANAGE_OPA_RESOLVE_COMMENTS),
                isReviewer: this._commonService.isOPAReviewer
            },
        };
        return RIGHTS_MAP[tabName];
    }

    setReviewCommentSliderConfig(commentDetails: FetchReviewCommentRO, disclosureData?: DisclosureDetails, reviewCommentsCardConfig?: Partial<COIReviewCommentsConfig>): void {
        const COMPONENT_TYPE_CODE = commentDetails?.componentTypeCode;
        const CURRENT_USER_ID = this._commonService.getCurrentUserDetail('personID');
        const IS_DISCLOSURE_OWNER = commentDetails?.documentOwnerPersonId === CURRENT_USER_ID;
        const IS_COI_ADMINISTRATOR = this._commonService.getAvailableRight(['MANAGE_PROJECT_DISCLOSURE']);
        const IS_SHOW_CA_COMMENTS = IS_COI_ADMINISTRATOR && this._commonService.enableKeyPersonDisclosureComments;
        const IS_SHOW_ADMINISTRATIVE_COMMENT = IS_COI_ADMINISTRATOR && disclosureData?.fcoiTypeCode === DISCLOSURE_TYPE.PROJECT;
        const IS_OPA = COMPONENT_TYPE_CODE === OPA_GENERAL_COMMENTS.componentTypeCode;
        const IS_TRAVEL = COMPONENT_TYPE_CODE === TRAVEL_GENERAL_COMMENTS.componentTypeCode;
        const COI_TYPE = IS_TRAVEL ? 'TRAVEL' : IS_OPA ? 'OPA' : 'FCOI';
        const CHECKBOX_CONFIG_PARAMS: CommentCheckboxConfig = {
            IS_SHOW_CA_COMMENTS,
            IS_SHOW_ADMINISTRATIVE_COMMENT,
            COMPONENT_TYPE_CODE,
            PROJECT: commentDetails?.projects?.[0],
        };
        const DEFAULT_CHECK_BOX_CONFIG = this.getDefaultCheckboxConfig(CHECKBOX_CONFIG_PARAMS, COI_TYPE, disclosureData);
        const { canComment, canPrivateComment, canResolveComment, isReviewer } = this.getCommentRights(COI_TYPE, disclosureData);
        this.reviewCommentsSliderConfig = {
            ...reviewCommentsCardConfig,
            checkboxConfig: reviewCommentsCardConfig?.checkboxConfig ?? DEFAULT_CHECK_BOX_CONFIG,
            isEditMode: reviewCommentsCardConfig?.isEditMode ?? true,
            reviewCommentsSections: this.reviewSectionsMap[COI_TYPE],
            moduleCode: this.moduleCodeMap[COI_TYPE],
            isShowAllComments: [FCOI_GENERAL_COMMENTS, OPA_GENERAL_COMMENTS, TRAVEL_GENERAL_COMMENTS].some(
                item => item?.commentTypeCode === COMPONENT_TYPE_CODE
            ),
            isOpenCommentSlider: true,
            canMaintainComments: canComment || isReviewer,
            canMaintainPrivateComments: canPrivateComment || isReviewer,
            canResolveComments: canResolveComment,
            isReviewer: isReviewer,
            isDocumentOwner: IS_DISCLOSURE_OWNER,
            sortOrder: this.sortOrderMap[COI_TYPE],
            ...commentDetails,
        };
        this._commonService.openReviewCommentSlider(this.reviewCommentsSliderConfig);
    }

    private getDefaultCheckboxConfig(config: CommentCheckboxConfig, type: CoiDashboardDisclosureType, disclosureData?: DisclosureDetails): COIReviewCommentCheckbox[] {
        const CHECKBOXES: COIReviewCommentCheckbox[] = [];
        this.addPrivateCommentCheckbox(CHECKBOXES, type, disclosureData);
        this.addCACommentsCheckbox(CHECKBOXES, config);
        this.addAdministrativeCommentCheckbox(CHECKBOXES, config);
        return CHECKBOXES;
    }

    private addPrivateCommentCheckbox(CHECKBOXES: COIReviewCommentCheckbox[], type: CoiDashboardDisclosureType, disclosureData?: DisclosureDetails): void {
        const CAN_MAINTAIN_PRIVATE_COMMENTS = this.getCommentRights(type, disclosureData).canPrivateComment || this.getCommentRights(type, disclosureData).isReviewer;
        if (CAN_MAINTAIN_PRIVATE_COMMENTS) {
            CHECKBOXES.push({
                label: 'Private',
                defaultValue: false,
                values: {
                    true: { isPrivate: true },
                    false: { isPrivate: false },
                },
                hideComponentTypes: [FCOI_ADMINISTRATOR_COMMENTS?.componentTypeCode],
            });
        }
    }

    private addCACommentsCheckbox(CHECKBOXES: COIReviewCommentCheckbox[], config: CommentCheckboxConfig): void {
        if (config.IS_SHOW_CA_COMMENTS) {
            CHECKBOXES.push({
                label: 'CA Comments',
                defaultValue: false,
                values: {
                    true: { componentTypeCode: CA_COMMENTS?.componentTypeCode },
                    false: null,
                },
                hideComponentTypes: [
                    CA_COMMENTS, FCOI_QUESTIONNAIRE_COMMENTS, FCOI_ENGAGEMENT_COMMENTS,
                    FCOI_PROJECT_COMMENTS, FCOI_RELATIONSHIP_COMMENTS, FCOI_CERTIFICATION_COMMENTS,
                    FCOI_REVIEW_COMMENTS, FCOI_ADMINISTRATOR_COMMENTS, TRAVEL_GENERAL_COMMENTS,
                    OPA_GENERAL_COMMENTS
                ].map(item => item?.componentTypeCode)
            });
        }
    }

    private addAdministrativeCommentCheckbox(CHECKBOXES: COIReviewCommentCheckbox[], config: CommentCheckboxConfig): void {
        if (config.IS_SHOW_ADMINISTRATIVE_COMMENT) {
            const { componentTypeCode, componentName, commentTypeCode } = FCOI_ADMINISTRATOR_COMMENTS || {};
            CHECKBOXES.push({
                label: 'Administrative Comment',
                defaultValue: false,
                values: {
                    true: {
                        componentTypeCode,
                        componentName,
                        commentTypeCode,
                        moduleItemKey: config.PROJECT?.projectNumber,
                        moduleCode: config.PROJECT?.projectModuleCode,
                    },
                    false: null,
                },
                hideComponentTypes: [
                    CA_COMMENTS, FCOI_QUESTIONNAIRE_COMMENTS, FCOI_ENGAGEMENT_COMMENTS,
                    FCOI_PROJECT_COMMENTS, FCOI_RELATIONSHIP_COMMENTS, FCOI_CERTIFICATION_COMMENTS,
                    FCOI_REVIEW_COMMENTS, FCOI_ADMINISTRATOR_COMMENTS, TRAVEL_GENERAL_COMMENTS,
                    OPA_GENERAL_COMMENTS
                ].map(item => item?.componentTypeCode)
            })
        }
    }
}
