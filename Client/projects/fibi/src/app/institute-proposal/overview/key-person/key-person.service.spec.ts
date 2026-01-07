/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { KeyPersonService } from './key-person.service';

describe('Service: KeyPerson', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KeyPersonService]
    });
  });

  it('should ...', inject([KeyPersonService], (service: KeyPersonService) => {
    expect(service).toBeTruthy();
  }));
});
