import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDisclosureComponent } from './user-disclosure.component';

describe('UserDisclosureComponent', () => {
  let component: UserDisclosureComponent;
  let fixture: ComponentFixture<UserDisclosureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserDisclosureComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDisclosureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
