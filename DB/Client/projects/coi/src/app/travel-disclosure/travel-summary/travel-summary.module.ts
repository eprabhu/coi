import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TravelSummaryComponent } from './travel-summary.component';
import { TravelReviewComponent } from './travel-review/travel-review.component';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { SharedModule } from '../../shared/shared.module';
import { TravelFormSummaryComponent } from './travel-review/travel-form-summary/travel-form-summary.component';
import { TravelCertifySummaryComponent } from './travel-review/travel-certify-summary/travel-certify-summary.component';
import { AddSfiModule } from '../../add-sfi/add-sfi.module';
import { EntityDetailsModule } from '../../disclosure/entity-details/entity-details.module';
import { TravelSummaryNavigationComponent } from './travel-summary-navigation/travel-summary-navigation.component';

const routes: Routes = [
    {
        path: '', component: TravelSummaryComponent,
        children: [ {path: '', redirectTo: 'form', pathMatch: 'full'},
                    {
                        path: '',
                        loadChildren: () => import('../travel-disclosure-updated-form/form/form.module').then(m => m.FormModule)
                    },]
    }
];

@NgModule({
    declarations: [
        TravelSummaryComponent,
        TravelReviewComponent,
        TravelFormSummaryComponent,
        TravelCertifySummaryComponent,
        TravelSummaryNavigationComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        RouterModule.forChild(routes),
        AddSfiModule,
        SharedComponentModule,
        EntityDetailsModule
    ]
})
export class TravelSummaryModule { }
