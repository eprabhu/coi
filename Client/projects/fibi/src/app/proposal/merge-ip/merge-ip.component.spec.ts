/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MergeIpComponent } from './merge-ip.component';

describe('MergeIpComponent', () => {
  let component: MergeIpComponent;
  let fixture: ComponentFixture<MergeIpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MergeIpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MergeIpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
