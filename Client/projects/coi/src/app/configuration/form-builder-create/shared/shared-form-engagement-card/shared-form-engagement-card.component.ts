import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { RISK_ICON_COLOR_MAPPING, ENTITY_DOCUMENT_STATUS_TYPE, ENGAGEMENT_TYPE_ICONS, ENGAGEMENT_VERSION_STATUS } from "../../../../app-constants";
import { CommonService } from "../../../../common/services/common.service";
import { FBOpaCardActionEvent, FBOpaCardActions } from '../common.interface';
import { Subscription } from 'rxjs';
import { ENGAGEMENT_LOCALIZE } from "../../../../app-locales";


@Component({
    selector: 'app-shared-form-engagement-card',
    templateUrl: './shared-form-engagement-card.component.html',
    styleUrls: ['./shared-form-engagement-card.component.scss'],
})

export class SharedFormEngagementCardComponent implements OnInit {

    @Input() engagementDetails: any = {};
    @Input() sabbaticalType: any = [];
    @Input() isFormEditable = false;
    @Input() isShowCommentBtn = false;
    @Input() formBuilderId: string | number | null = null;
    @Output() cardActions = new EventEmitter<FBOpaCardActionEvent>();

    isTravelDisclosure = false;
    riskIconColor = RISK_ICON_COLOR_MAPPING;
    entityDocumentStatusType = ENTITY_DOCUMENT_STATUS_TYPE;
    commentCount: number;
    engagementTypeIcons = ENGAGEMENT_TYPE_ICONS;
    isAdmin = false;
    isShowMoreActions = true;
    sabbaticalTypeChecked: boolean[] = [];
    isOpenComparisonSlider = false;
    $subscriptions: Subscription[] = [];
    engagementVersionStatus = ENGAGEMENT_VERSION_STATUS;
    ENGAGEMENT_LOCALIZE = ENGAGEMENT_LOCALIZE;

    constructor(public commonService: CommonService) { }

    ngOnInit() {
        this.sabbaticalType?.forEach((sabbatical, index) => {
            let isChecked = false;
            if (sabbatical === 'Fall') {
                isChecked = this.engagementDetails.isFallSabatical === 'Y';
            } else if (sabbatical === 'Spring') {
                isChecked = this.engagementDetails.isSpringSabatical === 'Y';
            }
            this.sabbaticalTypeChecked[index] = isChecked;
        });
    }

    private emitCardAction(action: FBOpaCardActions): void {
        this.cardActions.emit({
            action: action,
            content: { engagementDetails: this.engagementDetails, formBuilderId: this.formBuilderId, triggeredFrom: 'OPA_ENGAGEMENT_CARD' }
        });
    }

    viewEntityDetails(): void {
        this.commonService.openEntityDetailsModal(this.engagementDetails?.entityId);
    }

    openReviewComment(): void {
        this.emitCardAction('COMMENT');
    }

    viewEngagementDetails(): void {
        this.emitCardAction('VIEW_ENGAGEMENT');
    }

    modifyEngagement(): void {
        this.emitCardAction('MODIFY_ENGAGEMENT');
    }

    activateDeactivateEngagement(): void {
        this.emitCardAction('ACTIVATE_DEACTIVATE_ENGAGEMENT');
    }

    deleteEngagement(): void {
        this.emitCardAction('DELETE_ENGAGEMENT');
    }

    onSabbaticalTypeChange(sabbatical: string, isChecked: boolean): void {
        const VALUE = isChecked ? 'Y' : 'N';
        if (sabbatical === 'Fall') {
            this.engagementDetails.isFallSabatical = VALUE;
        } else if (sabbatical === 'Spring') {
            this.engagementDetails.isSpringSabatical = VALUE;
        }
        this.emitCardAction('CHECK_SABBATICAL_TYPE');
    }

}
