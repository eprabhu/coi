import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialReviewDetailsComponent } from './special-review.component';

describe('SpecialReviewDetailsComponent', () => {
  let component: SpecialReviewDetailsComponent;
  let fixture: ComponentFixture<SpecialReviewDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecialReviewDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialReviewDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
