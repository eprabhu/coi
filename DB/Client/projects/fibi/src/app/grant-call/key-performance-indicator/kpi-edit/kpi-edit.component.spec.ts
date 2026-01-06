/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { KpiEditComponent } from './kpi-edit.component';

describe('KpiEditComponent', () => {
  let component: KpiEditComponent;
  let fixture: ComponentFixture<KpiEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KpiEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
