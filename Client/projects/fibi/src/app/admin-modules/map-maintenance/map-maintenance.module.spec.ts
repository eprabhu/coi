import { MapMaintenanceModule } from './map-maintenance.module';

describe('MapMaintenanceModule', () => {
  let mapMaintenanceModule: MapMaintenanceModule;

  beforeEach(() => {
    mapMaintenanceModule = new MapMaintenanceModule();
  });

  it('should create an instance', () => {
    expect(mapMaintenanceModule).toBeTruthy();
  });
});
