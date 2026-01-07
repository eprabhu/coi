import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotesEditSliderComponent } from './notes-edit-slider.component';

describe('NotesEditSliderComponent', () => {
  let component: NotesEditSliderComponent;
  let fixture: ComponentFixture<NotesEditSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotesEditSliderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotesEditSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
