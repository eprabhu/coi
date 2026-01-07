/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DatesAmountsComponent } from './dates-amounts.component';

describe('DatesAmountsComponent', () => {
  let component: DatesAmountsComponent;
  let fixture: ComponentFixture<DatesAmountsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatesAmountsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatesAmountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
