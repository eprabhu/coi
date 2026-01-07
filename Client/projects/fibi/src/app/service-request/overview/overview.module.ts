import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverviewComponent } from './overview.component';
import { RouterModule } from '@angular/router';
import { PeopleDurationComponent } from './people-duration/people-duration.component';
import { WatchersComponent } from './watchers/watchers.component';
import { SharedModule } from '../../shared/shared.module';
import { RequestEditComponent } from './request-edit/request-edit.component';
import { RequestViewComponent } from './request-view/request-view.component';
import { FormsModule } from '@angular/forms';
import { OverviewService } from './overview.service';
import { LinkedModuleCardComponent } from './linked-module-card/linked-module-card.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        RouterModule.forChild(
            [
                { path: '', component: OverviewComponent }
            ]
        )
    ],
    declarations: [
        OverviewComponent,
        PeopleDurationComponent,
        WatchersComponent,
        RequestEditComponent,
        RequestViewComponent,
        LinkedModuleCardComponent
    ],
    providers: [
        OverviewService
    ]
})
export class OverviewModule { }
