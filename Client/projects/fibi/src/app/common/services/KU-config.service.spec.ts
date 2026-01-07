/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { KUConfigService } from './KU-config.service';

describe('Service: KUConfig', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KUConfigService]
    });
  });

  it('should ...', inject([KUConfigService], (service: KUConfigService) => {
    expect(service).toBeTruthy();
  }));
});
