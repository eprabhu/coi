/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ExpandedActionListService } from './expanded-action-list.service';

describe('Service: ExpandedActionList', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExpandedActionListService]
    });
  });

  it('should ...', inject([ExpandedActionListService], (service: ExpandedActionListService) => {
    expect(service).toBeTruthy();
  }));
});
