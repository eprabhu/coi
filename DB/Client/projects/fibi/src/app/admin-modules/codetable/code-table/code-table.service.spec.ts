import { TestBed, inject } from '@angular/core/testing';

import { CodeTableService } from './code-table.service';

describe('CodeTableService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CodeTableService]
    });
  });

  it('should be created', inject([CodeTableService], (service: CodeTableService) => {
    expect(service).toBeTruthy();
  }));
});
