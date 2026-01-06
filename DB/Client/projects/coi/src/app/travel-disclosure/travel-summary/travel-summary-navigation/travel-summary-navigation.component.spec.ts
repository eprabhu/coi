import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelSummaryNavigationComponent } from './travel-summary-navigation.component';

describe('TravelSummaryNavigationComponent', () => {
  let component: TravelSummaryNavigationComponent;
  let fixture: ComponentFixture<TravelSummaryNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TravelSummaryNavigationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelSummaryNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
