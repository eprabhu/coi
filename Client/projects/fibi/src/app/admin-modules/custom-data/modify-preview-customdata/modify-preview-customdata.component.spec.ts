import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyPreviewCustomdataComponent } from './modify-preview-customdata.component';

describe('ModifyPreviewCustomdataComponent', () => {
  let component: ModifyPreviewCustomdataComponent;
  let fixture: ComponentFixture<ModifyPreviewCustomdataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifyPreviewCustomdataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyPreviewCustomdataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
