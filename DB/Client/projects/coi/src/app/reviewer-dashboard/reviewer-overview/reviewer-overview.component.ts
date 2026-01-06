import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { OverviewHeaderComponent } from './overview-header/overview-header.component';
import { OverviewDepartmentComponent } from './overview-department/overview-department.component';
import { NavigationService } from '../../common/services/navigation.service';
import { ReviewerDashboardService } from '../services/reviewer-dashboard.service';
import { ReviewerDashboardSearchValues, ReviewerDashboardRo, SelectedUnit } from '../reviewer-dashboard.interface';
import { REVIEWER_ADMIN_DASHBOARD_BASE_URL } from '../reviewer-dashboard-constants';

@Component({
    selector: 'app-reviewer-overview',
    templateUrl: './reviewer-overview.component.html',
    styleUrls: ['./reviewer-overview.component.scss'],
    standalone: true,
    imports: [RouterModule, MatIconModule, CommonModule, FormsModule, OverviewHeaderComponent, OverviewDepartmentComponent]
})
export class ReviewerOverviewComponent implements OnInit {

    constructor(private _navigationService: NavigationService, public reviewerDashboardService: ReviewerDashboardService) { }

    ngOnInit(): void {
        this.resetServiceVariables();
    }

    private resetServiceVariables(): void {
        if (!this._navigationService.previousURL.includes(REVIEWER_ADMIN_DASHBOARD_BASE_URL)) {
            this.reviewerDashboardService.resetOverviewVariables();
        }
    }

}
