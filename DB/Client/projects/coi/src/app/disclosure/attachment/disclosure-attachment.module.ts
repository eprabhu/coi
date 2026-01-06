import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DisclosureAttachmentComponent } from './disclosure-attachment.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from "../../shared/shared.module";
import { SharedComponentModule } from '../../shared-components/shared-component.module';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        RouterModule.forChild([{ path: '', component: DisclosureAttachmentComponent }]),
        SharedComponentModule
    ],
    declarations: [DisclosureAttachmentComponent]
})
export class DisclosureAttachmentModule { }
