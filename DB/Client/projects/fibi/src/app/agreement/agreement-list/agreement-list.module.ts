import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgreementListComponent } from './agreement-list.component';
import { SharedModule } from '../../shared/shared.module';
import { AgreementListService } from './agreement-list.service';
import {RouterModule, Routes} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AgreementService } from '../agreement.service';
import { AgreementSharedModule } from '../agreement-shared/agreement-shared.module';
import { AgreementCommonDataService } from '../agreement-common-data.service';

const routes: Routes = [
  {path: '', component: AgreementListComponent}
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    AgreementSharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AgreementListComponent],
  providers: [AgreementListService,
              AgreementService,
              AgreementCommonDataService]})
export class AgreementListModule { }
