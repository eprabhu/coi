import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { AnticipatedDistributionService } from './anticipated-distribution.service';
import { AnticipatedDistributionComponent } from './anticipated-distribution.component';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FormsModule
    ],
    declarations: [
        AnticipatedDistributionComponent
    ],
    exports: [
        AnticipatedDistributionComponent
    ],
    providers: [
        AnticipatedDistributionService
    ]
})
export class AnticipatedDistributionModule { }
