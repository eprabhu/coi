/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ClaimsSubmittedToSponsorByFYComponent } from './claims-submitted-to-sponsor-by-FY.component';

describe('ClaimsSubmittedToSponsorByFYComponent', () => {
  let component: ClaimsSubmittedToSponsorByFYComponent;
  let fixture: ComponentFixture<ClaimsSubmittedToSponsorByFYComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimsSubmittedToSponsorByFYComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimsSubmittedToSponsorByFYComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
