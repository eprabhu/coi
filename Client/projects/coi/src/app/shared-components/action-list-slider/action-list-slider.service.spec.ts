/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ActionListSliderService } from './action-list-slider.service';

describe('Service: ActionListSlider', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ActionListSliderService]
    });
  });

  it('should ...', inject([ActionListSliderService], (service: ActionListSliderService) => {
    expect(service).toBeTruthy();
  }));
});
