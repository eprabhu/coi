import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FeedMaintenanceRouteGuardService } from './feed-maintenance-route-guard.service';
import { FeedMaintenanceComponent } from './feed-maintenance.component';


const routes: Routes = [{
  path: '', component: FeedMaintenanceComponent,
  children: [{ path: '', redirectTo: 'sap-feed', pathMatch: 'full' },
    {
      path: 'sap-feed',
      loadChildren: () => import('./sap-feed/sap-feed.module').then(m => m.SapFeedModule),
      canActivate: [FeedMaintenanceRouteGuardService]
    },
    {
      path: 'manpower-feed',
      loadChildren: () => import('./manpower-feed/manpower-feed.module').then(m => m.ManpowerFeedModule),
      canActivate: [FeedMaintenanceRouteGuardService]
    },
    {
      path: 'invoice-feed',
      loadChildren: () => import('./invoice-feed/invoice-feed.module').then(m => m.InvoiceFeedModule),
      canActivate: [FeedMaintenanceRouteGuardService]
    }
    ]
}];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [FeedMaintenanceRouteGuardService]
})
export class FeedMaintenanceRoutingModule { }
