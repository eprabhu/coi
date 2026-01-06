import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgreementFormComponent } from './agreement-form.component';
import { GeneralDetailsComponent } from './general-details/general-details.component';
import { QuestionnaireComponent } from './questionnaire/questionnaire.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { OrganisationComponent } from './organisation/organisation.component';
import { PersonComponent } from './person/person.component';
import { GeneralDetailsViewComponent } from './general-details/general-details-view/general-details-view.component';
import { AgreementClausesComponent } from './agreement-clauses/agreement-clauses.component';
import { AgreementClausesService } from './agreement-clauses/agreement-clauses.service';
import { AttachmentsService } from '../attachments/attachments.service';
import { OtherInformationComponent } from './other-information/other-information.component';
import { SharedComponentModule } from '../../shared-component/shared-component.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([{ path: '', component: AgreementFormComponent}]),
    SharedComponentModule
  ],
  declarations: [AgreementFormComponent, GeneralDetailsComponent, PersonComponent, OrganisationComponent,
    QuestionnaireComponent, GeneralDetailsViewComponent, AgreementClausesComponent,OtherInformationComponent],
    providers: [AgreementClausesService, AttachmentsService]
})
export class AgreementFormModule { }
