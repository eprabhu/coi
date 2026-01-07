import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { UserProjectsComponent } from './user-projects.component';
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { UserProjectResolverGuardService } from './user-project-resolver-guard.service';

const routes: Routes = [{ path: '', component: UserProjectsComponent, canDeactivate: [UserProjectResolverGuardService] }];

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        SharedModule,
        SharedComponentModule,
        RouterModule.forChild(routes),
    ],
    declarations: [
        UserProjectsComponent
    ],
    providers: [UserProjectResolverGuardService]
})
export class UserProjectsModule {}
