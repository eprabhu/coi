/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TravelDataFormResolveService } from './travel-data-form-resolve.service';

describe('Service: TravelDataFormResolve', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TravelDataFormResolveService]
        });
    });

    it('should ...', inject([TravelDataFormResolveService], (service: TravelDataFormResolveService) => {
        expect(service).toBeTruthy();
    }));
});
