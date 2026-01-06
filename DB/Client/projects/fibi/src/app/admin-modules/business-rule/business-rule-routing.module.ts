import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import {CreateFirstComponent} from './create-first/create-first.component';
import { BusinessRuleComponent } from './business-rule.component';

const routes: Routes = [{
  path: '', component: BusinessRuleComponent ,
  children: [
    {path: '', redirectTo: 'ruleLookup', pathMatch: 'full'},
    {
      path: 'metaRules',
      loadChildren: () => import('./meta-rule/meta-rule.module').then(m => m.MetaRuleModule),
    },
    {
      path: 'ruleLookup',
      loadChildren: () => import('./rule-lookups/rule-lookups.module').then(m => m.RuleLookupsModule),
    },
    { path: 'create', component: CreateFirstComponent},
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BusinessRuleRoutingModule { }
