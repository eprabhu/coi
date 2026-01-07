/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MergeIpService } from './merge-ip.service';

describe('Service: MergeIp', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MergeIpService]
    });
  });

  it('should ...', inject([MergeIpService], (service: MergeIpService) => {
    expect(service).toBeTruthy();
  }));
});
