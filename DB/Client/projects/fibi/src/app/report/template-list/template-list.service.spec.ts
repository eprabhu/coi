/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TemplateListService } from './template-list.service';

describe('Service: TemplateList', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TemplateListService]
    });
  });

  it('should ...', inject([TemplateListService], (service: TemplateListService) => {
    expect(service).toBeTruthy();
  }));
});
