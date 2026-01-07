import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PersonTrainingRoutingModule } from './person-training-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TrainingDetailsComponent } from './training-details/training-details.component';
import { PersonTrainingComponent } from './person-training.component';
import { RouteGuardService } from './route-guard.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        PersonTrainingRoutingModule,
    ],
    declarations: [DashboardComponent, TrainingDetailsComponent, PersonTrainingComponent],
    providers: [RouteGuardService]
})
export class PersonTrainingModule {
}
