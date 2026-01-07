/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FormElementViewComponent } from './form-element-view.component';

describe('FormElementViewComponent', () => {
  let component: FormElementViewComponent;
  let fixture: ComponentFixture<FormElementViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormElementViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormElementViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
