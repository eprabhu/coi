import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManPowerComponent } from './man-power.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ManPowerService } from './man-power.service';
import { SharedModule } from '../../shared/shared.module';
import { OtherCategoryDetailsComponent } from './other-category-details/other-category-details.component';
import { EomCategoryDetailComponent } from './eom-category-detail/eom-category-detail.component';
import { RssCategoryDetailsComponent } from './rss-category-details/rss-category-details.component';
import { ManpowerPersonDetailsComponent } from './manpower-person-details/manpower-person-details.component';
import { AddManpowerResourceComponent } from './add-manpower-resource/add-manpower-resource.component';
import { ManpowerAddressBookComponent } from './manpower-address-book/manpower-address-book.component';
import { AddStudentOrOthersComponent } from './add-student-or-others/add-student-or-others.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([{ path: '', component: ManPowerComponent }])
  ],
  declarations: [ManPowerComponent, OtherCategoryDetailsComponent, AddManpowerResourceComponent,
    EomCategoryDetailComponent, RssCategoryDetailsComponent, ManpowerPersonDetailsComponent, ManpowerAddressBookComponent,
     AddStudentOrOthersComponent],
  providers: [ManPowerService]
})
export class ManPowerModule { }
