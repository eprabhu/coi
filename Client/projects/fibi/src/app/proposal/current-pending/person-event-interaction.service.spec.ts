/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PersonEventInteractionService } from './person-event-interaction.service';

describe('Service: PersonEventInteraction', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PersonEventInteractionService]
    });
  });

  it('should ...', inject([PersonEventInteractionService], (service: PersonEventInteractionService) => {
    expect(service).toBeTruthy();
  }));
});
