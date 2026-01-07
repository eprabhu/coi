import { TestBed, inject } from '@angular/core/testing';

import { ProjectTeamService } from './project-team.service';

describe('ProjectTeamService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectTeamService]
    });
  });

  it('should be created', inject([ProjectTeamService], (service: ProjectTeamService) => {
    expect(service).toBeTruthy();
  }));
});
