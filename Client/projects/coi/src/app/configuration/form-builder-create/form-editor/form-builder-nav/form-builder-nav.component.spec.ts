/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FormBuilderNavComponent } from './form-builder-nav.component';

describe('FormBuilderNavComponent', () => {
  let component: FormBuilderNavComponent;
  let fixture: ComponentFixture<FormBuilderNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormBuilderNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormBuilderNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
