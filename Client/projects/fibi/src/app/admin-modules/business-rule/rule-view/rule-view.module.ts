import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RuleViewComponent } from './rule-view.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [RuleViewComponent],
  exports: [RuleViewComponent]
})
export class RuleViewModule { }
