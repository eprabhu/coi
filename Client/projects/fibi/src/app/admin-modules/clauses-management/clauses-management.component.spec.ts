import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClausesManagementComponent } from './clauses-management.component';

describe('ClausesManagementComponent', () => {
  let component: ClausesManagementComponent;
  let fixture: ComponentFixture<ClausesManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClausesManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClausesManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
