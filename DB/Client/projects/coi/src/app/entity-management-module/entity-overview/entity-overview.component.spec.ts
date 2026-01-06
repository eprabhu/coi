import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityOverviewComponent } from './entity-overview.component';

describe('EntityOverviewComponent', () => {
  let component: EntityOverviewComponent;
  let fixture: ComponentFixture<EntityOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntityOverviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntityOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
