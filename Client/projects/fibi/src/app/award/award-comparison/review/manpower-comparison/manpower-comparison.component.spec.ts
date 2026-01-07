/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ManpowerComponent } from './manpower-comparison.component';

describe('ManpowerComponent', () => {
  let component: ManpowerComponent;
  let fixture: ComponentFixture<ManpowerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManpowerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManpowerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
