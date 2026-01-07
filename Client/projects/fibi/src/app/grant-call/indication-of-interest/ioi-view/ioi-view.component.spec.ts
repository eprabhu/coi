/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { IoiViewComponent } from './ioi-view.component';

describe('IoiViewComponent', () => {
  let component: IoiViewComponent;
  let fixture: ComponentFixture<IoiViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IoiViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IoiViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
