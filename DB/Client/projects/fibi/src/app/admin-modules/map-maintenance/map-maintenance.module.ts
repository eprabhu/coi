import { MapService } from './common/map.service';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MapListComponent } from './map-list/map-list.component';
import { CreateMapComponent } from './create-map/create-map.component';
import { MapMaintenanceRoutingModule } from './map-maintenance-routing.module';
import { OrderrByPipe } from './directives/orderBy.pipe';
import { FilterPipe } from './directives/filter.pipe';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';

@NgModule({

  imports: [
    MapMaintenanceRoutingModule,
    FormsModule,
    MapMaintenanceRoutingModule,
    CommonModule,
    SharedModule
  ],
  declarations: [
    MapListComponent,
    CreateMapComponent,
    OrderrByPipe,
    FilterPipe,
  ],
  providers: [MapService],
  exports: [OrderrByPipe, FilterPipe],
})
export class MapMaintenanceModule { }
