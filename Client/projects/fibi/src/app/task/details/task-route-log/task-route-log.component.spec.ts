/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TaskRouteLogComponent } from './task-route-log.component';

describe('TaskRouteLogComponent', () => {
  let component: TaskRouteLogComponent;
  let fixture: ComponentFixture<TaskRouteLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskRouteLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskRouteLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
