import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManpowerInterfacesComponent } from './manpower-interfaces.component';

describe('ManpowerInterfacesComponent', () => {
  let component: ManpowerInterfacesComponent;
  let fixture: ComponentFixture<ManpowerInterfacesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManpowerInterfacesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManpowerInterfacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
