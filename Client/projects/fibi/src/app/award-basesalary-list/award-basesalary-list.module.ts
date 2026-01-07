import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AwardBasesalaryListComponent } from './award-basesalary-list.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AwardBasesalaryListService } from './award-basesalary-list.service';
import { SharedModule } from '../shared/shared.module';
import { AwardBasesalaryListResolverService } from './award-basesalary-list-resolver.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([{
      path: '', component: AwardBasesalaryListComponent,
      resolve: { baseSalaryPermission: AwardBasesalaryListResolverService }
    }])
  ],
  declarations: [AwardBasesalaryListComponent],
  providers: [
    AwardBasesalaryListResolverService,
    AwardBasesalaryListService]
})
export class AwardBasesalaryListModule { }
