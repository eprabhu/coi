/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ElasticConfigService } from './elastic-config.service';

describe('Service: ElasticConfig', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ElasticConfigService]
    });
  });

  it('should ...', inject([ElasticConfigService], (service: ElasticConfigService) => {
    expect(service).toBeTruthy();
  }));
});
