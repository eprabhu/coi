import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResearchFundingBarChartComponent } from './research-funding-bar-chart.component';

describe('ResearchFundingBarChartComponent', () => {
  let component: ResearchFundingBarChartComponent;
  let fixture: ComponentFixture<ResearchFundingBarChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResearchFundingBarChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResearchFundingBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
