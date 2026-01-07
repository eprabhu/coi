import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GrantCallModalCardComponent } from './grant-call-modal-card/grant-call-modal-card.component';

@NgModule({
    imports: [CommonModule],
    declarations: [GrantCallModalCardComponent],
    providers: [],
    exports: [GrantCallModalCardComponent]
})

export class GrantCallSharedModule { }
