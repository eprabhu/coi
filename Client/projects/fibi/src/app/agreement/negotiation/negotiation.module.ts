import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NegotiationComponent } from './negotiation.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { NegotiationService } from './negotiation.service';
import { LocationComponent } from './location-track/location.component';
import { GeneralCommentsComponent } from './general-comments/general-comments.component';
import { OrderrByPipe } from '../negotiation/location-track/directives/orderBy.pipe';
import { AgreementSharedModule } from '../agreement-shared/agreement-shared.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: NegotiationComponent }]),
    FormsModule,
    SharedModule,
    AgreementSharedModule
  ],
  declarations: [NegotiationComponent, LocationComponent, GeneralCommentsComponent, OrderrByPipe],
  providers: [NegotiationService],
  exports: []
})
export class NegotiationModule { }
