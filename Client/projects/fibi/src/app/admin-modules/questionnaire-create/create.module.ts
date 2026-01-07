import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { QuestionnaireDataResolverService } from './services/questionnairedata-resolver.service';
import { CreateRoutingModule } from './create-routing.module';
import { CreateQuestionnaireComponent } from './create-main/create-questionnaire/create-questionnaire.component';
import { QuestionnaireTreeComponent } from './create-main/questionnaire-tree/questionnaire-tree.component';
import { PreviewQuestionnaireComponent } from './create-main/preview-questionnaire/preview-questionnaire.component';
import { MainRouterComponent } from './main-router.component';
import { QuestionnaireListComponent } from './maintenance/questionnaire-list/questionnaire-list.component';
import { CreateMainComponent } from './create-main/create-main.component';
import { CreateQuestionnaireService } from './services/create.service';

import { BasicDetailsComponent } from './create-main/basic-details/basic-details.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { QuestionnaireSortComponent } from './maintenance/questionnaire-sort/questionnaire-sort.component';
import { OrderbyPipe } from './maintenance/order-by.pipe';
import { SharedModule } from '../../shared/shared.module';
import { AutoGrowDirective } from './services/autoGrow.directive';
import { RuleSummaryComponent } from './create-main/rule-summary/rule-summary.component';

@NgModule({
  imports: [
    CommonModule,
    CreateRoutingModule,
    FormsModule,
    SharedModule
  ],
  declarations: [ CreateQuestionnaireComponent,
                  QuestionnaireTreeComponent,
                  PreviewQuestionnaireComponent,
                  MainRouterComponent,
                  QuestionnaireListComponent,
                  CreateMainComponent,
                  BasicDetailsComponent,
                  MaintenanceComponent,
                  QuestionnaireSortComponent,
                  OrderbyPipe,
                  AutoGrowDirective,
                  RuleSummaryComponent
                ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [QuestionnaireDataResolverService,
              CreateQuestionnaireService]
})
export class CreateModule { }
