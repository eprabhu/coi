import { TestBed, inject } from '@angular/core/testing';

import { WafAttachmentService } from './waf-attachment.service';

describe('WafAttachmentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WafAttachmentService]
    });
  });

  it('should be created', inject([WafAttachmentService], (service: WafAttachmentService) => {
    expect(service).toBeTruthy();
  }));
});
