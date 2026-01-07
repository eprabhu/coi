import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportingRequirementsComponent } from './reporting-requirements.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ReportingRequirementsService } from './reporting-requirements.service';
import { ReportingRequirementDetailsComponent } from './reporting-requirement-details/reporting-requirement-details.component';
import { SharedComponentModule } from '../../shared-component/shared-component.module';
import { AddReportingRequirementsComponent } from './addReportingRequirements/addReportingRequirements.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([{path: '', component: ReportingRequirementsComponent}]),
        SharedModule,
        SharedComponentModule,
        FormsModule
    ],
    declarations: [
        ReportingRequirementsComponent,
        ReportingRequirementDetailsComponent,
        AddReportingRequirementsComponent
    ],
    providers: [ReportingRequirementsService]
})
export class ReportingRequirementsModule {
}
