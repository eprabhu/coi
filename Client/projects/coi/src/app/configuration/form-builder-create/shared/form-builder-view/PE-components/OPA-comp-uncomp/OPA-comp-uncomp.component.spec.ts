/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { OPACompUncompComponent } from './OPA-comp-uncomp.component';

describe('OPACompUncompComponent', () => {
  let component: OPACompUncompComponent;
  let fixture: ComponentFixture<OPACompUncompComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OPACompUncompComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OPACompUncompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
