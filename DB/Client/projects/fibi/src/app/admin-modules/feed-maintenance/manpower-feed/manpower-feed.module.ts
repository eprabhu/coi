import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManpowerFeedComponent } from './manpower-feed.component';
import { RouterModule, Routes } from '@angular/router';
import { ManpowerFeedService } from './manpower-feed.service';
import { DateFormatPipe, DateFormatPipeWithTimeZone } from '../../../shared/pipes/custom-date.pipe';
import { SharedModule } from '../../../shared/shared.module';

const routes: Routes = [{
  path: '', component: ManpowerFeedComponent,
  children: [
    { path: '', redirectTo: 'manpower-interfaces', pathMatch: 'full' },
    {
      path: 'manpower-interfaces',
      loadChildren: () => import('./manpower-interfaces/manpower-interfaces.module').then(m => m.ManpowerInterfacesModule)
    },
    {
      path: 'scheduler-interfaces',
      loadChildren: () => import('./scheduler-interfaces/scheduler-interfaces.module').then(m => m.SchedulerInterfacesModule)
    }
  ],
}];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule

  ],
  declarations: [ManpowerFeedComponent],
  providers: [ManpowerFeedService]
})
export class ManpowerFeedModule { }
