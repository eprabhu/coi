import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RuleLookupsComponent } from './rule-lookups.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { RuleViewModule } from '../rule-view/rule-view.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{path: '', component: RuleLookupsComponent}]),
    SharedModule,
    RuleViewModule,
    FormsModule
  ],
  declarations: [RuleLookupsComponent]
})
export class RuleLookupsModule { }
