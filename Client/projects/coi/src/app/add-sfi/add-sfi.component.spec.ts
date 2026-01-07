/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AddSfiComponent } from './add-sfi.component';

describe('AddSfiComponent', () => {
  let component: AddSfiComponent;
  let fixture: ComponentFixture<AddSfiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSfiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSfiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
