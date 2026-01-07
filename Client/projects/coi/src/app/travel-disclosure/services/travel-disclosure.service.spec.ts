import { TestBed, inject } from '@angular/core/testing';
import { TravelDisclosureService } from './travel-disclosure.service';

describe('Service: TravelDisclosure', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TravelDisclosureService]
        });
    });

    it('should ...', inject([TravelDisclosureService], (service: TravelDisclosureService) => {
        expect(service).toBeTruthy();
    }));
});
