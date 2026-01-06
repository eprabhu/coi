/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CompleteDisclosureHistoryService } from './complete-dislcosure-history.service';

describe('Service: CompleteDisclosureHistoryService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [CompleteDisclosureHistoryService]
        });
    });

    it('should ...', inject([CompleteDisclosureHistoryService], (service: CompleteDisclosureHistoryService) => {
        expect(service).toBeTruthy();
    }));
});
