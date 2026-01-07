import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ClaimOverviewComponent } from './claim-overview.component';
import {ClaimOverviewService} from './claim-overview.service';

const routes: Routes = [
    {path: '', component: ClaimOverviewComponent}
];

@NgModule({
    declarations: [ClaimOverviewComponent],
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        SharedModule,
        FormsModule
    ],
    providers: [ClaimOverviewService]
})
export class ClaimOverviewModule {
}
