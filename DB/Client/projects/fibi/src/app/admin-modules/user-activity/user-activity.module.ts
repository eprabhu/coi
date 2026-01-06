import { UserActivityService } from './user-activity.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserActivityComponent } from './user-activity.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([{ path: '', component: UserActivityComponent }])
  ],
  declarations: [UserActivityComponent],
  providers: [UserActivityService]
})
export class UserActivityModule {
}
