import { Component, HostListener } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { CMP_LOCALIZE, } from '../../../../app-locales';
import { CommonService } from '../../../../common/services/common.service';
import { AutoSaveService } from '../../../../common/services/auto-save.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagementPlanService } from '../../services/management-plan.service';
import { CMP_BASE_URL, CMP_CHILD_ROUTE_URL, CMP_STATUS, CMP_TYPE, MAINTAIN_CMP_RIGHTS } from '../../../shared/management-plan-constants';
import { subscriptionHandler } from 'projects/coi/src/app/common/utilities/subscription-handler';
import { DataStoreEvent } from 'projects/coi/src/app/entity-management-module/shared/entity-interface';
import { Subscription } from 'rxjs';
import { ManagementPlanStoreData } from '../../../shared/management-plan.interface';
import { ManagementPlanDataStoreService } from '../../services/management-plan-data-store.service';

@Component({
    selector: 'app-management-plan-nav',
    templateUrl: './management-plan-nav.component.html',
    styleUrls: ['./management-plan-nav.component.scss'],
    standalone: true,
    imports: [RouterModule, MatIconModule, CommonModule, FormsModule]
})
export class ManagementPlanNavComponent {

    cmpLocalize = CMP_LOCALIZE;
    cmpRouteUrls = CMP_CHILD_ROUTE_URL;
    cmpBaseUrl = CMP_BASE_URL;
    isFormEditable = false;
    managementPlan = new ManagementPlanStoreData();
    navItemConfig = {
        isShowDetailsTab: false,
        isShowPlanTab: false,
        isShowReviewTab: false,
        isShowTaskTab: false,
        isShowAttachmentTab: false,
        isShowHistoryTab: false,
    };
    isShowNavBarOverlay = false;
    hasCmpMaintainRight = false;

    private $subscriptions: Subscription[] = [];


    @HostListener('window:resize', ['$event'])
    listenScreenSize(event: Event) {
        this.closeHeaderMenuBar();
    }

    constructor(public router: Router,
        public commonService: CommonService,
        public autoSaveService: AutoSaveService,
        private _managementPlanService: ManagementPlanService,
        private _managementPlanDataStore: ManagementPlanDataStoreService) { }

    ngOnInit(): void {
        this.getDataFromStore({ action: 'REFRESH', dependencies: [] });
        this.listenDataChangeFromStore();
        this.hasCmpMaintainRight = this.commonService.getAvailableRight(MAINTAIN_CMP_RIGHTS);
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private getDataFromStore(storeEvent: DataStoreEvent): void {
        this.managementPlan = this._managementPlanDataStore.getData();
        this.isFormEditable = this._managementPlanDataStore.isFormEditable();
        const IS_UNIVERSITY_TYPE = String(this.managementPlan?.plan?.cmpTypeCode) === String(CMP_TYPE.UNIVERSITY);
        const IS_INPROGRESS = String(this.managementPlan?.plan?.statusType?.statusCode) !== String(CMP_STATUS.INPROGRESS);
        this.navItemConfig.isShowHistoryTab = true;
        this.navItemConfig.isShowAttachmentTab = true;
        this.navItemConfig.isShowTaskTab = IS_UNIVERSITY_TYPE;
        this.navItemConfig.isShowPlanTab = IS_UNIVERSITY_TYPE;
        this.navItemConfig.isShowDetailsTab = IS_UNIVERSITY_TYPE;
        this.navItemConfig.isShowReviewTab = IS_UNIVERSITY_TYPE && IS_INPROGRESS;
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._managementPlanDataStore.dataEvent.subscribe((storeEvent: DataStoreEvent) => {
                this.getDataFromStore(storeEvent);
            })
        );
    }

    onTabSwitch(tabName: 'DETAILS' | 'MANAGEMENT_PLAN' | 'TASK' | 'ATTACHMENT' | 'REVIEW' | 'HISTORY'): void {
        this.onClickMenuBar();
        this._managementPlanService.setTopForManagementPlan();
    }

    triggerAddNewSection(): void {
        this._managementPlanService.triggerManagementPlanActions('ADD_NEW_SECTION');
    }

    openCreateTaskModal(): void {
        this._managementPlanService.triggerManagementPlanActions('TRIGGER_CREATE_TASK_MODAL');
    }

    onClickMenuBar(): void {
        const NAV_ELEMENT = document.getElementById('coi-cmp-responsive-nav');
        const IS_MENU_SHOW = NAV_ELEMENT.classList.contains('show-menu');
        const IS_SCREEN = window.innerWidth <= 992;

        if (IS_MENU_SHOW) {
            NAV_ELEMENT.classList.remove('show-menu');
            if (IS_SCREEN) {
                this.isShowNavBarOverlay = false;
            }
        } else {
            if (IS_SCREEN) {
                this.isShowNavBarOverlay = true;
                setTimeout(() => {
                    NAV_ELEMENT?.focus();
                }, 50);
            }
            NAV_ELEMENT.classList.toggle('show-menu', IS_SCREEN);
        }
    }

    closeHeaderMenuBar(): void {
        setTimeout(() => {
            const NAV_ELEMENT = document.getElementById('coi-cmp-responsive-nav');
            NAV_ELEMENT.classList.remove('show-menu');
            this.isShowNavBarOverlay = false;
        });
    }

}
