/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SubContractsComponent } from './sub-contracts.component';

describe('SubContractsComponent', () => {
  let component: SubContractsComponent;
  let fixture: ComponentFixture<SubContractsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubContractsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubContractsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
