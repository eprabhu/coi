import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyCustomdataMainComponent } from './modify-customdata-main.component';

describe('ModifyCustomdataComponent', () => {
  let component: ModifyCustomdataMainComponent;
  let fixture: ComponentFixture<ModifyCustomdataMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifyCustomdataMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyCustomdataMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
