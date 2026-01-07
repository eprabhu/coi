/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ExpenditureByBudgetCategoryInMonthsComponent } from './expenditure-by-budget-category-in-months.component';

describe('ExpenditureByBudgetCategoryInMonthsComponent', () => {
  let component: ExpenditureByBudgetCategoryInMonthsComponent;
  let fixture: ComponentFixture<ExpenditureByBudgetCategoryInMonthsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpenditureByBudgetCategoryInMonthsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenditureByBudgetCategoryInMonthsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
