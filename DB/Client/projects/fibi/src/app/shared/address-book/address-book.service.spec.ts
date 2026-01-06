/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AddressBookService } from './address-book.service';

describe('Service: AddressBook', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AddressBookService]
    });
  });

  it('should ...', inject([AddressBookService], (service: AddressBookService) => {
    expect(service).toBeTruthy();
  }));
});
