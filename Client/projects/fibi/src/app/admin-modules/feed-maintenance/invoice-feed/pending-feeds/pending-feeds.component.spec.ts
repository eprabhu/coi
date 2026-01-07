import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingFeedsComponent } from './pending-feeds.component';

describe('PendingFeedsComponent', () => {
  let component: PendingFeedsComponent;
  let fixture: ComponentFixture<PendingFeedsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PendingFeedsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingFeedsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
