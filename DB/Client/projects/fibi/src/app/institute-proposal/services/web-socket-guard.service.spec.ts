/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { WebSocketGuardService } from './web-socket-guard.service';

describe('Service: WebSocketGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebSocketGuardService]
    });
  });

  it('should ...', inject([WebSocketGuardService], (service: WebSocketGuardService) => {
    expect(service).toBeTruthy();
  }));
});
