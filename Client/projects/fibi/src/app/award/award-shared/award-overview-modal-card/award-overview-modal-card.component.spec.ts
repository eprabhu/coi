/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AwardOverviewModalCardComponent } from './award-overview-modal-card.component';

describe('AwardOverviewModalCardComponent', () => {
  let component: AwardOverviewModalCardComponent;
  let fixture: ComponentFixture<AwardOverviewModalCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AwardOverviewModalCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AwardOverviewModalCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
