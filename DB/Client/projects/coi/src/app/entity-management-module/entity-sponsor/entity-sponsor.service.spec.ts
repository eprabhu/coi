/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EntitySponsorService } from './entity-sponsor.service';

describe('Service: EntitySponsor', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [EntitySponsorService]
        });
    });

    it('should ...', inject([EntitySponsorService], (service: EntitySponsorService) => {
        expect(service).toBeTruthy();
    }));
});
