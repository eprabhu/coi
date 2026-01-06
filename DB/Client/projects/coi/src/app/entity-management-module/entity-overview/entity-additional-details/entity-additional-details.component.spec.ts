import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityAdditionalDetailsComponent } from './entity-additional-details.component';

describe('EntityAdditionalDetailsComponent', () => {
  let component: EntityAdditionalDetailsComponent;
  let fixture: ComponentFixture<EntityAdditionalDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntityAdditionalDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntityAdditionalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
