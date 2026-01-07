import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentsComponent } from './comments.component';
import { RouterModule } from '@angular/router';
import { SharedComponentModule } from '../../shared-component/shared-component.module';

@NgModule({
  imports: [
    CommonModule,
    SharedComponentModule,
    RouterModule.forChild([{path: '', component: CommentsComponent}]),
  ],
  declarations: [CommentsComponent]
})
export class CommentsModule { }
