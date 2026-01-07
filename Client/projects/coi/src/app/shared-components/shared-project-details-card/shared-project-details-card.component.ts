import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { getFormattedSponsor } from '../../common/utilities/custom-utilities';
import { SharedProjectDetails } from '../../common/services/coi-common.interface';
import { PROJECT_DETAILS_ORDER, PROJECT_DETAILS_ORDER_WITHOUT_ROLE } from '../../app-constants';

@Component({
    selector: 'app-shared-project-details-card',
    templateUrl: './shared-project-details-card.component.html',
    styleUrls: ['./shared-project-details-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SharedProjectDetailsCardComponent implements OnChanges {

    @Input() projectDetails = new SharedProjectDetails();
    @Input() uniqueId: string | number = '';
    @Input() customClass = 'border-0';
    @Input() columnClass = '';
    @Input() isOpenSlider = true;
    @Input() needReporterRole = false;
    @Input() isShowExternalLinkIcon = true;

    sponsor = '';
    leadUnit = '';
    primeSponsor = '';
    projectDetailsOrder = {};

    constructor(private _commonService: CommonService, private _cdr: ChangeDetectorRef) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['projectDetails']) {
            this.leadUnit = this._commonService.getPersonLeadUnitDetails(this.projectDetails);
            this.sponsor = getFormattedSponsor(this.projectDetails?.sponsorCode, this.projectDetails?.sponsorName);
            this.primeSponsor = getFormattedSponsor(this.projectDetails?.primeSponsorCode, this.projectDetails?.primeSponsorName);
            this.projectDetailsOrder = this.needReporterRole ? PROJECT_DETAILS_ORDER : PROJECT_DETAILS_ORDER_WITHOUT_ROLE;
            this._cdr.markForCheck();
        }
    }

    redirectToProjectDetails(): void {
        const { documentNumber, projectId, projectTypeCode, projectNumber } = this.projectDetails || {};
        this.isOpenSlider ? this._commonService.redirectToProjectDetails(projectTypeCode, (documentNumber || projectId))
            : this._commonService.openProjectHierarchySlider(projectTypeCode, projectNumber);
    }

}
