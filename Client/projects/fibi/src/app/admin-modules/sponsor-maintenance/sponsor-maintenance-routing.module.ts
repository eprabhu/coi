import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {path: '', redirectTo: 'sponsor-list', pathMatch: 'full'},
    {path: 'sponsor-list', loadChildren: () => import('./sponsor-list/sponsor-list.module').then(m => m.SponsorListModule) },
    {path: 'sponsor-view', loadChildren: () => import('./sponsor-view/sponsor-view.module').then(m => m.SponsorViewModule) },
    {path: 'sponsor-detail', loadChildren: () => import('./sponsor-detail/sponsor-detail.module').then(m => m.SponsorDetailModule) },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })

  export class SponsorMaintenanceRoutingModule {}
