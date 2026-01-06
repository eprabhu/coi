import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultingFormComponent } from './consulting-form.component';

describe('ConsultingFormComponent', () => {
  let component: ConsultingFormComponent;
  let fixture: ComponentFixture<ConsultingFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultingFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
