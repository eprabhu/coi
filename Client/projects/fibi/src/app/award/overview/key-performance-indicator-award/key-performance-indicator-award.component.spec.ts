/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { KeyPerformanceIndicatorAwardComponent } from './key-performance-indicator-award.component';

describe('KeyPerformanceIndicatorAwardComponent', () => {
  let component: KeyPerformanceIndicatorAwardComponent;
  let fixture: ComponentFixture<KeyPerformanceIndicatorAwardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KeyPerformanceIndicatorAwardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyPerformanceIndicatorAwardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
