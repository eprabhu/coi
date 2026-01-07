/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { IoiEditComponent } from './ioi-edit.component';

describe('IoiEditComponent', () => {
  let component: IoiEditComponent;
  let fixture: ComponentFixture<IoiEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IoiEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IoiEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
