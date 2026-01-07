import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityCommonNotesSectionComponent } from './entity-common-notes-section.component';

describe('EntityCommonNotesSectionComponent', () => {
  let component: EntityCommonNotesSectionComponent;
  let fixture: ComponentFixture<EntityCommonNotesSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntityCommonNotesSectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntityCommonNotesSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
