/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ActivateInactivateSfiModalComponent } from './activate-inactivate-sfi-modal.component';

describe('ActivateInactivateSfiModalComponent', () => {
  let component: ActivateInactivateSfiModalComponent;
  let fixture: ComponentFixture<ActivateInactivateSfiModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivateInactivateSfiModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivateInactivateSfiModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
