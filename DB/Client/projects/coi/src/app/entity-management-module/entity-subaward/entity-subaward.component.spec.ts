import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntitySubawardComponent } from './entity-subaward.component';

describe('EntitySubawardComponent', () => {
  let component: EntitySubawardComponent;
  let fixture: ComponentFixture<EntitySubawardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntitySubawardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntitySubawardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
