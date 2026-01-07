import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyNotificationComponent } from './modify-notification.component';

describe('ModifyNotificationComponent', () => {
  let component: ModifyNotificationComponent;
  let fixture: ComponentFixture<ModifyNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifyNotificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
