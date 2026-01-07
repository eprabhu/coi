/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { WatchersComponent } from './watchers.component';

describe('WatchersComponent', () => {
  let component: WatchersComponent;
  let fixture: ComponentFixture<WatchersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WatchersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WatchersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
