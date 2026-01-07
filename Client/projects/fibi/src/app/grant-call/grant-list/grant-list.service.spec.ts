/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { GrantListService } from './grant-list.service';

describe('Service: GrantList', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GrantListService]
    });
  });

  it('should ...', inject([GrantListService], (service: GrantListService) => {
    expect(service).toBeTruthy();
  }));
});
