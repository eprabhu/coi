import { MapMaintenanceRoutingModule } from './map-maintenance-routing.module';

describe('MapMaintenanceRoutingModule', () => {
  let mapMaintenanceRoutingModule: MapMaintenanceRoutingModule;

  beforeEach(() => {
    mapMaintenanceRoutingModule = new MapMaintenanceRoutingModule();
  });

  it('should create an instance', () => {
    expect(mapMaintenanceRoutingModule).toBeTruthy();
  });
});
