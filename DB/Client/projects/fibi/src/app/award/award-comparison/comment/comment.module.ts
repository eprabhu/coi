import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentComponent } from './comment.component';
import { AddCommentComponent } from './add-comment/add-comment.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommentsService } from './comments.service';
import { CommentListItemComponent } from './comment-list-item/comment-list-item.component';
import { SharedModule } from '../../../shared/shared.module';
import { CommentBoxComponent } from './comment-box/comment-box.component';
import { AddVariationCommentComponent } from './add-variation-comment/add-variation-comment.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([{
      path: 'comments', component: CommentComponent
    }])
  ],
  declarations: [CommentComponent, AddCommentComponent, CommentListItemComponent, CommentBoxComponent,
    AddVariationCommentComponent],
  providers: [CommentsService],
  exports: [AddCommentComponent, CommentListItemComponent, CommentBoxComponent, AddVariationCommentComponent]
})
export class CommentModule { }
