/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PendingIpsBySponsorTypeComponent } from './pending-ips-by-sponsor-type.component';

describe('PendingIpsBySponsorTypeComponent', () => {
  let component: PendingIpsBySponsorTypeComponent;
  let fixture: ComponentFixture<PendingIpsBySponsorTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PendingIpsBySponsorTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingIpsBySponsorTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
