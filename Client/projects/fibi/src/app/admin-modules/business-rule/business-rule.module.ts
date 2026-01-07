import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CreateFirstComponent } from './create-first/create-first.component';
import { CreateFinalComponent } from './create-final/create-final.component';
import { OrderrByPipe } from './directives/orderBy.pipe';
import { FilterPipe } from './directives/filter.pipe';
import { BusinessRuleRoutingModule } from './business-rule-routing.module';
import { CommonModule } from '@angular/common';
import { BusinessRuleService } from './common/businessrule.service';
import { BusinessRuleComponent } from './business-rule.component';
import { SharedModule } from '../../shared/shared.module';
import { RuleDefinitionComponent } from './create-final/rule-definition/rule-definition.component';
import { RuleFunctionParametersComponent } from './create-final/rule-function-parameters/rule-function-parameters.component';
import { QuestionAnswerComponent } from './create-final/question-answer/question-answer.component';
@NgModule({
  declarations: [
    CreateFirstComponent,
    CreateFinalComponent,
    OrderrByPipe,
    FilterPipe,
    BusinessRuleComponent,
    RuleDefinitionComponent,
    RuleFunctionParametersComponent,
    QuestionAnswerComponent
  ],
  imports: [
    FormsModule,
    BusinessRuleRoutingModule,
    CommonModule,
    SharedModule
  ],
  providers: [BusinessRuleService, DatePipe],
  exports: [OrderrByPipe, FilterPipe],
})
export class BusinessRuleModule { }
