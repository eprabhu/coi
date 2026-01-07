/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { OpaPersonEngagementService } from './opa-person-engagement.service';

describe('Service: OpaPersonEngagement', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [OpaPersonEngagementService]
        });
    });

    it('should ...', inject([OpaPersonEngagementService], (service: OpaPersonEngagementService) => {
        expect(service).toBeTruthy();
    }));
});
