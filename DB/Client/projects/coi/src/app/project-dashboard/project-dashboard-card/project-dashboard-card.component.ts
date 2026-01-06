import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { SharedProjectDetails } from '../../common/services/coi-common.interface';
import { COMPONENT_TYPE_CODE, FCOI_PROJECT_DISCLOSURE_RIGHTS, POST_CREATE_DISCLOSURE_ROUTE_URL, PROJECT_DASHBOARD_TABS, SUBMISSION_STATUS_BADGE } from '../../app-constants';
import { Router } from '@angular/router';
import { heightAnimation, listAnimation } from '../../common/utilities/animations';
import { ProjectDashboardService } from '../project-dashboard.service';
import { KeyPersonDetail, ProjectDetails, ProjectOverview, ProjectOverviewDetails } from '../project-dashboard.interface';
import { coiReviewComment } from '../../shared-components/shared-interface';
import { deepCloneObject } from '../../common/utilities/custom-utilities';
import { KeyPersonComment } from '../../shared-components/review-comments-slider/review-comments-interface';
import { FCOI_COMMENTS_RIGHTS } from '../../shared-components/coi-review-comments/coi-review-comments-constants';
import { COMMON_DISCL_LOCALIZE, CA_DASH_KEYPERSON_DISCL_LOCALIZE, CA_DASH_PROJECT_LOCALIZE } from '../../app-locales';

@Component({
    selector: 'app-project-dashboard-card',
    templateUrl: './project-dashboard-card.component.html',
    styleUrls: ['./project-dashboard-card.component.scss'],
    animations: [listAnimation, heightAnimation('0', '*', 300, 'heightAnimation')]
})
export class ProjectDashboardCardComponent {

    @Input() projectData: ProjectOverviewDetails;
    @Input() isCAAdmin: boolean;
    @Output() emitProjectDetails =  new EventEmitter<ProjectDetails>;

    cardProjectDetails: SharedProjectDetails;
    isProjectOverviewCardCollapse = false;
    isDesc: { [key: string]: boolean } = {};
    currentSortStateKey: string | null = null;
    keyPersonColumnTitles = {
        department: $localize`:@@KEYPERSON_DEPARTMENT_TITLE: department`,
        certification: $localize`:@@KEYPERSON_CERTIFICATION_TITLE: certification`,
        disclosure: $localize`:@@KEYPERSON_DISCLOSURE_TITLE: disclosure`,
        reviewStatus: $localize`:@@KEYPERSON_REVIEW_STATUS_TITLE: review status`
    };
    isShowProjectCommentSlider = false;
    isShowNotificationSlider = false;
    isShowHistorySlider = false
    projectOverviewData: ProjectOverview = new ProjectOverview();
    isShowCaCommentSlider = false;
    disclosureDetails: any;
    SUBMISSION_STATUS_BADGE = SUBMISSION_STATUS_BADGE;
    COMPONENT_TYPE_CODE = COMPONENT_TYPE_CODE;
    isShowCommentButton = false;
    isCOIAdministrator = false;
    PROJECT_DASHBOARD_TABS = PROJECT_DASHBOARD_TABS;
    closedAwardStatus = ['Hold', 'Closed', 'Inactive', 'Expired'];
    hasFCOIDisclosureRights = false;
    loginPersonId = '';
    COMMON_DISCL_LOCALIZE = COMMON_DISCL_LOCALIZE;
    CA_DASH_KEYPERSON_DISCL_LOCALIZE = CA_DASH_KEYPERSON_DISCL_LOCALIZE;
    CA_DASH_PROJECT_LOCALIZE = CA_DASH_PROJECT_LOCALIZE;

    constructor(private commonService: CommonService,
        private _router: Router,
        public projectDashboardService: ProjectDashboardService) { }

    ngOnInit() {
        this.cardProjectDetails = this.commonService.setProjectCardDetails(this.projectData?.projectDetails);
        this.isShowCommentButton = this.commonService.getAvailableRight(FCOI_COMMENTS_RIGHTS);
        this.isCOIAdministrator = this.commonService.getAvailableRight(['MANAGE_PROJECT_DISCLOSURE']);
        this.hasFCOIDisclosureRights = this.commonService.getAvailableRight(FCOI_PROJECT_DISCLOSURE_RIGHTS);
        this.loginPersonId = this.commonService.getCurrentUserDetail('personID');
    }

    toggleProjectOverviewCard(): void {
        this.isProjectOverviewCardCollapse = !this.isProjectOverviewCardCollapse;
    }

