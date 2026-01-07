import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityManagementModuleComponent } from './entity-management-module.component';

describe('EntityManagementModuleComponent', () => {
  let component: EntityManagementModuleComponent;
  let fixture: ComponentFixture<EntityManagementModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntityManagementModuleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntityManagementModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
