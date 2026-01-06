import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentAwardsComponent } from './recent-awards.component';

describe('RecentAwardsComponent', () => {
  let component: RecentAwardsComponent;
  let fixture: ComponentFixture<RecentAwardsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecentAwardsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecentAwardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
