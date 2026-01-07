import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeopleDurationComponent } from './people-duration.component';

describe('PeopleDurationComponent', () => {
  let component: PeopleDurationComponent;
  let fixture: ComponentFixture<PeopleDurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeopleDurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeopleDurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
