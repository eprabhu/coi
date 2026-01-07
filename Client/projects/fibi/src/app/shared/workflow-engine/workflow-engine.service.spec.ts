/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { WorkflowEngineService } from './workflow-engine.service';

describe('Service: WorkflowEngine', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WorkflowEngineService]
    });
  });

  it('should ...', inject([WorkflowEngineService], (service: WorkflowEngineService) => {
    expect(service).toBeTruthy();
  }));
});
