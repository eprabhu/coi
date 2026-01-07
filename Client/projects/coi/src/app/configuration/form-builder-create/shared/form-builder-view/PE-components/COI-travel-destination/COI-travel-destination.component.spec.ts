import { ComponentFixture, TestBed } from '@angular/core/testing';

import { COITravelDestinationComponent } from './COI-travel-destination.component';

describe('COITravelDestinationComponent', () => {
  let component: COITravelDestinationComponent;
  let fixture: ComponentFixture<COITravelDestinationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ COITravelDestinationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(COITravelDestinationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
