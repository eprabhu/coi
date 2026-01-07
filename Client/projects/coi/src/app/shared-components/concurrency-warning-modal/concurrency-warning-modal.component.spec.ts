/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ConcurrencyWarningModalComponent } from './concurrency-warning-modal.component';

describe('ConcurrencyWarningModalComponent', () => {
  let component: ConcurrencyWarningModalComponent;
  let fixture: ComponentFixture<ConcurrencyWarningModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConcurrencyWarningModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConcurrencyWarningModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
