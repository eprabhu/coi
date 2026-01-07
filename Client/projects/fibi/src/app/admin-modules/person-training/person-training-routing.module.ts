import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { TrainingDetailsComponent } from './training-details/training-details.component';
import { PersonTrainingComponent } from './person-training.component';
import { RouteGuardService } from './route-guard.service';

const routes: Routes = [
    {
        path: '', component: PersonTrainingComponent, children: [
            {path: '', component: DashboardComponent,
                canActivate: [RouteGuardService]},
            {path: 'person-detail', component: TrainingDetailsComponent,
                canActivate: [RouteGuardService]}
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class PersonTrainingRoutingModule {
}
