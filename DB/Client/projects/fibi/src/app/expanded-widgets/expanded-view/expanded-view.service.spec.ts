import { TestBed, inject } from '@angular/core/testing';

import { ExpandedViewService } from './expanded-view.service';

describe('ExpandedViewService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExpandedViewService]
    });
  });

  it('should be created', inject([ExpandedViewService], (service: ExpandedViewService) => {
    expect(service).toBeTruthy();
  }));
});
