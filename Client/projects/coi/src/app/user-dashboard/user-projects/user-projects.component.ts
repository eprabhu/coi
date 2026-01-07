import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonService } from "../../common/services/common.service";
import { PAGINATION_LIMIT, PROJECT_TYPE, PROJECT_TYPE_LABEL } from "../../app-constants";
import { ProjectListConfiguration } from "../../shared-components/configurable-project-list/configurable-project-list.interface";
import { Subscription } from "rxjs";
import { subscriptionHandler } from "../../common/utilities/subscription-handler";
import { DisclosureCreateModalService } from "../../shared-components/disclosure-create-modal/disclosure-create-modal.service";

@Component({
    selector: 'app-user-projects',
    templateUrl: './user-projects.component.html',
    styleUrls: ['./user-projects.component.scss'],
    providers: [DisclosureCreateModalService]
})
export class UserProjectsComponent implements OnInit, OnDestroy {

    isLoading = true;
    newEngCreatedMsg = '';
    PROJECT_TYPE = PROJECT_TYPE;
    isShowNavigationOptions = false;
    PROJECT_TYPE_LABEL = PROJECT_TYPE_LABEL;
    projectListConfiguration: ProjectListConfiguration;

    private $subscriptions: Subscription[] = [];
    private bindOnMouseUp: (event: MouseEvent) => void;

    constructor(public commonService: CommonService, private _disclosureCreateModalService: DisclosureCreateModalService) { }

    ngOnInit(): void {
        this.addListener();
        this.checkEngValidationAndLoadProjects();
    }

    ngOnDestroy(): void {
        this.removeListener();
        subscriptionHandler(this.$subscriptions);
    }

    private addListener(): void {
        if (!this.bindOnMouseUp) {
            this.bindOnMouseUp = this.collapseNavbarOnMouseUp.bind(this);
            document.addEventListener('mouseup', this.bindOnMouseUp);
        }
    }

    private removeListener(): void {
        document.removeEventListener('mouseup', this.bindOnMouseUp);
    }

    private collapseNavbarOnMouseUp(event: any): void {
        const ELEMENT = document.getElementById('myProjectsNavbarResponsive');
        if (ELEMENT?.classList.contains('show')) {
            ELEMENT.classList.remove('show');
        }
        if (window.innerWidth >= 1200) {
            this.isShowNavigationOptions = false;
        }
    }

    private async checkEngValidationAndLoadProjects(): Promise<void> {
        const IS_FCOI_REQUIRED = this.commonService.activeProjectsTypes?.length > 0;
        IS_FCOI_REQUIRED && await this.checkForFinancialEngagementCreated();
        this.changeTab(this.commonService.activeProjectsTypes[0].coiProjectTypeCode);
    }

    private checkForFinancialEngagementCreated(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.$subscriptions.push(
                this._disclosureCreateModalService.checkFinancialEngagementCreated()
                    .subscribe((data) => {
                        resolve();
                    }, (error) => {
                        if (error?.status === 406) {
                            this.newEngCreatedMsg = error.error?.trim() || '';
                        }
                        resolve();
                    }
                )
            );
        });
    }

    changeTab(projectTypeCode: string | number): void {
        this.isLoading = true;
        this.projectListConfiguration = {
            customClass: 'coi-nav-tab-sticky coi-bg-body',
            projectTypeCode: projectTypeCode,
            paginationLimit: PAGINATION_LIMIT,
            isShowConfirmationModal: true,
            triggeredFrom: 'MY_PROJECTS',
            isSliderOrModal: false,
            uniqueId: 'my-projects-' + projectTypeCode,
            currentPageNumber: 1,
            searchText: '',
            isShowCreateDisclosureBtn: !this.newEngCreatedMsg,
            newEngCreatedMsg: this.newEngCreatedMsg
        };
        setTimeout(() => {
            this.isLoading = false;
        });
    }

}
