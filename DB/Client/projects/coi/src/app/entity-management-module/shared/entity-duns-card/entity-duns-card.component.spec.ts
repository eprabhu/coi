import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityDunsCardComponent } from './entity-duns-card.component';

describe('EntityDunsCardComponent', () => {
  let component: EntityDunsCardComponent;
  let fixture: ComponentFixture<EntityDunsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntityDunsCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntityDunsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
