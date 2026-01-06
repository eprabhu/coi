import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetaRuleComponent } from './meta-rule.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { RuleViewModule } from '../rule-view/rule-view.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{path: '', component: MetaRuleComponent}]),
    SharedModule,
    FormsModule,
    RuleViewModule
  ],
  declarations: [MetaRuleComponent]
})
export class MetaRuleModule { }
