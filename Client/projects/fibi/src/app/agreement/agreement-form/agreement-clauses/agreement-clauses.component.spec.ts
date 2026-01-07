import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgreementClausesComponent } from './agreement-clauses.component';

describe('AgreementClausesComponent', () => {
  let component: AgreementClausesComponent;
  let fixture: ComponentFixture<AgreementClausesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgreementClausesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgreementClausesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
