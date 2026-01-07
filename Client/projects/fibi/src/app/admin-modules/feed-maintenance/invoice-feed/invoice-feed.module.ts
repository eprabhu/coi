import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {InvoiceFeedComponent} from './invoice-feed.component';
import {RouterModule, Routes} from '@angular/router';
import {InvoiceFeedService} from './invoice-feed.service';

const routes: Routes = [{
    path: '', component: InvoiceFeedComponent, children: [
        {path: '', redirectTo: 'batch-details', pathMatch: 'full'},
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
    declarations: [InvoiceFeedComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes)
    ],
    providers: [InvoiceFeedService]
})
export class InvoiceFeedModule {
}
