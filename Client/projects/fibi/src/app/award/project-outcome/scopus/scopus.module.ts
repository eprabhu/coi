import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScopusComponent } from '../scopus/scopus.component';
import { SharedModule } from '../../../shared/shared.module';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([{path: '', component: ScopusComponent}])
  ],
  declarations: [ScopusComponent]
})
export class ScopusModule { }
