/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { OPAOutsideFinancialRelationComponent } from './OPA-outside-financial-relation.component';

describe('OPAOutsideFinancialRelationComponent', () => {
  let component: OPAOutsideFinancialRelationComponent;
  let fixture: ComponentFixture<OPAOutsideFinancialRelationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OPAOutsideFinancialRelationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OPAOutsideFinancialRelationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
