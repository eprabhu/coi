import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { UserAuthenticationComponent } from './user-authentication.component';
import { UserAuthenticationService } from './user-authentication.service';
import { OrderrByPipe } from './directives/orderBy.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([{ path: '', component: UserAuthenticationComponent }])
  ],
  declarations: [UserAuthenticationComponent, OrderrByPipe],
  providers: [UserAuthenticationService]
})
export class UserAuthenticationModule { }
