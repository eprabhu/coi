/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ExpandedWidgetsService } from './expanded-widgets.service';

describe('Service: ExpandedWidgets', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExpandedWidgetsService]
    });
  });

  it('should ...', inject([ExpandedWidgetsService], (service: ExpandedWidgetsService) => {
    expect(service).toBeTruthy();
  }));
});
