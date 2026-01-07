import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ElasticMonitoringComponent } from './elastic-monitoring.component';
import { ElasticMessageReceivedComponent } from './elastic-message-received/elastic-message-received.component';
import { ElasticMessageDeletedComponent } from './elastic-message-deleted/elastic-message-deleted.component';
import { ElasticMessageSendComponent } from './elastic-message-send/elastic-message-send.component';
import { ElasticMessageSizeComponent } from './elastic-message-size/elastic-message-size.component';
import { ElasticMonitoringService } from './elastic-monitoring.service';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([{ path: '', component: ElasticMonitoringComponent }]),
        SharedModule,
        FormsModule,
    ],
    declarations: [
        ElasticMonitoringComponent,
        ElasticMessageReceivedComponent,
        ElasticMessageDeletedComponent,
        ElasticMessageSendComponent,
        ElasticMessageSizeComponent
    ],
    providers: [
        ElasticMonitoringService
    ]
})
export class ElasticMonitoringModule { }
