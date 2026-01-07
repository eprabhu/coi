import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AwardExpenditureByFinancialYearComponent } from './award-expenditure-by-financial-year.component';

describe('AwardExpenditureByFinancialYearComponent', () => {
  let component: AwardExpenditureByFinancialYearComponent;
  let fixture: ComponentFixture<AwardExpenditureByFinancialYearComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AwardExpenditureByFinancialYearComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AwardExpenditureByFinancialYearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
