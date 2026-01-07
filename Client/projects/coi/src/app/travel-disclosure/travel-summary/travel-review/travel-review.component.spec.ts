import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelReviewComponent } from './travel-review.component';

describe('TravelReviewComponent', () => {
  let component: TravelReviewComponent;
  let fixture: ComponentFixture<TravelReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TravelReviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
