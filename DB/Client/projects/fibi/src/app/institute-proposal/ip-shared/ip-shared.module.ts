import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IpOverviewModalCardComponent } from './ip-overview-modal-card/ip-overview-modal-card.component';

@NgModule({
    imports: [CommonModule],
    declarations: [IpOverviewModalCardComponent],
    providers: [],
    exports: [IpOverviewModalCardComponent]

})

export class IpSharedModule { }
