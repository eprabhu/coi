import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceRequestListComponent } from './service-request-list.component';
import { RouterModule } from '@angular/router';
import { ServiceRequestListService } from './service-request-list.service';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        RouterModule.forChild(
            [
                { path: '', component: ServiceRequestListComponent }
            ]
        )
    ],
    declarations: [ ServiceRequestListComponent ],
    providers: [ ServiceRequestListService ]
})
export class ServiceRequestListModule { }
