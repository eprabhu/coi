/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AddReportingRequirementsComponent } from './addReportingRequirements.component';

describe('AddReportingRequirementsComponent', () => {
  let component: AddReportingRequirementsComponent;
  let fixture: ComponentFixture<AddReportingRequirementsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddReportingRequirementsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddReportingRequirementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
