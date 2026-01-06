import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleBudgetComponent } from './simple-budget.component';

describe('SimpleBudgetComponent', () => {
  let component: SimpleBudgetComponent;
  let fixture: ComponentFixture<SimpleBudgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimpleBudgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
