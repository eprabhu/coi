/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SharedAttachmentService } from './shared-attachment.service';

describe('Service: SharedAttachment', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SharedAttachmentService]
        });
    });

    it('should ...', inject([SharedAttachmentService], (service: SharedAttachmentService) => {
        expect(service).toBeTruthy();
    }));
});
