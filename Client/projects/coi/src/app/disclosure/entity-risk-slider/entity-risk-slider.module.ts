import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntityRiskSliderComponent } from './entity-risk-slider.component';
import { SharedModule } from '../../shared/shared.module';
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { EntityRiskSliderService } from './entity-risk-slider.service';
import { FormsModule } from '@angular/forms';
import { CoiSummaryEventsAndStoreService } from '../summary/services/coi-summary-events-and-store.service';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        SharedComponentModule,
        FormsModule
    ],
    declarations: [EntityRiskSliderComponent],
    exports: [EntityRiskSliderComponent],
    providers: [EntityRiskSliderService, CoiSummaryEventsAndStoreService]
})
export class EntityRiskSliderModule { }
