import { TestBed, inject } from '@angular/core/testing';

import { NotificationEngineService } from './notification-engine.service';

describe('NotificationEngineService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationEngineService]
    });
  });

  it('should be created', inject([NotificationEngineService], (service: NotificationEngineService) => {
    expect(service).toBeTruthy();
  }));
});
