/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AwardedProposalBySponsorDonutChartComponent } from './awarded-proposal-by-sponsor-donut-chart.component';

describe('AwardedProposalBySponsorDonutChartComponent', () => {
  let component: AwardedProposalBySponsorDonutChartComponent;
  let fixture: ComponentFixture<AwardedProposalBySponsorDonutChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AwardedProposalBySponsorDonutChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AwardedProposalBySponsorDonutChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
