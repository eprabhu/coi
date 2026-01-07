import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainingComponent } from './training.component';
import { RouterModule, Routes } from '@angular/router';
import {SharedModule} from '../../../shared/shared.module';

const routes: Routes = [{path: '', component: TrainingComponent}];

@NgModule({
    declarations: [TrainingComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        SharedModule
    ]
})
export class TrainingModule {
}
