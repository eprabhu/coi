import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonRelatedSlidersComponent } from './person-related-sliders.component';
import { SharedModule } from '../shared/shared.module';
import { SharedComponentModule } from '../shared-components/shared-component.module';
import { SfiModule } from '../disclosure/sfi/sfi.module';
import { NotesAttachmentsModule } from '../notes/notes-attachments.module';
import { AttachmentsModule } from '../attachments/attachments.module';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        SharedComponentModule,
        SfiModule,
        NotesAttachmentsModule,
        AttachmentsModule
    ],
    declarations: [PersonRelatedSlidersComponent],
    exports: [PersonRelatedSlidersComponent]
})
export class PersonRelatedSlidersModule { }
