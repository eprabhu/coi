import { interval, Subject, Subscription } from 'rxjs';
import { FormBuilderService } from '../../form-builder.service';
import { ExternalActionEvent, FBOpaCardActionEvent, FBOpaEngTabType, OpaPersonEngagementFetchRO } from '../../../common.interface';
import { Component, Input, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { subscriptionHandler } from '../../../../../../common/utilities/subscription-handler';
import { debounce } from 'rxjs/operators';
import { OpaPersonEngagementService } from './opa-person-engagement.service';
import { CommonService } from '../../../../../../common/services/common.service';
import { COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS } from '../../../../../../app-constants';
import { PERSON_ENGAGEMENT_MESSAGE_LIST } from '../../../../../../no-info-message-constants';
import { FormBuilderEvent } from '../../form-builder-interface';

@Component({
    selector: 'app-OPA-person-engagements',
    templateUrl: './OPA-person-engagements.component.html',
    styleUrls: ['./OPA-person-engagements.component.scss'],
    providers: [OpaPersonEngagementService]
})
export class OPAPersonEngagementsComponent implements OnInit, OnDestroy {

    @Input() componentData: any = {};
    @Input() isFormEditable = false;
    @Input() formBuilderId: number | string | null = null;
    @Input() externalEvents: Subject<any> = new Subject<any>();
    @Input() externalActionEventForChildComponent = new Subject<ExternalActionEvent>(); //This input is used to capture external actions triggered from other components, allowing this component to respond accordingly when such actions occur.


    @Output() emitActionEvent = new EventEmitter<FBOpaCardActionEvent>();
    @Output() childEvents: EventEmitter<any> = new EventEmitter<any>();

    sabbaticalRO: any = {};
    previousSabbaticalRO: any[] = [];
    $subscriptions: Subscription[] = [];
    searchText = '';
    opaPersonEngagementRO = new OpaPersonEngagementFetchRO();
    $debounceEventForEngagement = new Subject();
    selectedFilterType = '';
    noDataMessage = PERSON_ENGAGEMENT_MESSAGE_LIST;
    isLoading = false;
    isShowCommentBtn = false;
    engagementCommentCounts = []
    isHideFilterSearchAndShowCreate = false;
    sabbaticalType: string[] = [];
    expandInfo = false;

    constructor(private _formBuilder: FormBuilderService, private _opaPersonEngagementService: OpaPersonEngagementService, private _commonService: CommonService) { }


    ngOnInit(): void {
        this.listenForExternalActionEvents();
        this.listenForExternalEvents();
        this.getEngagementSearchList();
        this.setSabbaticalType();
        this.selectedFilterType = this.opaPersonEngagementRO.filterType;
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }


    private setSabbaticalType(): void {
        this.sabbaticalType = [];
        if(this.componentData.isFallSabatical === 'Y') {
            this.sabbaticalType.push('Fall');
        }
        if(this.componentData.isSpringSabatical === 'Y') {
            this.sabbaticalType.push('Spring');
        }
    }

    private listenForExternalActionEvents(): void {
        this.$subscriptions.push(this.externalActionEventForChildComponent.subscribe((res: FormBuilderEvent) => {
            const { triggeredFrom, isShowCommentBtn, commentCount } = res?.data || {}
            if (res?.eventType === 'EXTERNAL_ACTION' && triggeredFrom === 'COMMENT_CONFIG') {
                this.updateCommentCount(isShowCommentBtn, commentCount);
            } else {
                 this.loadEngagementFromExternalEvent(res);
            }
        }));
    }

    private updateCommentCount(isShowCommentBtn: boolean, commentCount: any[]): void {
        this.isShowCommentBtn = isShowCommentBtn;
        this.engagementCommentCounts = commentCount || [];
        this.componentData?.engagementDetails?.forEach((entity: any) => {
            const ENTITY_DETAILS = this.engagementCommentCounts?.find((item: any) => String(item?.subModuleItemNumber) === String(entity?.personEntityNumber));
            entity.commentDetails = {
                isShowCommentBtn: this.isShowCommentBtn,
                commentCount: ENTITY_DETAILS ? ENTITY_DETAILS.count : 0
            };
        });
    }

    private loadEngagementFromExternalEvent(res: FormBuilderEvent): void {
        this.setEngagementRequestObject({
            opaDisclosureId: res?.data.opaDisclosureId,
            documentOwnerPersonId: res?.data.documentOwnerPersonId,
            searchWord: this.searchText,
            isSyncRequired: true,
            filterType: this.selectedFilterType
        });
        this.loadEngagementOnAction(this.opaPersonEngagementRO);
    }

    private loadEngagementOnAction(opaPersonEngagementRO): void {
        this.isLoading = true;
        this.componentData.engagementDetails = [];
        this.$subscriptions.push(this._opaPersonEngagementService.fetchEngagementAfterAction(opaPersonEngagementRO).subscribe(response => {
            this.componentData = {
                ...this.componentData,
                engagementDetails: response?.engagementDetails
            };
            this.updateCommentCount(this.isShowCommentBtn, this.engagementCommentCounts);
            this.loadingComplete();
        },
        error => {
            this.loadingComplete();
            this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }));
    } 

    private saveSabbaticalDetails(): void {
            try {
                this.childEvents.emit({ action: 'UPDATE', data: this.sabbaticalRO });
                this.emitEditOrSaveAction('UPDATE', this.sabbaticalRO);
            } catch (err) {
                if ((err.status === 405)) {
                    this.childEvents.emit({ action: 'UPDATE', data: this.sabbaticalRO });
                }
            }
    }

    private emitEditOrSaveAction(actionPerformed, event) {
        this._formBuilder.$formBuilderActionEvents.next({ action: actionPerformed, actionResponse: event, component: this.componentData });
    }

    private listenForExternalEvents(): void {
        this.$subscriptions.push(this.externalEvents.subscribe(res => {
            if (res?.eventType === 'SAVE' || res?.eventType === 'EXTERNAL_SAVE') {
                this.saveSabbaticalDetails();
            }
        }));
    }

    private loadingComplete(): void {
        this.isLoading = false;
        this.setSabbaticalType();
        if (this.opaPersonEngagementRO.filterType === 'ALL' && !this.searchText && !this.isFormEditable) {
          this.isHideFilterSearchAndShowCreate = !this.componentData?.engagementDetails?.length;
        }   
    }

    private setEngagementRequestObject(options: Partial<typeof this.opaPersonEngagementRO> = {}): void {
        this.opaPersonEngagementRO = {
            filterType: this.selectedFilterType || 'ALL',
            searchWord: this.searchText || '',
            opaDisclosureId: this.componentData?.opaDisclosureId,
            documentOwnerPersonId: this.componentData?.documentOwnerPersonId,
            loggedInUserPersonId: this._commonService.getCurrentUserDetail('personID'),
            isSyncRequired: false,
            ...this.opaPersonEngagementRO,
            ...options
        };
    }

    private getEngagementSearchList(): void {
        this.$subscriptions.push(this.$debounceEventForEngagement.pipe(debounce(() => interval(800))).subscribe((data: any) => {
            this.setEngagementRequestObject({
                searchWord: this.searchText,
                isSyncRequired: false
            });
            this.loadEngagementOnAction(this.opaPersonEngagementRO);
        }
        ));
    }

    emitActionEvents(event: FBOpaCardActionEvent) {
        if (event.action === 'CHECK_SABBATICAL_TYPE') {
            this._formBuilder.$formBuilderActionEvents.next({ action: 'CHANGED'});
            const { opaPersonEntityRelId, isFallSabatical, isSpringSabatical } = event.content?.engagementDetails || {};
            this.sabbaticalRO = { opaPersonEntityRelId, actionType: 'SAVE', isFallSabatical, isSpringSabatical};
            this.saveSabbaticalDetails();
        } else {
            this.emitActionEvent.emit(event);
        }
    }

    createNewEngagement(): void {
        this.emitActionEvents({
            action: 'CREATE_ENGAGEMENT',
            content: {
                triggeredFrom: 'OPA_ENGAGEMENT'
            }
        });
    }

    setTab(tabType: FBOpaEngTabType): void {
        this.opaPersonEngagementRO.tabType = tabType;
        this.setFilter('COMPLETE');
    }

    setFilter(type = 'ALL'): void {
        this.selectedFilterType = type;
        this.setEngagementRequestObject({
            filterType: type,
            searchWord: this.searchText,
            isSyncRequired: false
        });
        this.loadEngagementOnAction(this.opaPersonEngagementRO);
    }

    getEngagements(): void {
        this.$debounceEventForEngagement.next('');
    } 

    clearSearchText(): void {
        this.searchText = '';
        this.setEngagementRequestObject({
            searchWord: '',
            isSyncRequired: false
        });
        this.loadEngagementOnAction(this.opaPersonEngagementRO);
    }
}
