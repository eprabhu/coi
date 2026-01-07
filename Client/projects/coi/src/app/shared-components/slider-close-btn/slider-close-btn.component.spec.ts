import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderCloseBtnComponent } from './slider-close-btn.component';

describe('SliderCloseBtnComponent', () => {
  let component: SliderCloseBtnComponent;
  let fixture: ComponentFixture<SliderCloseBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SliderCloseBtnComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SliderCloseBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
