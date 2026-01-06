import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReviewComponent } from './review.component';
import { ReviewService } from './review.service';
import { LocationComponent } from './location-track/location.component';
import {SharedModule} from '../../shared/shared.module';
import { ReviewHistoryComponent } from './review-history/review-history.component';
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([{ path: '', component: ReviewComponent }]),
        FormsModule,
        SharedModule,
        SharedComponentModule,
        MatDatepickerModule,
        MatIconModule
      ],
    declarations: [
        ReviewComponent,
        LocationComponent,
        ReviewHistoryComponent
    ],
    providers: [ReviewService]
})
export class ReviewModule {
}
