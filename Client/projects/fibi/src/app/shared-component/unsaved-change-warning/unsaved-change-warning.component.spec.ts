import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnsavedChangeWarningComponent } from './unsaved-change-warning.component';

describe('UnsavedChangeWarningComponent', () => {
  let component: UnsavedChangeWarningComponent;
  let fixture: ComponentFixture<UnsavedChangeWarningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnsavedChangeWarningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnsavedChangeWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
