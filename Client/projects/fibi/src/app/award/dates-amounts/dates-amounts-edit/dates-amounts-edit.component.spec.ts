/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DatesAmountsEditComponent } from './dates-amounts-edit.component';

describe('DatesAmountsEditComponent', () => {
  let component: DatesAmountsEditComponent;
  let fixture: ComponentFixture<DatesAmountsEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatesAmountsEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatesAmountsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
