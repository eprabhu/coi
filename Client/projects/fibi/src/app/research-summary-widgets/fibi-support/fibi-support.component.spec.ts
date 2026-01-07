/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FibiSupportComponent } from './fibi-support.component';

describe('FibiSupportComponent', () => {
  let component: FibiSupportComponent;
  let fixture: ComponentFixture<FibiSupportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FibiSupportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FibiSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
