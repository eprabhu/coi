import { DECLARATION_LOCALIZE } from "../../app-locales";
import { HeaderService } from "../../common/header/header.service";
import { CommonService } from "../../common/services/common.service";
import { DeclarationDashboard } from "../../declarations/declaration.interface";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { DASHBOARD_DECLARATION_CARD_FIELD_ORDER, DECLARATION_INITIAL_VERSION_NUMBER,
    DECLARATION_REVIEW_STATUS_BADGE, DECLARATION_STATUS_BADGE, DECLARATION_VERSION_STATUS_BADGE } from "../../declarations/declaration-constants";

export type DeclarationCardActionEvent = { action: 'ASSIGN_ADMIN', declarationDetails: DeclarationDashboard | null };

@Component({
    selector: 'app-declaration-card',
    templateUrl: './declaration-card.component.html',
    styleUrls: ['./declaration-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeclarationCardComponent {

    @Input() isHistoryCard = false;
    @Input() isShowAssignAdmin = false;
    @Input() hasSameDeclaration = false;
    @Input() isTriggeredFromSlider = false;
    @Input() declarationDetails: DeclarationDashboard | null = null;
    @Input() cardOrder = DASHBOARD_DECLARATION_CARD_FIELD_ORDER;
    @Input() isShowViewBtn = false;
    @Output() emitCardActions = new EventEmitter<DeclarationCardActionEvent>();

    declarationLocalize = DECLARATION_LOCALIZE;
    declarationStatusBadgeClass = DECLARATION_STATUS_BADGE;
    reviewStatusBadgeClass = DECLARATION_REVIEW_STATUS_BADGE;
    initialVersionNumber = DECLARATION_INITIAL_VERSION_NUMBER;
    versionStatusBadgeClass = DECLARATION_VERSION_STATUS_BADGE;

    constructor(public commonService: CommonService, private _headerService: HeaderService) { }

    redirectToDeclaration(): void {
        if (this.isTriggeredFromSlider) {
          document.body.removeAttribute("style");
        }
        this._headerService.redirectToDeclaration(this.declarationDetails?.declarationId);
    }

    openPersonDetailsModal(): void {
        this.commonService.openPersonDetailsModal(this.declarationDetails?.personId);
    }

    openAssignAdminModal(): void {
        this.emitCardActions.emit({
            action: 'ASSIGN_ADMIN',
            declarationDetails: this.declarationDetails
        });
    }

}
