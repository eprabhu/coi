import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoiLeavePageModalComponent } from './coi-leave-page-modal.component';

describe('CoiLeavePageModalComponent', () => {
  let component: CoiLeavePageModalComponent;
  let fixture: ComponentFixture<CoiLeavePageModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoiLeavePageModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoiLeavePageModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
