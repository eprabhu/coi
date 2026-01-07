import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ProjectDashboardService } from '../project-dashboard.service';
import { Subscription } from 'rxjs';
import { HTTP_ERROR_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { SharedProjectDetails } from '../../common/services/coi-common.interface';
import { closeCoiSlider, openCoiSlider } from '../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';

@Component({
    selector: 'app-project-mandatory-history-slider',
    templateUrl: './project-mandatory-history-slider.component.html',
    styleUrls: ['./project-mandatory-history-slider.component.scss']
})
export class ProjectMandatoryHistorySliderComponent implements OnInit {

    @Input() dataForCommentSlider: any;
    @Output() closePage: EventEmitter<any> = new EventEmitter<any>();
    
    $subscriptions: Subscription[] = [];
    historyData: any = []
    projectDetails = new SharedProjectDetails();
    mandatoryHistorySliderId = 'project-mandatory-history-slider';
    isOpenSlider = false;



    constructor(private _projectDashboardService: ProjectDashboardService, private _commonService: CommonService) { }

    ngOnInit() {
        this.projectDetails = this._commonService.setProjectCardDetails(this.dataForCommentSlider?.projectDetails);
        this.loadProjectMandatoryHistory()
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private loadProjectMandatoryHistory(): void {
        this.$subscriptions.push(
            this._projectDashboardService.loadProjectMandatoryHistory(this.dataForCommentSlider?.projectDetails?.projectNumber).subscribe((data: any) => {
                this.historyData = data;
                this.viewSlider();
            }, error => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching project mandatory history. Please try again.');
                this.closePage.emit();
            }));
    }

    private viewSlider(): void {
        if (!this.isOpenSlider) {
            this.isOpenSlider = true;
            setTimeout(() => {
                openCoiSlider(this.mandatoryHistorySliderId);
            });
        }
    }

    closeHistorySlider(): void {
        closeCoiSlider(this.mandatoryHistorySliderId);
        setTimeout(() => {
            this.isOpenSlider = false;
            this.closePage.emit();
        }, 500);
    }

}
