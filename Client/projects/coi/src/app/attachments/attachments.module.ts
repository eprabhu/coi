import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttachmentsComponent } from './attachments.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedComponentModule } from '../shared-components/shared-component.module';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [{ path: '', component: AttachmentsComponent }];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        RouterModule.forChild(routes),
        SharedComponentModule
    ],
    declarations: [AttachmentsComponent],
    exports: [AttachmentsComponent]
})
export class AttachmentsModule { }
