import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModularBudgetComponent } from './modular-budget.component';

describe('ModularBudgetComponent', () => {
  let component: ModularBudgetComponent;
  let fixture: ComponentFixture<ModularBudgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModularBudgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModularBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
