/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MigratedEngRouterComponent } from './migrated-eng-router.component';

describe('MigratedEngRouterComponent', () => {
  let component: MigratedEngRouterComponent;
  let fixture: ComponentFixture<MigratedEngRouterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MigratedEngRouterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MigratedEngRouterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
