import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommentsComponent } from './comments.component';
import { SharedComponentModule } from '../../shared-component/shared-component.module';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        SharedComponentModule,
        RouterModule.forChild(
            [
                { path: '', component: CommentsComponent }
            ]
        )
    ],
    declarations: [CommentsComponent]
})
export class CommentsModule { }
