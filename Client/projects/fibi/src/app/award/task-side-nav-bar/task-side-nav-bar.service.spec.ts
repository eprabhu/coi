/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TaskSideNavBarService } from './task-side-nav-bar.service';

describe('Service: TaskSideNavBar', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TaskSideNavBarService]
    });
  });

  it('should ...', inject([TaskSideNavBarService], (service: TaskSideNavBarService) => {
    expect(service).toBeTruthy();
  }));
});
