import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotesAttachmentsComponent } from './notes-attachments.component';
import { RouterModule, Routes } from '@angular/router';
import { NotesAttachmentsService } from './notes-attachments.service';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SharedModule } from '../shared/shared.module';
import { SharedComponentModule } from '../shared-components/shared-component.module';

const routes: Routes = [{ path: '', component: NotesAttachmentsComponent }];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        SharedModule,
        SharedComponentModule,
        MatIconModule,
        MatButtonModule
    ],
    declarations: [NotesAttachmentsComponent],
    exports: [NotesAttachmentsComponent],
    providers: [NotesAttachmentsService]
})
export class NotesAttachmentsModule { }
