/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SfiListComponent } from './sfi-list.component';

describe('SfiListComponent', () => {
  let component: SfiListComponent;
  let fixture: ComponentFixture<SfiListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SfiListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SfiListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
