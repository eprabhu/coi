import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryOfProgressComponent } from './summary-of-progress.component';

describe('SummaryOfProgressComponent', () => {
  let component: SummaryOfProgressComponent;
  let fixture: ComponentFixture<SummaryOfProgressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummaryOfProgressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryOfProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
