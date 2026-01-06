import {SharedModule} from '../../shared/shared.module';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {InvoiceService} from './invoice.service';
import {InvoiceComponent} from './invoice.component';
import { RouteGuardService } from './route-guard.service';


const routes: Routes = [
    {
        path: '', component: InvoiceComponent, children: [
            { path: '', redirectTo: 'details', pathMatch: 'full' },
            {
                path: 'summary',
                loadChildren: () => import('./invoice-summary/invoice-summary.module').then(m => m.InvoiceSummaryModule),
                canActivate: [RouteGuardService],
                canDeactivate: [RouteGuardService]
            },
            {
                path: 'details',
                loadChildren: () => import('./invoice-details/invoice-details.module').then(m => m.InvoiceDetailsModule),
                canActivate: [RouteGuardService],
                canDeactivate: [RouteGuardService]
            },
            {
                path: '**',
                loadChildren: () => import('../../error-handler/not-found/not-found.module').then(m => m.NotFoundModule),
            }
        ]
    },
];

@NgModule({
    declarations: [InvoiceComponent],
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        RouterModule.forChild(routes),
    ],
    providers: [InvoiceService, RouteGuardService]
})
export class InvoiceModule {
}
