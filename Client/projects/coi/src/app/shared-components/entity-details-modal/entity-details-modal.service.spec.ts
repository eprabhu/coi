/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EntityDetailsModalService } from './entity-details-modal.service';

describe('Service: EntityDetailsModal', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [EntityDetailsModalService]
        });
    });

    it('should ...', inject([EntityDetailsModalService], (service: EntityDetailsModalService) => {
        expect(service).toBeTruthy();
    }));
});
