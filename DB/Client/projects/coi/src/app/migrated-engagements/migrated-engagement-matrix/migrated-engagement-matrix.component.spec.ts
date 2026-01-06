/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MigratedEngagementMatrixComponent } from './migrated-engagement-matrix.component';

describe('MigratedEngagementMatrixComponent', () => {
  let component: MigratedEngagementMatrixComponent;
  let fixture: ComponentFixture<MigratedEngagementMatrixComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MigratedEngagementMatrixComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MigratedEngagementMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
