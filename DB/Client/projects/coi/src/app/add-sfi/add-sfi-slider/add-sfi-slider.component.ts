import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { closeCoiSlider, hideModal, openCoiSlider } from '../../common/utilities/custom-utilities';
import { forkJoin, Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { HTTP_ERROR_STATUS, LEAVE_PAGE_MODAL_MSG } from '../../app-constants';

@Component({
    selector: 'app-add-sfi-slider',
    templateUrl: './add-sfi-slider.component.html',
    styleUrls: ['./add-sfi-slider.component.scss']
})
export class AddSfiSliderComponent implements OnInit {

    private readonly _sfiModuleCode = 'SFI53';
    private readonly _coiModuleCode = 'GE26';

    @Input() isOpenSlider = false;
    @Output() isOpenSliderChange = new EventEmitter<boolean>();

    @ViewChild('sfiNavOverlay', { static: true }) sfiNavOverlay: ElementRef;
    scrollHeight: number;
    sfiSliderSectionConfig: any;
    entitySectionConfig: any;
    isShowAddSfiPage: boolean = false;
    $subscriptions: Subscription[] = [];
    isChangedFieldValue = false;
    leavePageModalMsg = LEAVE_PAGE_MODAL_MSG;
    sliderId = 'add-sfi';

    constructor(public _commonService: CommonService) { }

    ngOnInit(): void {
        this.getSfiSectionConfig();
        this.leavePageModalMsg = this._commonService.changeLeavePageModalMessage(this.leavePageModalMsg, 'Engagement - Relationship Details');
        this.listenToGlobalEventEmitter();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    hideSfiNavBar() {
        setTimeout(() => {
            this._commonService.isEngagementChangesAvailable = false;
            this.isOpenSlider = false;
            this.isOpenSliderChange.emit(this.isOpenSlider);
        },500);
    }

    closeSlider(): void {
        closeCoiSlider(this.sliderId);
        this.hideSfiNavBar();
    }

    showSfiNavBar() {
        if(this.isOpenSlider) {
            setTimeout(() => {
                openCoiSlider(this.sliderId);
            });
        }
    }

    addEntityToggle(event) {
        hideModal(event);
    }

    getSfiSectionConfig() : void {
        this.$subscriptions.push(
            forkJoin([this._commonService.getDashboardActiveModules(this._sfiModuleCode), this._commonService.getDashboardActiveModules(this._coiModuleCode)])
        .subscribe((data: any) => {
            if(data.length) {
                this.sfiSliderSectionConfig = data[0];
                this.entitySectionConfig = data[1];
                this.openSlider();
            }
        },
            _err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in Fetching Active Modules.');
                this.openSlider();
            }));
    }

    openSlider() : void {
        this.isShowAddSfiPage = true;
        this.showSfiNavBar();
    }

    private listenToGlobalEventEmitter() {
        this.$subscriptions.push(this._commonService.$globalEventNotifier.subscribe(data=>{
            if(data.uniqueId === 'SFI_CHANGES_AVAILABLE') {
                this.isChangedFieldValue = data.content.isChangesAvailable;
            }
        }))
    }
}
