import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoiDisclosureDashboardCardComponent } from './coi-disclosure-dashboard-card.component';

describe('CoiDisclosureDashboardCardComponent', () => {
  let component: CoiDisclosureDashboardCardComponent;
  let fixture: ComponentFixture<CoiDisclosureDashboardCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoiDisclosureDashboardCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoiDisclosureDashboardCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
