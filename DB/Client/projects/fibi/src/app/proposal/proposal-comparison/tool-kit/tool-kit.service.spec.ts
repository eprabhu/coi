/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ToolKitService } from './tool-kit.service';

describe('Service: ToolKit', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToolKitService]
    });
  });

  it('should ...', inject([ToolKitService], (service: ToolKitService) => {
    expect(service).toBeTruthy();
  }));
});
