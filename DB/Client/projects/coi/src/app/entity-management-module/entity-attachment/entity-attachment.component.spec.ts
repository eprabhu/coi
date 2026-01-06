import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityAttachmentComponent } from './entity-attachment.component';

describe('EntityAttachmentComponent', () => {
  let component: EntityAttachmentComponent;
  let fixture: ComponentFixture<EntityAttachmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntityAttachmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntityAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
