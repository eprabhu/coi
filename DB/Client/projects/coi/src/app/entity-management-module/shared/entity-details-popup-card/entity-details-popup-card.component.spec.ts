import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityDetailsPopupCardComponent } from './entity-details-popup-card.component';

describe('EntityDetailsPopupCardComponent', () => {
  let component: EntityDetailsPopupCardComponent;
  let fixture: ComponentFixture<EntityDetailsPopupCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntityDetailsPopupCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntityDetailsPopupCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
