import {Component, OnDestroy, OnInit} from '@angular/core';
import {
    ADDITIONAL_INFORMATION,
    AttachmentTab,
    COMPLIANCE_NOTES_RIGHTS,
    ComplianceTab,
    CorporateFamilyTab,
    ENTITY_NOTES_RIGHTS,
    ENTITY_COMPLIANCE_NOTES_SECTION_ID,
    ENTTIY_OVERVIEW_NOTES_SECTION_ID,
    ENTTIY_SPONSOR_NOTES_SECTION_ID,
    ENTITY_SUB_AWARD_NOTES_SECTION_ID,
    HistoryTab,
    NotesTab,
    OverviewTabSection,
    SPONSOR_NOTES_RIGHTS,
    SponsorTabSection,
    SUB_AWARD_ORGANIZATION_NOTES_RIGHTS,
    SubawardOrganizationTab,
    ENTITY_RIGHT_PANEL_SECTION_ID
} from '../shared/entity-constants';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { EntityDataStoreService } from '../entity-data-store.service';
import { isEmptyObject } from 'projects/fibi/src/app/common/utilities/custom-utilities';
import { EntityManagementService } from '../entity-management.service';
import { DataStoreEvent, CurrentTabType, EntireEntityDetails, EntityTabStatus, EntityDetails } from '../shared/entity-interface';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { CommonService } from '../../common/services/common.service';
import { ENTITY_VERIFICATION_STATUS, FEED_STATUS_CODE } from '../../app-constants';


@Component({
  selector: 'app-right-panel',
  templateUrl: './right-panel.component.html',
  styleUrls: ['./right-panel.component.scss']
})
export class RightPanelComponent implements OnInit, OnDestroy {

    dunsNumber = '';
    isEditMode = false;
    isDunsMatched = false;
    currentTab: CurrentTabType;
    sectionDetails: any[] = [];
    hasPersonEntityLinked = false;
    isEnableEntityDunsMatch = false;
    tabDetails = new EntityTabStatus();
    $subscriptions: Subscription[] = [];
    entityDetails = new EntityDetails();
    FEED_STATUS_CODE = FEED_STATUS_CODE;
    entityStatus = ENTITY_VERIFICATION_STATUS;
    rightPanelId = ENTITY_RIGHT_PANEL_SECTION_ID;

    constructor(private _router: Router,
                private _dataStorService: EntityDataStoreService,
                public entityManagementService: EntityManagementService,
                private _commonService: CommonService
            ) {}

    ngOnInit() {
        this.routerEventSubscription();
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        this.checkSelectedIdAndScroll();
        this.listenAdditionInfoVisibilityChange();
        this.isEnableEntityDunsMatch = this._commonService.isEnableEntityDunsMatch;
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    getCurrentTab(currentURL): any {
        if(currentURL.includes('entity-overview')) {
            return 'OVERVIEW';
        } else if (currentURL.includes('entity-sponsor')) {
            return 'SPONSOR';
        } else if (currentURL.includes('entity-subaward')) {
            return 'SUBAWARD';
        } else if (currentURL.includes('entity-compliance')) {
            return 'COMPLIANCE';
        } else if (currentURL.includes('entity-attachments')) {
            return 'ATTACHMENTS';
        } else if (currentURL.includes('entity-notes')) {
            return 'NOTES';
        } else if (currentURL.includes('entity-corporate-family')) {
            return 'CORPORATE_FAMILY';
        } else if (currentURL.includes('entity-history')) {
            return 'HISTORY';
        } else {
            return '';
        }
    }

    private getDataFromStore() {
        const ENTITY_DATA: EntireEntityDetails = this._dataStorService.getData();
        if (isEmptyObject(ENTITY_DATA)) { return; }
        this.entityDetails = ENTITY_DATA?.entityDetails;
        this.dunsNumber = ENTITY_DATA?.entityDetails?.dunsNumber;
        this.isDunsMatched = ENTITY_DATA?.entityDetails?.isDunsMatched;
        this.tabDetails = ENTITY_DATA?.entityTabStatus;
        this.isEditMode = this._dataStorService.getEditMode();
        this.hasPersonEntityLinked = ENTITY_DATA.hasPersonEntityLinked;
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this._dataStorService.dataEvent.subscribe((dependencies: DataStoreEvent) => {
                this.getDataFromStore();
            })
        );
    }

