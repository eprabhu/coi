import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { MapListComponent } from './map-list/map-list.component';
import { CreateMapComponent } from './create-map/create-map.component';


const routes: Routes = [
  { path: '', component: MapListComponent },
  { path: 'create', component: CreateMapComponent },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MapMaintenanceRoutingModule { }
