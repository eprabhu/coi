import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManpowerInterfacesComponent } from './manpower-interfaces.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../../shared/shared.module';



@NgModule({
  declarations: [ManpowerInterfacesComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([{ path: '', component: ManpowerInterfacesComponent }])
  ]
})
export class ManpowerInterfacesModule { }
