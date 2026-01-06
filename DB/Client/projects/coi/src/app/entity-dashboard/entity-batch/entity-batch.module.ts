import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntityBatchComponent } from './entity-batch.component';
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { EntityBatchFilterSearchComponent } from './entity-batch-filter-search/entity-batch-filter-search.component';
import { EntityBatchReviewSliderComponent } from './entity-batch-review-slider/entity-batch-review-slider.component';

const ROUTES: Routes = [{ path: '', component: EntityBatchComponent }];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(ROUTES),
        SharedModule,
        FormsModule,
        SharedComponentModule,
    ],
    declarations: [
        EntityBatchComponent,
        EntityBatchFilterSearchComponent,
        EntityBatchReviewSliderComponent,
    ]
})
export class EntityBatchModule {}
