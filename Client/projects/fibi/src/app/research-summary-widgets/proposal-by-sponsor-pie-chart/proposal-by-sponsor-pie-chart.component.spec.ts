/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ProposalBySponsorPieChartComponent } from './proposal-by-sponsor-pie-chart.component';

describe('ProposalBySponsorPieChartComponent', () => {
  let component: ProposalBySponsorPieChartComponent;
  let fixture: ComponentFixture<ProposalBySponsorPieChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProposalBySponsorPieChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProposalBySponsorPieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
