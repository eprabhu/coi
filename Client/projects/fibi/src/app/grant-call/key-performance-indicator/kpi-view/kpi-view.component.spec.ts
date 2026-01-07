/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { KpiViewComponent } from './kpi-view.component';

describe('KpiViewComponent', () => {
  let component: KpiViewComponent;
  let fixture: ComponentFixture<KpiViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KpiViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