    private getSectionDetails(): any[] {
        switch(this.currentTab) {
            case 'OVERVIEW': {
                return this.getArray(OverviewTabSection);
            }
            case 'SPONSOR': {
                return this.getArray(SponsorTabSection);
            }
            case 'SUBAWARD': {
                return this.getArray(SubawardOrganizationTab);
            }
            case 'COMPLIANCE': {
                return this.getArray(ComplianceTab);
            }
            case 'ATTACHMENTS': {
                return this.getArray(AttachmentTab);
            }
            case 'NOTES': {
                return this.getArray(NotesTab);
            }
            case 'HISTORY': {
                return this.getArray(HistoryTab);
            }
            case 'CORPORATE_FAMILY': {
                return this.getArray(CorporateFamilyTab);
            }
            default: {
                return [];
            }
        }
    }

    private checkSelectedIdAndScroll(): void {
        const FOUND_SECTION = this.sectionDetails?.find(section => section?.sectionId === this.entityManagementService.selectedSectionId);
        const IS_SECTION_ID_INCLUDED = !!FOUND_SECTION;
        const IS_SUB_SECTION_ID_INCLUDED = this.getArray(FOUND_SECTION?.subSections)?.some(subSection => subSection?.sectionId === this.entityManagementService.selectedSubSectionId);
        const SELECTED_SECTION_ID = IS_SECTION_ID_INCLUDED ? this.entityManagementService.selectedSectionId : this.sectionDetails?.[0]?.sectionId;
        const SELECTED_SUB_SECTION_ID = IS_SUB_SECTION_ID_INCLUDED ? this.entityManagementService.selectedSubSectionId : '';
        this.scrollToSelectedSection(SELECTED_SECTION_ID, SELECTED_SUB_SECTION_ID);
    }

    scrollToSelectedSection(sectionId: string | number, subSectionId: string | number = '') {
        this.entityManagementService.scrollToSelectedSection(sectionId, subSectionId);
    }

    windowScroll(scrollTo: string) {
        const ELEMENT: HTMLElement = document.getElementById(scrollTo);
        const offsetFromHeader = document.getElementById('COI-DISCLOSURE-HEADER')?.clientHeight + 50;
        const sectionHeight = ELEMENT.offsetTop - offsetFromHeader;
        window.scrollTo({ behavior: 'smooth', top: sectionHeight });
    }

    getArray(map): any {
        let section = [];
        map?.forEach((value) => {
            section.push(value);
        });
        return section;
    }

    routerEventSubscription(): void {
        this.$subscriptions.push(this._router.events.subscribe(event => {
            if (this.currentTab != this.getCurrentTab(window.location.href)) {
                this.currentTab = this.getCurrentTab(window.location.href);
                this.sectionDetails = this.getSectionDetails();
                this.checkForShowNotesSection();
                this.checkSelectedIdAndScroll();
            }
        }));
    }

    private checkForShowNotesSection(): void {
        switch(this.currentTab) {
            case 'OVERVIEW': {
                this.canShowNote(ENTITY_NOTES_RIGHTS, ENTTIY_OVERVIEW_NOTES_SECTION_ID);
                break;
            }
            case 'SPONSOR': {
                this.canShowNote(SPONSOR_NOTES_RIGHTS, ENTTIY_SPONSOR_NOTES_SECTION_ID);
                break;
            }
            case 'SUBAWARD': {
                this.canShowNote(SUB_AWARD_ORGANIZATION_NOTES_RIGHTS, ENTITY_SUB_AWARD_NOTES_SECTION_ID);
                break;
            }
            case 'COMPLIANCE': {
                this.canShowNote(COMPLIANCE_NOTES_RIGHTS, ENTITY_COMPLIANCE_NOTES_SECTION_ID);
                break;
            }
            default:
                break;
        }
    }

    private canShowNote(rightsArray: string[], sectionId: any): void {
        const CAN_SHOW_NOTES = this._commonService.getAvailableRight(rightsArray);
        this.sectionDetails.find(ele => ele.sectionId == sectionId).sectionVisibility = CAN_SHOW_NOTES ? 'SHOW' : 'HIDE';
    }

    listenAdditionInfoVisibilityChange() {
        this.$subscriptions.push(this.entityManagementService.$canShowAdditionalInformation.subscribe((canShow: boolean) => {
            if (!canShow) {
                this.sectionDetails = this.sectionDetails.filter((section) => section.sectionId !== ADDITIONAL_INFORMATION.sectionId);
            }
        }));
    }

}
