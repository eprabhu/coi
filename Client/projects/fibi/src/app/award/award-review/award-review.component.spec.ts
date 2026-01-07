import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AwardReviewComponent } from './award-review.component';

describe('AwardReviewComponent', () => {
  let component: AwardReviewComponent;
  let fixture: ComponentFixture<AwardReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AwardReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AwardReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
