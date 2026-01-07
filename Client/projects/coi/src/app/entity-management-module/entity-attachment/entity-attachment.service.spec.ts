/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EntityAttachmentService } from './entity-attachment.service';

describe('Service: EntityAttachment', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [EntityAttachmentService]
        });
    });

    it('should ...', inject([EntityAttachmentService], (service: EntityAttachmentService) => {
        expect(service).toBeTruthy();
    }));
});
