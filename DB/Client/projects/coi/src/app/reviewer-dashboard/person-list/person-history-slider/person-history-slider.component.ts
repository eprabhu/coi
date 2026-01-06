import { CommonModule } from '@angular/common';
import { FormSharedModule } from '../../../configuration/form-builder-create/shared/shared.module';
import { SharedComponentModule } from '../../../shared-components/shared-component.module';
import { SharedModule } from '../../../shared/shared.module';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';
import { ReviewerDashboardService } from '../../services/reviewer-dashboard.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { HTTP_ERROR_STATUS } from '../../../app-constants';
import { openCoiSlider, closeCoiSlider } from '../../../common/utilities/custom-utilities';
import { PersonListTabTypes } from '../../reviewer-dashboard.interface';
import { PersonListTableComponent } from '../person-list-table/person-list-table.component';

@Component({
    selector: 'app-person-history-slider',
    templateUrl: './person-history-slider.component.html',
    styleUrls: ['./person-history-slider.component.scss'],
    standalone: true,
    imports: [CommonModule, SharedModule, SharedComponentModule, FormSharedModule, PersonListTableComponent]
})
export class PersonHistorySliderComponent implements OnInit {

    @Input() historySliderData: any;
    @Input() personListTabType: PersonListTabTypes;
    @Output() closePage: EventEmitter<any> = new EventEmitter<any>();

    $subscriptions: Subscription[] = [];
    historyData: any = []
    mandatoryHistorySliderId = 'person-history-slider';
    isOpenSlider = false;
    isLoading = false;

    constructor(private _commonService: CommonService, private _reviewerDashboardService: ReviewerDashboardService) { }

    ngOnInit() {
        this.fetchPersonHistory()
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private viewSlider(): void {
        if (!this.isOpenSlider) {
            this.isOpenSlider = true;
            setTimeout(() => {
                openCoiSlider(this.mandatoryHistorySliderId);
            });
        }
    }

    private fetchPersonHistory(): void {
        this.isLoading = true;
        this.$subscriptions.push(
            this._reviewerDashboardService.getPersonHistory(this.historySliderData.personDetailsForHistorySlider.personId).subscribe((data: any) => {
                this.historyData = data;
                this.isLoading = false;
                this.viewSlider();
            }, error => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching person history. Please try again.');
                this.closePage.emit();
                this.isLoading = false;
            }));
    }

    closeHistorySlider(): void {
        closeCoiSlider(this.mandatoryHistorySliderId);
        setTimeout(() => {
            this.isOpenSlider = false;
            this.closePage.emit();
        }, 500);
    }

}
