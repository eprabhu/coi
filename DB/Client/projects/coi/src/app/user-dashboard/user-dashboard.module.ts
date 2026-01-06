import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UserDashboardComponent} from './user-dashboard.component';
import {RouterModule, Routes} from "@angular/router";
import {MatIconModule} from "@angular/material/icon";
import { CoiService } from '../disclosure/services/coi.service';
import {SharedModule} from "../shared/shared.module";
import {FormsModule} from "@angular/forms";
import { SfiService } from '../disclosure/sfi/sfi.service';
import { SharedComponentModule } from '../shared-components/shared-component.module';
import { AttachmentRouteGuard, DisclosureRouteGuard, NoteRouteGuard, ProjectRouteGuard, UserEngagementResolveGuard } from './user-dashboard-route-guard.service';

const routes: Routes = [
    // {path: '', redirectTo: 'disclosures', pathMatch: 'full'},
    {
        path: '', component: UserDashboardComponent,
        children: [
            {
                path: '', redirectTo: 'home', pathMatch: 'full'
            },
            {
                path: 'home',
                loadChildren: () => import('./user-home/user-home.module').then(m => m.UserHomeModule)
            },
            {
                path: 'disclosures',
                loadChildren: () => import('./user-disclosure/user-disclosure.module').then(m => m.UserDisclosureModule),
                canActivate: [DisclosureRouteGuard]
            },
            {
                path: 'entities',
                loadChildren: () => import('./user-entities/user-entities.module').then(m => m.UserEntitiesModule),
                resolve: { moduleConfig: UserEngagementResolveGuard }
            },
            {
                path: 'awards',
                loadChildren: () => import('./user-projects/user-projects.module').then(m => m.UserProjectsModule),
                canActivate: [ProjectRouteGuard]
            },
            {
                path: 'notes',
                loadChildren: () => import('../notes/notes-attachments.module').then(m => m.NotesAttachmentsModule),
                canActivate: [NoteRouteGuard]
            },
            {
                path: 'attachments',
                loadChildren: () => import('../attachments/attachments.module').then(m => m.AttachmentsModule),
                canActivate: [AttachmentRouteGuard]
            }
        ]
    }];

@NgModule({
    declarations: [
        UserDashboardComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        MatIconModule,
        SharedModule,
        FormsModule,
        SharedComponentModule
    ],
    providers: [CoiService, SfiService, AttachmentRouteGuard, NoteRouteGuard, DisclosureRouteGuard, ProjectRouteGuard, UserEngagementResolveGuard]
})
export class UserDashboardModule {
}