    sortKeypersonsList(isAsc: boolean, key: any): void {
        const STATE_KEY = `${key}`;
        this.isDesc[STATE_KEY] = !isAsc;
        const ALL_KEY_HAVE_VALUES = this.projectData.keyPersonDetails.every(person => person[key] !== undefined);

        if (ALL_KEY_HAVE_VALUES) {
            this.projectData.keyPersonDetails.sort((a, b) => {
                const VAL_A = a[key];
                const VAL_B = b[key];

                let comparison = 0;
                if (typeof VAL_A === 'boolean' && typeof VAL_B === 'boolean') {
                    comparison = VAL_A === VAL_B ? 0 : VAL_B ? 1 : -1;
                } else if (typeof VAL_A === 'string' && typeof VAL_B === 'string') {
                    comparison = VAL_A.localeCompare(VAL_B);
                }
                return isAsc ? comparison : -comparison;
            });
        }
    }

    /**
       *
       * @param index To retrieve the accurate project using the index value.
       * @param key The key is used to obtain a specific field name from the keyperson table, based on the data given at a particular index value.
       */
    onSortClick(key: any): void {
        const STATE_KEY = `${key}`;
        const CURRENT_SORT_DIRECTION = this.isDesc[STATE_KEY];

        if (this.currentSortStateKey && this.currentSortStateKey !== STATE_KEY) {
            this.isDesc[this.currentSortStateKey] = null;
        }

        this.currentSortStateKey = STATE_KEY;
        this.sortKeypersonsList(CURRENT_SORT_DIRECTION, key);
    }

    openPersonDetailsModal(keyPersonData: KeyPersonDetail): void {
        const PERSON_TYPE = keyPersonData?.personNonEmployeeFlag !== 'Y' ? 'PERSON' : 'ROLODEX';
        this.commonService.openPersonDetailsModal(keyPersonData?.keyPersonId, PERSON_TYPE);
    }

    redirectToDisclosure(KeyPersonData) {
        sessionStorage.setItem('previousUrl', this._router.url);
        if (KeyPersonData.disclosureId) {
            const REDIRECT_URL = POST_CREATE_DISCLOSURE_ROUTE_URL;
            this._router.navigate([REDIRECT_URL],
                { queryParams: { disclosureId: KeyPersonData.disclosureId } });
        }
    }

    toggleProjectCommentSlider(sliderState: 'OPEN_SLIDER' | 'CLOSE_SLIDER'): void {
        this.isShowProjectCommentSlider = sliderState === 'OPEN_SLIDER';
    }

    closeNotificationSlider(): void {
        this.isShowNotificationSlider = false;
    }



    handleCommentCount(updatedCount: number): void {
        this.projectData.projectDetails.commentCount = updatedCount;
    }

    toggleNotificationSlider(index: number): void {
        this.projectDashboardService.notificationSliderData = {
            projectDetailsForSlider: this.projectData,
            keyPersonIndex: index
        };
        this.isShowNotificationSlider = true;
    }

    toggleCaComment(keyPersonData: KeyPersonDetail): void {
        const COMMENT_META_DATA: coiReviewComment = {
            documentOwnerPersonId: keyPersonData.keyPersonId,
            componentTypeCode: this.isCAAdmin && !this.isCOIAdministrator ? this.COMPONENT_TYPE_CODE.CA_COMMENTS : this.COMPONENT_TYPE_CODE.GENERAL_COMMENTS,
            subModuleItemKey: null,
            subModuleItemNumber: null
        }
        this.disclosureDetails = keyPersonData;
        this.commonService.$commentConfigurationDetails.next(COMMENT_META_DATA);
        this.isShowCaCommentSlider = true;
    }

    closeCaComment(event): void {
        this.isShowCaCommentSlider = event;
    }

    setDisclosureToMandatory(projectDetails: ProjectDetails) {
        this.emitProjectDetails.next(deepCloneObject(projectDetails));
    }

    toggleHistorySlider(sliderState: 'OPEN_SLIDER' | 'CLOSE_SLIDER') {
        this.isShowHistorySlider = sliderState === 'OPEN_SLIDER';
    }

    keyPersonCommentCount(personComment: KeyPersonComment) {
        let PERSON = this.projectData.keyPersonDetails.find(p => p.keyPersonId === personComment.personID);
        if (PERSON) {
            PERSON.personCommentCount = personComment.commentCount;
        }
    }

}
