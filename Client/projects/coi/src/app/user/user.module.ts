import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserComponent } from './user.component';
import { UserRoutingModule } from './user-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FaqComponent } from './faq/faq.component';
import { FormsModule } from '@angular/forms';
import { faqService } from './faq/faq.service';
import { AddFaqComponent } from './faq/add-faq/add-faq.component';
import { WafAttachmentService } from '../common/services/waf-attachment.service';
import { AddFaqService } from './faq/add-faq/add-faq.service';
import {CdkAccordionModule} from '@angular/cdk/accordion';
import { SharedComponentModule } from '../shared-components/shared-component.module';

@NgModule({
  imports: [
    CommonModule,
    UserRoutingModule,
    SharedModule,
    FormsModule,
    CdkAccordionModule,
    SharedComponentModule
  ],
  declarations: [
    UserComponent, 
    FaqComponent,
    AddFaqComponent,
  ],
  providers: [faqService, AddFaqService, WafAttachmentService]
})
export class UserModule { }
