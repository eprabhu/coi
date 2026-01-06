/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { OPAStudentSubordinateEmployeeComponent } from './OPA-student-subordinate-employee.component';

describe('OPAStudentSubordinateEmployeeComponent', () => {
  let component: OPAStudentSubordinateEmployeeComponent;
  let fixture: ComponentFixture<OPAStudentSubordinateEmployeeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OPAStudentSubordinateEmployeeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OPAStudentSubordinateEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
