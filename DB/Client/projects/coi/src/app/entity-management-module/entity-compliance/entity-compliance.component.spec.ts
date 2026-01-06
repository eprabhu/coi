import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityComplianceComponent } from './entity-compliance.component';

describe('EntityComplianceComponent', () => {
  let component: EntityComplianceComponent;
  let fixture: ComponentFixture<EntityComplianceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntityComplianceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntityComplianceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
