import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SapFeedComponent } from './sap-feed.component';
import { Routes, RouterModule as SapRouterModule } from '@angular/router';
import { SapFeedService } from './sap-feed.service';

const sapRoutes: Routes = [
  { path: '', component: SapFeedComponent,
    children: [
      { path: '', redirectTo: 'batch-details', pathMatch: 'full' },
      {
        path: 'batch-details',
        loadChildren: () => import('./batch-details/batch-details.module').then(m => m.BatchDetailsModule)
      },
      {
        path: 'pending-feeds',
        loadChildren: () => import('./pending-feeds/pending-feeds.module').then(m => m.PendingFeedsModule)
      },
      {
        path: 'batch-history',
        loadChildren: () => import('./batch-history/batch-history.module').then(m => m.BatchHistoryModule)
      }] 
  }];

@NgModule({
  declarations: [SapFeedComponent],
  imports: [
    SapRouterModule.forChild(sapRoutes),
    CommonModule
  ],
  providers: [SapFeedService]
})
export class SapFeedModule { }
