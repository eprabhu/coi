import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryComponent } from './history.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { HistoryService } from './history.service';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(
            [
                { path: '', component: HistoryComponent }
            ]
        )
    ],
    declarations: [HistoryComponent],
    providers: [HistoryService]
})
export class HistoryModule { }
