import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousExcludedComponent } from './previous-excluded.component';

describe('PreviousExcludedComponent', () => {
  let component: PreviousExcludedComponent;
  let fixture: ComponentFixture<PreviousExcludedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviousExcludedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviousExcludedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
